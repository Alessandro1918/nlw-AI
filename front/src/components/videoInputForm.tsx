import { ChangeEvent, useMemo, useState } from "react";
import { FileVideo, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export function VideoInputForm() {

  const [ videoFile, setVideoFile ] = useState<File | null>(null)

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget
    if (!files) {
      return
    }
    setVideoFile(files[0])
  }

  const previewUrl = useMemo(() => {
    if (!videoFile) {
      return null
    }
    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form className="space-y-6">
      <label 
        htmlFor="video" 
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {
          previewUrl
          ? <video src={previewUrl} controls={false} className="pointer-events-none absolute inset-0" />
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
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras chave mencionadas no vídeo, separadas por vírgula."
        >
        </Textarea>
      </div>
      <Button type="submit" className="w-full">
        Carregar vídeo
        <Upload className="w-4 h-4 ml-2"/>
      </Button>
    </form>
  )
}