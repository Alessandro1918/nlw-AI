import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { createReadStream } from "fs"
import { openAi } from "../lib/openai"

//Gets the text transcription of an audio file from the db
//POST http://localhost:4000/videos/YOUR_VIDEO_ID/transcription
//Body: JSON: "{"prompt": "keyword1, keyword2, ..."}
export async function createTranscriptionRoute(app: FastifyInstance) {

  app.post("/videos/:videoId/transcription", async (req) => {
    
    const paramsSchema = z.object({
      videoId: z.string().uuid()
    })
    const { videoId } = paramsSchema.parse(req.params)
    
    const bodySchema = z.object({
      prompt: z.string()
    })
    const { prompt } = bodySchema.parse(req.body)

    //From the videoId, read the file from my db
    const video = await prisma.video.findFirstOrThrow({
      where: {
        id: videoId
      }
    })
    const videoPath = video.path
    const audioStream = createReadStream(videoPath)

    const response = await openAi.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      language: "pt",
      response_format: "json",  //TODO - test: "verbose_json"
      temperature: 0,
      prompt: prompt
    })
    const transcription = response.text

    await prisma.video.update({
      where: {
        id: videoId
      },
      data: {
        transcription
      }
    })

    //TODO - Here I could delete the audio file from my temp folder
    //(the db entry "path" would point to null, but I already saved the transcription)

    return {
      id: videoId,
      prompt,
      path: videoPath,
      transcription
    }
  })
}