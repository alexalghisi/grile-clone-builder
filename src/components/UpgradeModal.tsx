import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Lock, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function UpgradeModal({ open, onClose, title, description }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--gradient-hero)] text-white shadow-[var(--shadow-glow)]">
            <Lock className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center text-xl">
            {title ?? "Conținut Premium"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description ?? "Această simulare face parte din planul Premium. Deblochează acces complet la toate simulările cronometrate cu rezolvare pas cu pas."}
          </DialogDescription>
        </DialogHeader>
        <ul className="my-4 space-y-2 text-sm">
          {[
            "Toate simulările cronometrate (UPB, UB, UMF…)",
            "Rezolvări complete pas cu pas",
            "Capitole tematice și planuri personalizate",
            "Anulează oricând",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-primary shrink-0" /> {f}
            </li>
          ))}
        </ul>
        <Link to="/preturi" onClick={onClose}>
          <Button className="w-full h-11 bg-[var(--gradient-hero)] shadow-[var(--shadow-glow)] hover:opacity-95">
            Vezi planurile Premium
          </Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
}