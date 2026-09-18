import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bot,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  LineChart,
  Moon,
  ShieldCheck,
  Stethoscope,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";
import { Logo } from "@/components/Logo";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jeeva — Your Health. Smarter Insights." },
      {
        name: "description",
        content:
          "Jeeva helps students and everyday users screen heart and diabetes risk, track vitals, chat with a health educator and book doctors.",
      },
      { property: "og:title", content: "Jeeva — Your Health. Smarter Insights." },
      {
        property: "og:description",
        content: "Risk screening, vitals tracking, an AI health educator and doctor appointments in one calm dashboard.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: HeartPulse, title: "Risk assessment", body: "Heart and type-2 diabetes screening with clear factor breakdowns." },
  { icon: Activity, title: "Health tracker", body: "Log weight, BP, glucose, sleep, water and activity with trend charts." },
  { icon: Bot, title: "Jeeva Assistant", body: "Ask health questions and get plain-language educational answers." },
  { icon: Stethoscope, title: "Doctor directory", body: "Search by specialty and city, then book a slot in seconds." },
  { icon: FileText, title: "Health reports", body: "A consolidated, printable summary of vitals and screenings." },
  { icon: ShieldCheck, title: "Safety first", body: "Every insight is educational, with clear advice on when to see a doctor." },
];

const steps = [
  { icon: ClipboardList, title: "Build your profile", body: "Add age, vitals, habits and medical history once." },
  { icon: LineChart, title: "Screen and track", body: "Run risk assessments and log daily vitals as you go." },
  { icon: CalendarDays, title: "Act with a doctor", body: "Share your report and book a consultation when needed." },
];

const faqs = [
  { q: "Is Jeeva a medical diagnosis tool?", a: "No. Jeeva provides educational risk estimates and health tracking. Only a qualified clinician can diagnose or treat a condition." },
  { q: "How are risk scores calculated?", a: "Scores come from a transparent scoring service using well-known clinical risk factors such as age, blood pressure, BMI, glucose and lifestyle habits. The service layer is ready to be swapped for a trained ML model." },
  { q: "Do I need an account?", a: "No. You can explore everything with demo guest access; your data stays in this browser." },
  { q: "Who is Jeeva for?", a: "Students and general users who want to understand their health numbers and build better daily habits." },
  { q: "Is my data shared?", a: "Demo data is stored locally in your browser and is never sent anywhere." },
];

function Landing() {
  const { settings, update } = useApp();
  const dark = settings.theme === "dark";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => update({ settings: { ...settings, theme: dark ? "light" : "dark" } })}
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">Explore dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,var(--color-accent)_0%,transparent_60%)] opacity-70" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge variant="secondary" className="mb-4 rounded-full">
              Built for students & everyday health
            </Badge>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
              Your Health. <span className="text-primary">Smarter Insights.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Understand your vitals, screen your heart and diabetes risk, track daily habits and talk to a health
              educator — all in one calm, private space.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/risk">
                  Check your risk <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">Explore dashboard</Link>
              </Button>
            </div>
            <Disclaimer className="mt-7 max-w-xl" compact />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: HeartPulse, label: "Heart risk", value: "18%", note: "Low tier" },
              { icon: Activity, label: "Resting HR", value: "72 bpm", note: "7-day average" },
              { icon: LineChart, label: "BMI", value: "21.8", note: "Healthy weight" },
              { icon: CalendarDays, label: "Next visit", value: "In 4 days", note: "Dr. Ananya Rao" },
            ].map((c) => (
              <div key={c.label} className="card-soft p-5">
                <c.icon className="size-5 text-primary" />
                <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                <p className="font-display text-2xl font-semibold">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">Everything your health needs, in one place</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card-soft p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="card-soft p-6">
                <span className="text-xs font-semibold text-primary">Step {i + 1}</span>
                <s.icon className="mt-3 size-6 text-teal" />
                <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">Take a look inside</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            { to: "/assistant", icon: Bot, title: "Jeeva Assistant", body: "Ask \u201cWhat does my BMI mean?\u201d and get a clear, safe explanation with next steps." },
            { to: "/risk", icon: HeartPulse, title: "Risk assessment", body: "Heart and diabetes screening with your top contributing factors ranked." },
            { to: "/tracker", icon: Activity, title: "Health tracker", body: "7-day, 30-day and 6-month charts for every vital you log." },
            { to: "/doctors", icon: Stethoscope, title: "Doctor directory", body: "Filter by specialty and city, then book an in-person or video slot." },
          ].map((p) => (
            <Link key={p.to} to={p.to} className="card-soft group block p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-teal/15 text-teal-foreground">
                  <p.icon className="size-5" />
                </span>
                <h3 className="text-base font-semibold">{p.title}</h3>
                <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 md:px-6">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A calm health companion for students and everyday users.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Product</p>
            <ul className="mt-2 space-y-1.5 text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link to="/risk" className="hover:text-foreground">Risk assessment</Link></li>
              <li><Link to="/tracker" className="hover:text-foreground">Tracker</Link></li>
              <li><Link to="/doctors" className="hover:text-foreground">Doctors</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Account</p>
            <ul className="mt-2 space-y-1.5 text-muted-foreground">
              <li><Link to="/auth" className="hover:text-foreground">Sign in</Link></li>
              <li><Link to="/settings" className="hover:text-foreground">Settings</Link></li>
              <li><Link to="/reports" className="hover:text-foreground">Health reports</Link></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
          <Disclaimer compact />
          <p className="mt-4 text-xs text-muted-foreground">© {new Date().getFullYear()} Jeeva. Educational use only.</p>
        </div>
      </footer>
    </div>
  );
}
