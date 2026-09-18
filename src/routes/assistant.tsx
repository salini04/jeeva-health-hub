import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Disclaimer } from "@/components/Disclaimer";
import { uid, useApp } from "@/lib/store";
import { bmiFrom } from "@/services/mlService";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Jeeva Assistant — Jeeva" },
      { name: "description", content: "Chat with Jeeva Assistant, a health educator that explains vitals, habits and risk scores in plain language." },
      { property: "og:title", content: "Jeeva Assistant — Jeeva" },
      { property: "og:description", content: "Ask health questions and get clear, safe, educational answers." },
    ],
  }),
  component: Assistant,
});

const starters = [
  "What does my BMI actually mean?",
  "How can I lower my blood pressure naturally?",
  "Explain my heart risk score",
  "How much water should I drink daily?",
  "Tips for better sleep as a student",
];

function answer(q: string, ctx: { bmi: number; systolic: number; diastolic: number; heart?: number }): string {
  const t = q.toLowerCase();
  if (t.includes("bmi"))
    return `Your BMI is about **${ctx.bmi.toFixed(1)}**. BMI compares weight to height: under 18.5 is underweight, 18.5-24.9 healthy, 25-29.9 overweight and 30+ obese. It's a rough screening number — it can't tell muscle from fat, so read it alongside waist size and activity.`;
  if (t.includes("blood pressure") || t.includes("bp"))
    return `Your latest reading is **${ctx.systolic}/${ctx.diastolic} mmHg** (optimal is around 120/80). Habits that help: lower salt, 30 minutes of movement most days, limit alcohol, sleep 7-8 hours and manage stress. Persistent readings above 140/90 should be reviewed by a doctor.`;
  if (t.includes("risk") && t.includes("heart"))
    return ctx.heart !== undefined
      ? `Your latest heart screening estimated **${ctx.heart}%**. That number reflects your age, blood pressure, cholesterol, BMI and habits. The good news: blood pressure, weight, smoking and activity are all modifiable — small consistent changes move the score.`
      : `You haven't run the heart screening yet. Open Risk assessment → Heart disease risk; your profile values are prefilled, so it takes a few seconds.`;
  if (t.includes("water") || t.includes("hydrat"))
    return `A common guide is **2-3 litres a day** for most adults, more in heat or with exercise. Pale-yellow urine is a decent everyday signal. Spread intake through the day rather than drinking a lot at once.`;
  if (t.includes("sleep"))
    return `Aim for **7-9 hours**. What helps most: a consistent wake time, daylight early, no caffeine after mid-afternoon, and screens dimmed an hour before bed. If you're sleepy all day despite enough hours, mention it to a doctor.`;
  if (t.includes("diabet") || t.includes("sugar") || t.includes("glucose"))
    return `Fasting glucose under 100 mg/dL is normal, 100-125 suggests prediabetes and 126+ on repeat testing suggests diabetes. Weight loss of 5-7%, regular walking and cutting sugary drinks are the most effective everyday levers. Any abnormal value needs a doctor's confirmation.`;
  if (t.includes("stress") || t.includes("anxiet"))
    return `Short daily practices help: 5 minutes of slow breathing, a walk outdoors, and protecting sleep. If stress affects your studies, appetite or sleep for more than two weeks, talking to a counsellor or psychiatrist is a good step, not an extreme one.`;
  return `Here's what I can help with: explaining vitals like blood pressure, BMI, glucose and heart rate, understanding your risk scores, and building better daily habits around food, movement, sleep and hydration.\n\nI can't diagnose conditions, interpret scans or prescribe medicine — please bring those to a doctor.`;
}

function Assistant() {
  const { chat, update, profile, vitals, risks } = useApp();
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const latest = vitals[vitals.length - 1]!;

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, typing]);

  const send = (text: string) => {
    const content = text.trim();
    if (!content) return;
    const userMsg = { id: uid(), role: "user" as const, content, createdAt: new Date().toISOString() };
    update({ chat: [...chat, userMsg] });
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      const reply = {
        id: uid(),
        role: "assistant" as const,
        content: answer(content, {
          bmi: bmiFrom(profile.heightCm, latest.weightKg),
          systolic: latest.systolic,
          diastolic: latest.diastolic,
          heart: risks.heart?.score,
        }),
        createdAt: new Date().toISOString(),
      };
      update({ chat: [...chat, userMsg, reply] });
      setTyping(false);
      inputRef.current?.focus();
    }, 900);
  };

  return (
    <AppShell title="Jeeva Assistant" description="A health educator — not a doctor.">
      <div className="card-soft flex h-[70vh] flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {chat.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                    : "max-w-[85%] whitespace-pre-wrap text-sm text-foreground"
                }
              >
                {m.content.split("**").map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>))}
              </div>
            </div>
          ))}
          {typing && <p className="animate-pulse text-sm text-muted-foreground">Jeeva is typing…</p>}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {starters.map((s) => (
              <Button key={s} size="sm" variant="outline" onClick={() => send(s)}>{s}</Button>
            ))}
          </div>
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Textarea
              ref={inputRef}
              autoFocus
              rows={2}
              value={input}
              placeholder="Ask about your vitals, habits or risk scores…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <Button type="submit" size="icon" aria-label="Send message"><Send className="size-4" /></Button>
          </form>
        </div>
      </div>
      <Disclaimer />
    </AppShell>
  );
}
