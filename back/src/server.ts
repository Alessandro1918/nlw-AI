import { fastify } from "fastify"
import { getAllPromptsRoute } from "./routes/getAllPrompts"
import { uploadVideoRoute } from "./routes/uploadVideo"

const PORT = Number(process.env.PORT) || 4000

const app = fastify()

app.register(getAllPromptsRoute)
app.register(uploadVideoRoute)


app.listen({
  port: PORT
}).then(() => {
  console.log(`Server running on http://localhost:${PORT}`)
})