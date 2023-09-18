import { Github } from "lucide-react";
import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import { Textarea } from "./components/ui/textarea";
import { VideoInputForm } from "./components/videoInputForm";
import { SettingsForm } from "./components/settingsForm";
import { useState } from "react";

export function App() {

  const [ videoId, setVideoId ] = useState<string> ('')
  const [ selectedPrompt, setSelectedPrompt ] = useState('')
  const [ temperature, setTemperature ] = useState(0.5)

  function handlePromptSelect(template: string) {
    setSelectedPrompt(template)
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">upload.ai</h1>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Desenvolvido com 🧡 no NLW da Rocketseat
          </span>

          <Separator orientation="vertical" className="h-6"/>

          <Button variant="outline">
            <Github className="w-4 h-4 me-2"/>
            Github
          </Button>
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 p-6 flex gap-6">
        
        {/* Left side */}
        <div className="flex flex-col flex-1 gap-4">

          {/* Text Areas */}
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea 
              placeholder="Inclua o prompt para a IA:"
              className="resize-none p-4 leading-relaxed"
              defaultValue={selectedPrompt}
            />
            <Textarea 
              placeholder="Resultado gerado pela IA" 
              className="resize-none p-4 leading-relaxed"
              readOnly
            />
          </div>

          {/* Helper note */}
          <p className="text-sm text-muted-foreground">
            Lembre-se: você pode utilizar a variável <code className="text-violet-400">{"{transcription}"}</code> no seu prompt para adicionar o conteúdo da transcrição do vídeo selecionado.
          </p>
        </div>

        {/* Right side */}
        <aside className="w-80 space-y-6">

          <VideoInputForm 
            onVideoUploaded={setVideoId}
          />
          
          <Separator />

          <SettingsForm 
            onPromptSelect={handlePromptSelect}
            temperature={temperature}
            setTemperature={setTemperature}
          />
          
        </aside>
      </main>
    </div>
  )
}