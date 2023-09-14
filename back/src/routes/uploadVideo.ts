import { FastifyInstance } from "fastify"
import { fastifyMultipart } from "@fastify/multipart"
import { prisma } from "../lib/prisma"
import path from "path"
import { randomUUID } from "crypto"
import fs from "fs"
import { pipeline } from "stream"
import { promisify } from "util"

const pump = promisify(pipeline)

//Upload a mp3 file to the server (front will get a mp4 file and send it's mp3 here)
//POST http://localhost:4000/videos
//Body: Multipart form request with mp3 file (no special field name necessary)
export async function uploadVideoRoute(app: FastifyInstance) {

  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25    //1MB * 25 = 25MB
    }
  })

  app.post("/videos", async (request, reply) => {
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({error: "Missing file input"})
    }

    const fileExtension = path.extname(data.filename)     //".mp3"
    if (fileExtension !== ".mp3") {
      return reply.status(400).send({error: "Invalid file input; please upload a MP3"})
    }

    const fileBaseName = path.basename(data.filename, fileExtension)      //"example.mp3"
    const newFileName = `${fileBaseName}-${randomUUID()}${fileExtension}` //"example-52AF4206-A0....mp3"
    const uploadedDestination = path.resolve(__dirname, "../../temp", newFileName)

    //await for the file "data.file" to write it's stream to fs @ destination:
    await pump(data.file, fs.createWriteStream(uploadedDestination))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadedDestination
      }
    })

    return { video }
  })
}