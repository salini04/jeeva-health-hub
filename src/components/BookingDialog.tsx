import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uid, useApp } from "@/lib/store";
import type { Appointment, Doctor } from "@/lib/types";

export function BookingDialog({ doctor }: { doctor: Doctor }) {
  const { appointments, update } = useApp();
  const [open, setOpen] = React.useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = React.useState(today);
  const [time, setTime] = React.useState(doctor.slots[0]!);
  const [mode, setMode] = React.useState<Appointment["mode"]>("In-person");
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");

  const book = () => {
    if (date < today) return setError("Please pick today or a future date.");
    if (reason.trim().length < 5) return setError("Tell the doctor briefly why you're visiting (5+ characters).");
    setError("");
    const appt: Appointment = {
      id: uid(),
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date,
      time,
      reason: reason.trim(),
      status: "upcoming",
      mode,
    };
    update({ appointments: [appt, ...appointments] });
    setOpen(false);
    setReason("");
    toast.success(`Appointment booked with ${doctor.name}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Book</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book with {doctor.name}</DialogTitle>
          <DialogDescription>{doctor.specialty} · {doctor.hospital}, {doctor.location}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time slot</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{doctor.slots.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Consultation mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as Appointment["mode"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="In-person">In-person</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Symptoms / reason</Label>
            <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Follow-up on high cholesterol results" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={book}>Confirm booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
