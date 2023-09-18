import { FastifyInstance } from "fastify"
import { z } from "zod"
import { streamToResponse, OpenAIStream } from "ai"
import { prisma } from "../lib/prisma"
import { openAi } from "../lib/openai"

//Generates AI content, based on the provided prompt, from a video transcription from the db
//POST http://localhost:4000/ai/generate
//Body: JSON:
// {
//   "videoId": "YOUR_VIDEO_ID",
//   "temperature": 0.5,
//   "prompt": "Gere um resumo da transcrição do vídeo informada a seguir: '''{transcription}'''"
// }
export async function createAiContentRoute(app: FastifyInstance) {

  app.post("/ai/generate", async (req, reply) => {
    
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      temperature: z.number().min(0).max(1).default(0.5),
      prompt: z.string()
    })
    const { videoId, temperature, prompt } = bodySchema.parse(req.body)

    const video = await prisma.video.findFirstOrThrow({
      where: {
        id: videoId
      }
    })

    if (!video.transcription) {
      return reply.status(400).send("Video transcription not generated yet")
    }

    const promptMessgae = prompt.replace('{transcription}', video.transcription)

    const response = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature,
      messages: [
        {role: "user", content: promptMessgae}
      ],
      stream: true
    })

    // return {
    //   videoId, temperature, prompt, promptMessgae, response
    // }

    const stream = OpenAIStream(response)

    streamToResponse(stream, reply.raw, {
      //CORS:
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
      }
    })
  })
}