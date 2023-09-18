import { Wand2 } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Slider } from "./ui/slider";
import { PromptSelect } from "./promptSelect";

interface SettingsProps {
  onPromptSelect: (template: string) => void 
  temperature: number
  setTemperature: (temperature: number) => void
}

export function SettingsForm(props: SettingsProps) {

  return (
    <form className="space-y-6">

      <div className="space-y-2">
        <Label>Prompt</Label>
        <PromptSelect onPromptSelect={props.onPromptSelect}/>
      </div>

      <div className="space-y-2">
        <Label>Modelo</Label>
        <Select disabled defaultValue="gpt3.5">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt3.5">GPT 3.5 turbo 16K</SelectItem>
          </SelectContent>
        </Select>
        <span className="block text-xs text-muted-foreground italic">
          Você poderá customizar essa opção em breve!
        </span>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Temperatura</Label>

        <Slider 
          min={0} max={1} step={0.1} 
          value={[props.temperature]}   //slider can be used to pick a range, so it will store 2 values
          onValueChange={value => props.setTemperature(value[0])}
        />

        <span className="block text-xs text-muted-foreground italic leading-relaxed">
          Valores mais altos tendem a deixar o resultado mais criativo, mas com possíveis erros.
        </span>
      </div>

      <Separator />

      <Button 
        type="submit" 
        className="w-full"
      >
        Executar
        <Wand2 className="w-4 h-4 ml-2"/>
      </Button>
    </form>
  )
}