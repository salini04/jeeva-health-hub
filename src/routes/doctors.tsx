import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BookingDialog } from "@/components/BookingDialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { demoDoctors } from "@/lib/demoData";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Find doctors — Jeeva" },
      { name: "description", content: "Search doctors by specialty and city, view their profiles and book an appointment." },
      { property: "og:title", content: "Find doctors — Jeeva" },
      { property: "og:description", content: "Browse verified specialists and book in-person or video consultations." },
    ],
  }),
  component: Doctors,
});

function Doctors() {
  const [q, setQ] = React.useState("");
  const [specialty, setSpecialty] = React.useState("all");
  const [location, setLocation] = React.useState("all");

  const specialties = ["all", ...new Set(demoDoctors.map((d) => d.specialty))];
  const locations = ["all", ...new Set(demoDoctors.map((d) => d.location))];

  const list = demoDoctors.filter(
    (d) =>
      (specialty === "all" || d.specialty === specialty) &&
      (location === "all" || d.location === location) &&
      (d.name.toLowerCase().includes(q.toLowerCase()) ||
        d.specialty.toLowerCase().includes(q.toLowerCase()) ||
        d.hospital.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <AppShell title="Find doctors" description="Filter by specialty and city, then book a slot.">
      <div className="card-soft grid gap-3 p-4 md:grid-cols-[1fr_200px_200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, specialty or hospital" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger><SelectValue placeholder="Specialty" /></SelectTrigger>
          <SelectContent>{specialties.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All specialties" : s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>{locations.map((l) => <SelectItem key={l} value={l}>{l === "all" ? "All locations" : l}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <div key={d.id} className="card-soft flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{d.name}</h2>
                <p className="text-sm text-primary">{d.specialty}</p>
              </div>
              <Badge variant="secondary" className="gap-1"><Star className="size-3 fill-current" />{d.rating}</Badge>
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{d.hospital}, {d.location}</p>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{d.about}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {d.languages.map((l) => <Badge key={l} variant="outline" className="text-[11px]">{l}</Badge>)}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm"><strong>₹{d.fee}</strong> · {d.experience} yrs exp</span>
              <BookingDialog doctor={d} />
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No doctors match those filters.</p>}
      </div>
    </AppShell>
  );
}
