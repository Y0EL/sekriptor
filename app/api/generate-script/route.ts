import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Type definitions for Gemini AI responses
interface GroundingSource {
  title?: string
  snippet?: string
  url?: string
  score?: number
}

interface GroundingMetadata {
  sources: GroundingSource[]
}

interface GeminiResponse {
  text: () => string
  groundingMetadata?: GroundingMetadata
}

interface GenerativeModel {
  generateContent: (
    prompt: string | GenerationPrompt
  ) => Promise<{ response: GeminiResponse }>
}

interface GenerationPrompt {
  contents: string
  tools?: string[]
  generationConfig?: {
    temperature?: number
    topK?: number
    topP?: number
  }
}

// Initialize Gemini AI with error handling
const initializeGeminiAI = () => {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured')
  }
  return new GoogleGenerativeAI(apiKey)
}

// Content types configuration
const contentTypes = {
  video: {
    structure: "opening, isi konten, closing",
    style: "energetic, engaging, visual-focused",
    searchKeywords: (title: string) => [
      `${title} latest news`,
      `${title} viral content`,
      `${title} trending topics`,
      `${title} facts and statistics`
    ]
  },
  podcast: {
    structure: "intro, pembahasan, kesimpulan",
    style: "conversational, natural flow, detail-oriented",
    searchKeywords: (title: string) => [
      `${title} discussion points`,
      `${title} expert opinions`,
      `${title} recent developments`,
      `${title} industry insights`
    ]
  },
  article: {
    structure: "headline, pembuka, isi, penutup",
    style: "narrative, well-researched, engaging",
    searchKeywords: (title: string) => [
      `${title} research`,
      `${title} analysis`,
      `${title} statistics`,
      `${title} case studies`
    ]
  }
} as const

// Model configuration
const getModel = (genAI: GoogleGenerativeAI): GenerativeModel => {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 60,
      maxOutputTokens: 5012,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  })
}

// Clean and format the generated script
function cleanScript(script: string): string {
  return script
    .replace(/[*#]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim()
}

// Function to get grounded content using search
async function getGroundedContent(
  model: GenerativeModel,
  title: string,
  contentType: keyof typeof contentTypes
): Promise<GroundingSource[]> {
  const searchQueries = contentTypes[contentType].searchKeywords(title)
  
  try {
    const groundingPrompt: GenerationPrompt = {
      contents: searchQueries.join(' AND '),
      tools: ['google_search_retrieval'],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 0.8,
      }
    }

    const groundingResponse = await model.generateContent(groundingPrompt)
    return groundingResponse.response.groundingMetadata?.sources || []
    
  } catch (error) {
    console.error('Error getting grounded content:', error)
    return []
  }
}

// Generate enhanced prompt with grounding
async function generatePrompt(
  model: GenerativeModel,
  title: string,
  reason: string,
  contentType: keyof typeof contentTypes
): Promise<string> {
  const groundedSources = await getGroundedContent(model, title, contentType)
  const typeInfo = contentTypes[contentType]
  
  const groundedInfo = groundedSources.length > 0
    ? `\nGrounded Facts:\n${groundedSources
        .map(source => `- ${source.snippet || source.title}`)
        .join('\n')}`
    : ''

  return `
    Context: Kamu adalah Yoel, content creator digital dengan jutaan subscriber.
    Target Audience: Gen Z dan Millennials Indonesia yang suka konten informatif tapi menghibur.
    
    Content Brief:
    - Judul: "${title}"
    - Alasan: "${reason}"
    - Tipe Konten: ${contentType}
    - Struktur: ${typeInfo.structure}
    - Gaya: ${typeInfo.style}
    
    ${groundedInfo}
    
    Guidelines:
    1. Gunakan data dan fakta dari Grounded Facts di atas untuk mendukung konten
    2. Gunakan bahasa gaul Indonesia yang natural dan relatable
    3. Sisipkan humor sarkastik yang cerdas tapi tetap berbasis fakta
    4. Keseimbangan: 70% informasi faktual, 30% entertainment
    5. Buat audiens relate dengan "oh anjir bener juga" moments
    6. Hindari: basa-basi, bahasa formal, jokes offensive
    
    Format output dalam bentuk script ${contentType} natural, bukan poin-poin.
    Pastikan transisi antar bagian smooth dan masuk akal.
    PENTING: Selalu sisipkan fakta-fakta dari Grounded Facts dalam cara yang natural.`
}

// Type definitions for request/response
type ContentType = keyof typeof contentTypes

interface RequestBody {
  title: string
  reason: string
  contentType: ContentType
}

interface ResponseMetadata {
  contentType: ContentType
  timestamp: string
  hasGrounding: boolean
  groundingSources: GroundingSource[]
}

interface SuccessResponse {
  success: true
  script: string
  metadata: ResponseMetadata
}

interface ErrorResponse {
  success: false
  error: string
}

// Main API handler
export async function POST(req: Request): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const genAI = initializeGeminiAI()
    const model = getModel(genAI)
    
    const body: RequestBody = await req.json()
    const { title, reason, contentType } = body

    if (!title || !reason || !contentType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields. Please provide title, reason, and contentType.'
      }, { status: 400 })
    }

    if (!(contentType in contentTypes)) {
      return NextResponse.json({
        success: false,
        error: `Invalid content type. Supported types: ${Object.keys(contentTypes).join(', ')}`
      }, { status: 400 })
    }

    const prompt = await generatePrompt(model, title, reason, contentType)
    const result = await model.generateContent(prompt)
    const response = result.response

    if (!response?.text) {
      throw new Error('Invalid or empty response from Gemini AI')
    }

    const cleanedScript = cleanScript(response.text())

    return NextResponse.json({
      success: true,
      script: cleanedScript,
      metadata: {
        contentType,
        timestamp: new Date().toISOString(),
        hasGrounding: true,
        groundingSources: response.groundingMetadata?.sources || []
      }
    })

  } catch (error) {
    console.error('Error in content generation:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
