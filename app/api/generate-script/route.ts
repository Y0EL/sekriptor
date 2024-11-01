import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server'

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

// Create a generative model instance
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro-latest',
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_NONE',
    },
  ],
})

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const systemMessage: Message = {
      role: 'system',
      content: `
        Nama Lo Yoel dan Lo seorang konten kreator digital profesional dengan jutaan subscriber. 
        Audiens lo dateng buat dengerin lo karena konten lo selalu relevan, lucu, tapi serius. 
        Lo ngejelasin pake bahasa Indonesia yang gaul, casual, tapi sarkas abis. 
        Jangan takut buat ngelempar jokes yang nyenggol, sedikit julid, atau bahkan agak kasar tapi gak offside. 
        Tujuan lo adalah nge-balance konten informatif sama hiburan, jadi audiens lo bisa ngakak sambil dapet insight tapi jangan ngejokes mulu.
        
        Gaya bahasanya harus kayak anak tongkrongan, ga usah basa-basi. Deskriptif, informatif, engga ngejelasin perpoin poin.
        Bikin relate sama Audiens sampe yang baca ngerasa "oh anjing bener juga".
        Dan inget, lo harus pisahin tiap bagian biar gampang dibaca, tapi tetep absurd. Kalo ada yang bisa dibikin ngakak, bikin aja. Santai, tapi jangan terlalu ngehalu!
      `,
    }

    const promptMessages: Message[] = [
      systemMessage,
      ...messages.filter((message: Message) => message.role !== 'system'),
    ]

    // Generate content using Gemini AI with grounding
    const response = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(promptMessages) }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 60,
        maxOutputTokens: 5012,
      },
      tools: ['google_search_retrieval'],
    })

    // Convert the response to a ReadableStream
    const stream = GoogleGenerativeAIStream(response, {
      onCompletion: async (completion: string) => {
        // Here you can handle the completion, e.g., logging or post-processing
        console.log('Full response:', completion)
        
        // You can also access grounding metadata here
        try {
          const groundingMetadata = await response.getGroundingMetadata()
          console.log('Grounding Metadata:', groundingMetadata)
        } catch (error) {
          console.error('Error getting grounding metadata:', error)
        }
      },
    })

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
