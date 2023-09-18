import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { FileVideo, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { loadFfmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios";

type StatusOptions =  "waiting" | "converting" | "uploading" | "generating" | "success"

const statusMessages = {
  converting: 'Convertendo...',
  uploading: 'Carregando...',
  generating: 'Transcrevendo...',
  success: 'Sucesso!',
}

interface VideoInputProps {
  onVideoUploaded: (videoId: string) => void
}

export function VideoInputForm(props: VideoInputProps) {

  const [ videoFile, setVideoFile ] = useState<File | null>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)
  const [ status, setStatus ] = useState<StatusOptions>("waiting")

  //Save selected file to the state
  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget
    if (!files) {
      return
    }
    setVideoFile(files[0])
  }

  //Display video thumbnail
  const previewUrl = useMemo(() => {
    if (!videoFile) {
      return null
    }
    return URL.createObjectURL(videoFile)
  }, [videoFile])

  //Converto mp4 video to mp3 audio (client-side)
  async function convertVideoToAudio(video: File) {
    console.log('Convert started.')

    const ffmpeg = await loadFfmpeg()

    //Add file to the ffmpeg container context
    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    // ffmpeg.on('log', log => {
    //   console.log(log)
    // })

    ffmpeg.on('progress', progress => {
      console.log(`Convert progress: ${Math.round(progress.progress * 100)}%`)
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '64k',  //v1: 20k
      '-acodec',
      'libmp3lame',
      'output.mp3'
    ])

    //Returns a "FileData" file type
    const data = await ffmpeg.readFile('output.mp3')

    //Converts "FileData" to "JS File"
    const audioFileBlob = new Blob([data], { type: 'audio/mp3' })
    // const audioFile = new File([audioFileBlob], 'output.mp3', {
    const audioFile = new File([audioFileBlob], video.name.replace(".mp4", ".mp3"), {
      type: 'audio/mpeg'
    })

    console.log('Convert finished.')

    return audioFile
  }

  //Calls "convertVideoToAudio", and sends the mp3 file to the back's database.
  //Then, generates that audio transcription.
  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const prompt = promptInputRef.current?.value

    if (!videoFile) {
      return
    }

    setStatus("converting")

    const audioFile = await convertVideoToAudio(videoFile)
    // console.log(audioFile)

    //Setup multipart form for the req's body
    const data = new FormData()
    data.append('file', audioFile)

    setStatus("uploading")

    const response = await api.post('/videos', data)
    // console.log(response.data)

    const videoId = response.data.video.id

    setStatus("generating")

    await api.post(`/videos/${videoId}/transcription`, {
      prompt,
    })

    setStatus("success")

    props.onVideoUploaded(videoId)
  }

  return (
    <form className="space-y-6" onSubmit={handleUploadVideo}>
      <label 
        htmlFor="video" 
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {
          previewUrl
          ? <video 
              src={previewUrl} 
              controls={false} 
              className="pointer-events-none absolute inset-0 max-h-full" 
            />
          : (
            <>
              <FileVideo className="w-4 h-4"/>
              Selecione um video:
            </>
          )
        }
        
      </label>
      <input 
        type="file" 
        id="video" 
        accept="video/mp4" 
        className="sr-only"
        onChange={handleFileSelected}
      />

      <Separator />

      <div className="space-y-2">
        <Label
          htmlFor="transcription_prompt"
        >
          Prompt de transcrição
        </Label>
        <Textarea
          ref={promptInputRef}
          id="transcription_prompt"
          disabled={status !== "waiting"}
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras chave mencionadas no vídeo, separadas por vírgula."
        >
        </Textarea>
      </div>
      <Button 
        type="submit" 
        data-success={status === "success"}
        className="w-full data-[success=true]:bg-emerald-400"
        disabled={status !== "waiting"}
      >
        {
          status === "waiting"
          ? <>
              Carregar vídeo
              <Upload className="w-4 h-4 ml-2"/>
            </>
          : statusMessages[status]
        }
      </Button>
    </form>
  )
}