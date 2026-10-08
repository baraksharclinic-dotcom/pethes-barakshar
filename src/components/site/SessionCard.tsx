import { format } from "date-fns";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";

export type SessionRow = {
  id: string;
  title: string;
  session_type: string;
  starts_at: string;
  duration_minutes: number;
  location: string;
  seats_total: number;
  seats_booked: number;
  courses?: { title: string; slug: string } | null;
};

export function SessionCard({ s }: { s: SessionRow }) {
  const { t } = useLang();
  const d = new Date(s.starts_at);
  const left = Math.max(0, s.seats_total - s.seats_booked);
  const pct = Math.min(100, (s.seats_booked / s.seats_total) * 100);
  return (
    <article className="flex gap-5 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex w-18 shrink-0 flex-col items-center justify-center rounded-xl bg-primary py-3 text-primary-foreground">
        <span className="text-xs font-bold tracking-widest uppercase">{format(d, "MMM")}</span>
        <span className="font-display text-3xl leading-none">{format(d, "d")}</span>
        <span className="text-xs">{format(d, "EEE")}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{s.session_type}</Badge>
          {s.courses && <span className="text-sm text-muted-foreground">{s.courses.title}</span>}
        </div>
        <h3 className="mt-1.5 text-xl font-semibold">{s.title}</h3>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{format(d, "PPP")}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4" />{format(d, "p")} · {s.duration_minutes} min</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{s.location}</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold">
            <Users className="size-4" />
            {left === 0 ? t("full") : `${left} ${t("seatsLeft")}`}
          </span>
        </div>
      </div>
    </article>
  );
}
