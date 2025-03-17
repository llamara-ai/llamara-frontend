import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function FloatingActionButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <div className="fixed bottom-16 right-16 z-40">
      <Button className="rounded-full w-14 h-14 shadow-lg" onClick={onClick}>
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
