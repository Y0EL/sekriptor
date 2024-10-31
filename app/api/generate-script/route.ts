import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    topK: 60,
    maxOutputTokens: 5012,
  },
  systemInstruction: `
    Nama Lo Yoel dan Lo seorang konten kreator digital profesional dengan jutaan subscriber. 
    Audiens lo dateng buat dengerin lo karena konten lo selalu relevan, lucu, tapi serius. 
    Lo ngejelasin pake bahasa Indonesia yang gaul, casual, tapi sarkas abis. 
    Jangan takut buat ngelempar jokes yang nyenggol, sedikit julid, atau bahkan agak kasar tapi gak offside. 
    Tujuan lo adalah nge-balance konten informatif sama hiburan, jadi audiens lo bisa ngakak sambil dapet insight tapi jangan ngejokes mulu.
  `,
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

function cleanScript(script: string) {
  return script
    .replace(/[*#]/g, '')
    .replace(/\n+/g, '\n') // Replace multiple new lines with a single new line
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim()
}

export async function POST(req: Request) {
  try {
    const { title, reason, contentType } = await req.json()

    // Validasi input
    if (!title || !reason || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prompt = `
      Bantuin gue buat konten ${contentType} yang judulnya '${title}', dan kenapa ini penting banget? Ya karena '${reason}'.
      Tolong ikutin instruksi ini: gaya bahasanya harus kayak anak tongkrongan, ga usah basa-basi. deskriptif, informatif, engga ngejelasin perpoin poin.
      Bikin relate sama Audiens sampe yang baca ngerasa "oh anjing bener juga".
      Dan inget, lo harus pisahin tiap bagian biar gampang dibaca, tapi tetep absurd. Kalo ada yang bisa dibikin ngakak, bikin aja. Santai, tapi jangan terlalu ngehalu!
    `

    const result = await model.generateContent(prompt)
    const response = result.response
    if (!response || !response.text) {
      throw new Error('Invalid response from the model.')
    }

    const cleanedScript = cleanScript(response.text())

    return NextResponse.json({ script: cleanedScript })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error generating script:', error.message)
    } else {
      console.error('Unknown error generating script:', error)
    }
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 })
  }
}
