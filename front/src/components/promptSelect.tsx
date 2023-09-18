import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api } from "@/lib/axios";

interface PromptProps {
  id: string
  title: string
  template: string
}

interface PromptSelectProps {
  onPromptSelect: (template: string) => void 
}

export function PromptSelect(props: PromptSelectProps) {

  const [ prompts, setPrompts ] = useState<PromptProps[] | null>(null)

  useEffect(()=> {
    api
      .get("/prompts")
      .then(response => setPrompts(response.data))
  }, [])

  function handlePromptSelected(promptId: string) {
 
    const selectedPrompt = prompts?.find(prompt => prompt.id === promptId)

    if (!selectedPrompt) return

    props.onPromptSelect(selectedPrompt.template)
  }

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um prompt" />
      </SelectTrigger>
      <SelectContent>
        {
          prompts?.map(prompt => {
            return (
              <SelectItem 
                key={prompt.id} 
                value={prompt.id}   //what I will pass to "onValueChange" function
              >
                {prompt.title}
              </SelectItem>
            )
          })
        }
      </SelectContent>
    </Select>
  )
}