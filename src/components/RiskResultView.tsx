import { Link } from "@tanstack/react-router";
import { GraduationCap, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Disclaimer } from "@/components/Disclaimer";
import type { RiskResult } from "@/services/mlService";

export function RiskResultView({ result }: { result: RiskResult }) {
  const tone = result.tier === "High" ? "destructive" : result.tier === "Moderate" ? "secondary" : "default";

  return (
    <div className="space-y-4">
      <div className="card-soft p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated risk score</p>
            <p className="font-display text-5xl font-semibold">{result.score}%</p>
          </div>
          <Badge variant={tone} className="text-sm">{result.tier} risk tier</Badge>
        </div>
        <Progress value={result.score} className="mt-4" />
        <p className="mt-2 text-xs text-muted-foreground">
          Model: {result.model} · generated {new Date(result.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="card-soft p-6">
        <h3 className="text-base font-semibold">Main contributing factors</h3>
        <ul className="mt-4 space-y-4">
          {result.factors.map((f) => (
            <li key={f.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{f.label}</span>
                <span className="text-muted-foreground">{f.impact} pts</span>
              </div>
              <Progress value={Math.min(100, f.impact * 4)} className="mt-1.5 h-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-soft p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold"><GraduationCap className="size-4 text-teal" /> Educational recommendations</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {result.recommendations.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </div>

      <div className="card-soft p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold"><Stethoscope className="size-4 text-primary" /> Doctor consultation advisory</h3>
        <p className="mt-2 text-sm text-muted-foreground">{result.consultAdvisory}</p>
        <Button asChild className="mt-4">
          <Link to="/doctors">Find a doctor</Link>
        </Button>
      </div>

      <Disclaimer />
    </div>
  );
}
