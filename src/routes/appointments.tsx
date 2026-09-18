import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, Clock, Video } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/store";
import type { Appointment } from "@/lib/types";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — Jeeva" },
      { name: "description", content: "Manage upcoming, past and cancelled doctor appointments in one place." },
      { property: "og:title", content: "Appointments — Jeeva" },
      { property: "og:description", content: "See upcoming visits, review past consultations and cancel when plans change." },
    ],
  }),
  component: Appointments,
});

function Card({ a, onCancel }: { a: Appointment; onCancel?: () => void }) {
  return (
    <div className="card-soft flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">{a.doctorName}</h2>
          <Badge variant={a.status === "upcoming" ? "default" : a.status === "completed" ? "secondary" : "outline"}>{a.status}</Badge>
        </div>
        <p className="text-sm text-primary">{a.specialty}</p>
        <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CalendarDays className="size-3" />{new Date(a.date).toDateString()}</span>
          <span className="flex items-center gap-1"><Clock className="size-3" />{a.time}</span>
          <span className="flex items-center gap-1"><Video className="size-3" />{a.mode}</span>
        </p>
        <p className="mt-2 max-w-xl text-sm">{a.reason}</p>
      </div>
      {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
    </div>
  );
}

function Appointments() {
  const { appointments, update } = useApp();
  const by = (s: Appointment["status"]) => appointments.filter((a) => a.status === s);

  const cancel = (id: string) => {
    update({ appointments: appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)) });
    toast.success("Appointment cancelled");
  };

  return (
    <AppShell title="Appointments" description="Upcoming visits, past consultations and cancellations.">
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({by("upcoming").length})</TabsTrigger>
          <TabsTrigger value="completed">Past ({by("completed").length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({by("cancelled").length})</TabsTrigger>
        </TabsList>
        {(["upcoming", "completed", "cancelled"] as const).map((s) => (
          <TabsContent key={s} value={s} className="space-y-4">
            {by(s).map((a) => (
              <Card key={a.id} a={a} {...(s === "upcoming" ? { onCancel: () => cancel(a.id) } : {})} />
            ))}
            {by(s).length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}
