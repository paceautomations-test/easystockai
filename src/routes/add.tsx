import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Mic, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { addProduct, parseNote } from "@/lib/store";

export const Route = createFileRoute("/add")({
  head: () => ({ meta: [
    { title: "Add item — EasyStock AI" },
    { name: "description", content: "Photo plus a quick note turns into a ready listing." },
    { property: "og:title", content: "Add item — EasyStock AI" },
    { property: "og:description", content: "Photo plus a quick note turns into a ready listing." },
  ] }),
  component: AddItem,
});

type SR = { start: () => void; stop: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; lang: string };

function AddItem() {
  const nav = useNavigate();
  const [image, setImage] = useState<string>();
  const [note, setNote] = useState("");
  const [listening, setListening] = useState(false);
  const rec = useRef<SR | null>(null);
  const draft = parseNote(note);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas"); const s = 400 / Math.max(img.width, img.height);
        c.width = img.width * s; c.height = img.height * s;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        setImage(c.toDataURL("image/jpeg", 0.7));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(f);
  };

  const toggleVoice = () => {
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) { alert("Voice notes aren't supported in this browser. Please type instead."); return; }
    if (listening) { rec.current?.stop(); return; }
    const r = new Ctor(); r.lang = "en-US";
    r.onresult = (e) => setNote(Array.from(e.results).map((x) => x[0].transcript).join(" "));
    r.onend = () => setListening(false);
    rec.current = r; r.start(); setListening(true);
  };

  const save = () => {
    addProduct({ id: crypto.randomUUID(), image, createdAt: Date.now(), ...draft });
    nav({ to: "/" });
  };

  return (
    <AppShell title="Add a new item">
      <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-accent bg-secondary">
        {image ? <img src={image} alt="Item" className="h-full w-full object-cover" /> : (<><Camera className="mb-2 h-12 w-12 text-accent" /><span className="font-semibold text-primary">Tap to take a photo</span></>)}
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>

      <p className="mb-2 mt-5 text-sm font-semibold">Describe it</p>
      <div className="flex gap-2">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder='e.g. "Olive tee, S-L, $48, 3 each"' className="flex-1 rounded-2xl border bg-card p-3 text-base outline-none focus:border-accent" />
        <button onClick={toggleVoice} aria-label="Voice note" className={`flex w-14 items-center justify-center rounded-2xl ${listening ? "animate-pulse bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}><Mic className="h-6 w-6" /></button>
      </div>

      {note && (
        <div className="mt-5 rounded-2xl bg-primary p-4 text-primary-foreground">
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent"><Sparkles className="h-4 w-4" />Listing preview</p>
          <p className="text-lg font-bold">{draft.title}</p>
          <p className="text-accent">${draft.price.toFixed(2)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(draft.sizes).map(([s, q]) => <span key={s} className="rounded-full bg-primary-foreground/15 px-3 py-1 text-sm">{s} × {q}</span>)}
          </div>
        </div>
      )}

      <button disabled={!note} onClick={save} className="mt-6 w-full rounded-full bg-accent py-4 text-lg font-bold text-accent-foreground disabled:opacity-40">Save to inventory</button>
    </AppShell>
  );
}
