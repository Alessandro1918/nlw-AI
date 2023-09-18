import { fastify } from "fastify"
import { fastifyCors }  from "@fastify/cors"
import { getAllPromptsRoute } from "./routes/getAllPrompts"
import { uploadVideoRoute } from "./routes/uploadVideo"
import { createTranscriptionRoute } from "./routes/createTranscription"
import { createAiContentRoute } from "./routes/createAiContentRoute"

const PORT = Number(process.env.PORT) || 4000

const app = fastify()

app.register(fastifyCors, {
  origin: "*"
})

app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)
app.register(createAiContentRoute)

app.listen({
  port: PORT
}).then(() => {
  console.log(`Server running on http://localhost:${PORT}`)
})