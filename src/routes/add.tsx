import { createFileRoute } from "@tanstack/react-router";
import { Camera, ImagePlus, Mic, SendHorizontal, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { parseNote, type Draft } from "@/lib/listing";
import { SHOP_DOMAIN } from "@/lib/shopify";

export const Route = createFileRoute("/add")({
  head: () => ({ meta: [
    { title: "Add item — EasyStock AI" },
    { name: "description", content: "Chat your way to a new listing: snap a photo and describe it." },
    { property: "og:title", content: "Add item — EasyStock AI" },
    { property: "og:description", content: "Chat your way to a new listing: snap a photo and describe it." },
  ] }),
  component: AddItem,
});

type Msg = { from: "bot" | "me"; text?: string; image?: string; draft?: Draft };
type SR = { start: () => void; stop: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; lang: string };
const HELLO: Msg[] = [{ from: "bot", text: "Hi! Let's add a new item. First, send me a photo — take one now or upload from your gallery." }];

function AddItem() {
  const [msgs, setMsgs] = useState<Msg[]>(HELLO);
  const [step, setStep] = useState<"photo" | "details" | "done">("photo");
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const rec = useRef<SR | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLInputElement>(null);
  const gal = useRef<HTMLInputElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const push = (...m: Msg[]) => setMsgs((x) => [...x, ...m]);
  const bot = (m: Msg) => setTimeout(() => push(m), 450);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      push({ from: "me", image: r.result as string });
      setStep("details");
      bot({ from: "bot", text: "Great shot! Now tell me about it — name, sizes, price and how many. Type or tap the mic. e.g. “Olive tee, S-L, $48, 3 each”" });
    };
    r.readAsDataURL(f);
  };

  const send = () => {
    const t = text.trim(); if (!t) return;
    setText(""); push({ from: "me", text: t });
    if (step === "photo") { bot({ from: "bot", text: "Got it — I'll still need a photo first. Use the buttons below." }); return; }
    const draft = parseNote(t);
    setStep("done");
    bot({ from: "bot", text: "Here's your listing. Want to change anything? Just send a new description.", draft });
  };

  const toggleVoice = () => {
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) { push({ from: "bot", text: "Voice isn't supported in this browser — please type instead." }); return; }
    if (listening) { rec.current?.stop(); return; }
    const r = new Ctor(); r.lang = "en-US";
    r.onresult = (e) => setText(Array.from(e.results).map((x) => x[0]?.transcript ?? "").join(" "));
    r.onend = () => setListening(false);
    rec.current = r; r.start(); setListening(true);
  };

  const restart = () => { setMsgs(HELLO); setStep("photo"); };

  return (
    <AppShell title="Add item" subtitle="Chat with your stock assistant" right={step !== "photo" ? <button onClick={restart} className="rounded-full border bg-card px-3 py-1.5 text-xs">New</button> : undefined}>
      <div className="space-y-3 pb-40">
        {msgs.map((m, i) => <Bubble key={i} me={m.from === "me"}>
          {m.image && <img src={m.image} alt="Item" className="max-h-64 rounded-2xl object-cover" />}
          {m.text && <p>{m.text}</p>}
          {m.draft && <DraftCard d={m.draft} />}
        </Bubble>)}
        <div ref={end} />
      </div>

      <input ref={cam} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={gal} type="file" accept="image/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />

      <div className="fixed inset-x-4 bottom-24 mx-auto max-w-[26rem] space-y-2">
        {step === "photo" && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => cam.current?.click()} className="bg-gradient-brand flex items-center justify-center gap-2 rounded-2xl py-3 font-medium text-primary-foreground"><Camera className="h-5 w-5" />Take photo</button>
            <button onClick={() => gal.current?.click()} className="flex items-center justify-center gap-2 rounded-2xl border bg-card py-3 font-medium"><ImagePlus className="h-5 w-5" />Upload</button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border bg-card p-1.5 pl-4">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={listening ? "Listening…" : "Describe your item…"} className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />
          <button onClick={toggleVoice} aria-label="Voice" className={`rounded-full p-2.5 ${listening ? "animate-pulse bg-accent text-accent-foreground" : "text-muted-foreground"}`}><Mic className="h-5 w-5" /></button>
          <button onClick={send} aria-label="Send" className="bg-gradient-brand rounded-full p-2.5 text-primary-foreground"><SendHorizontal className="h-5 w-5" /></button>
        </div>
      </div>
    </AppShell>
  );
}

function Bubble({ me, children }: { me: boolean; children: ReactNode }) {
  return <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-[85%] space-y-2 rounded-3xl px-4 py-3 text-[15px] leading-relaxed ${me ? "bg-gradient-brand rounded-br-lg text-primary-foreground" : "rounded-bl-lg border bg-card"}`}>{children}</div>
  </div>;
}

function DraftCard({ d }: { d: Draft }) {
  return <div className="rounded-2xl bg-secondary p-3">
    <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-accent"><Sparkles className="h-3.5 w-3.5" />Listing</p>
    <p className="font-semibold">{d.title}</p>
    <p className="text-gradient font-semibold">${d.price.toFixed(2)}</p>
    <div className="mt-2 flex flex-wrap gap-1.5">{Object.entries(d.sizes).map(([s, q]) => <span key={s} className="rounded-full bg-background px-2.5 py-0.5 text-xs">{s} × {q}</span>)}</div>
    <a href={`https://${SHOP_DOMAIN}/admin/products/new`} target="_blank" rel="noreferrer" className="bg-gradient-brand mt-3 block rounded-xl py-2.5 text-center text-sm font-medium text-primary-foreground">Open in Shopify</a>
  </div>;
}
