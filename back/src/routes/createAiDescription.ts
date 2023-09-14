import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { openAi } from "../lib/openai"

//Gets the text transcription of an audio file from the db
//POST http://localhost:4000/ai/description
//Body: JSON:
// {
//   "videoId": "YOUR_VIDEO_ID",
//   "temperature": 0.5,
//   "template": "Gere um resumo da transcrição do vídeo informada a seguir: '''{transcription}'''"
// }
export async function createAiDescriptionRoute(app: FastifyInstance) {

  app.post("/ai/description", async (req, reply) => {
    
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      temperature: z.number().min(0).max(1).default(0.5),
      template: z.string()
    })
    const { videoId, temperature, template } = bodySchema.parse(req.body)

    const video = await prisma.video.findFirstOrThrow({
      where: {
        id: videoId
      }
    })

    if (!video.transcription) {
      return reply.status(400).send("Video transcription not generated yet")
    }

    const prompt = template.replace('{transcription}', video.transcription)

    const response = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature,
      messages: [
        {role: "user", content: prompt}
      ]
    })

    return {
      videoId, temperature, template, prompt, response
    }
  })
}