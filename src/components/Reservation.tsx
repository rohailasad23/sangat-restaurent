"use client";

import { useState } from "react";
import { SEATING_OPTIONS } from "@/lib/types";
import { whatsappLink } from "@/lib/format";
import Field, { aria } from "./Field";
import { useSubmit } from "./useSubmit";

function todayPk() {
  return new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);
}

export default function Reservation({ note, whatsapp, phone }: { note: string; whatsapp: string; phone: string }) {
  const { state, submit, reset } = useSubmit("/api/reservations");
  const [summary, setSummary] = useState<{ name: string; date: string; time: string; guests: string } | null>(null);
  const e = state.errors;
  const waNumber = whatsapp || phone;

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const body = Object.fromEntries(fd.entries()) as Record<string, string>;
    setSummary({ name: body.name, date: body.date, time: body.time, guests: body.guests });
    await submit(body);
  }

  const waText = summary
    ? `Assalam o Alaikum! I'd like to reserve a table at Sangat for ${summary.guests} on ${summary.date} at ${summary.time}. Name: ${summary.name}`
    : "Assalam o Alaikum! I'd like to reserve a table at Sangat.";

  return (
    <section id="reserve" className="relative bg-coal py-[clamp(6rem,12vw,10rem)]" aria-labelledby="reserve-title">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow" data-reveal>Reservations</p>
          <h2 id="reserve-title" className="display mt-6 text-[clamp(2.6rem,5vw,4.6rem)]" data-reveal>Save us <em className="text-gold">a seat.</em></h2>
          <p className="mt-6 max-w-md leading-relaxed text-sand" data-reveal>{note}</p>
          <div className="mt-10 border-t border-line pt-8" data-reveal>
            <p className="label">Prefer to message?</p>
            <a href={whatsappLink(waNumber, waText)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-4">
              <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3ZM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" /></svg>
              Reserve on WhatsApp
            </a>
            <p className="mt-3 text-xs text-mute">Or call <a className="link-line text-sand" href={`tel:${phone.replace(/[^0-9+]/g, "")}`}>{phone}</a></p>
          </div>
        </div>

        <div className="lg:col-span-7">
          {state.status === "success" ? (
            <div className="border border-gold-deep/60 p-8 sm:p-12" role="status" aria-live="polite">
              <p className="eyebrow">Request received</p>
              <h3 className="display mt-4 text-[2.6rem]">Shukriya, {summary?.name?.split(" ")[0]}.</h3>
              <p className="mt-4 leading-relaxed text-sand">
                Your request for <strong className="text-ivory">{summary?.guests} {summary?.guests === "1" ? "guest" : "guests"}</strong> on{" "}
                <strong className="text-ivory">{summary?.date}</strong> at <strong className="text-ivory">{summary?.time}</strong> is with our team.
                This is not yet a confirmed booking. We will call or WhatsApp you to confirm.
              </p>
              {typeof state.data?.reference === "string" && <p className="mt-4 text-sm text-mute">Reference: <span className="font-mono text-sand">{state.data.reference}</span></p>}
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={whatsappLink(waNumber, waText)} target="_blank" rel="noopener noreferrer" className="btn btn-gold">Message us on WhatsApp</a>
                <button onClick={reset} className="btn btn-ghost">Make another request</button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-x-8 gap-y-8 sm:grid-cols-2" aria-describedby={state.status === "error" ? "res-error" : undefined}>
              <Field id="name" label="Full name" error={e.name}>
                <input {...aria("name", e.name)} required autoComplete="name" className="field" placeholder="Your name" />
              </Field>
              <Field id="phone" label="Phone number" error={e.phone}>
                <input {...aria("phone", e.phone)} required type="tel" inputMode="tel" autoComplete="tel" className="field" placeholder="0300 1234567" />
              </Field>
              <Field id="email" label="Email (optional)" error={e.email} className="sm:col-span-2">
                <input {...aria("email", e.email)} type="email" autoComplete="email" className="field" placeholder="you@example.com" />
              </Field>
              <Field id="date" label="Date" error={e.date}>
                <input {...aria("date", e.date)} required type="date" min={todayPk()} className="field" />
              </Field>
              <Field id="time" label="Time" error={e.time}>
                <input {...aria("time", e.time)} required type="time" step={900} defaultValue="20:00" className="field" />
              </Field>
              <Field id="guests" label="Guests" error={e.guests}>
                <input {...aria("guests", e.guests)} required type="number" inputMode="numeric" min={1} max={100} defaultValue={2} className="field" />
              </Field>
              <Field id="seating" label="Seating preference" error={e.seating}>
                <select {...aria("seating", e.seating)} className="field" defaultValue="no-preference">
                  {SEATING_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
              <Field id="requests" label="Special requests" error={e.requests} className="sm:col-span-2">
                <textarea {...aria("requests", e.requests)} rows={3} maxLength={600} className="field resize-none" placeholder="High chair, birthday, anything we should know…" />
              </Field>
              <div aria-hidden className="absolute -left-[9999px]">
                <label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>
              <div className="sm:col-span-2">
                {state.status === "error" && <p id="res-error" role="alert" className="mb-5 border-l-2 border-[#d2765a] pl-4 text-sm text-[#f0b5a2]">{state.message}</p>}
                <button type="submit" disabled={state.status === "loading"} className="btn btn-gold w-full sm:w-auto">
                  {state.status === "loading" ? (<><span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-night/30 border-t-night" /> Sending request…</>) : "Request Reservation"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
