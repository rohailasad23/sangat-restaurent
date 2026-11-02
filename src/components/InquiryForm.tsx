"use client";

import Field, { aria } from "./Field";
import { useSubmit } from "./useSubmit";

export default function InquiryForm({ kind }: { kind: "contact" | "group" }) {
  const { state, submit, reset } = useSubmit("/api/inquiries");
  const e = state.errors;
  const p = kind === "group" ? "g-" : "c-";

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const body: Record<string, unknown> = { kind };
    for (const [k, v] of Object.entries(raw)) body[k.replace(p, "")] = v;
    if (body.guests === "" || body.guests === undefined) body.guests = null;
    await submit(body);
  }

  if (state.status === "success") {
    return (
      <div role="status" className="border border-gold-deep/60 p-8">
        <p className="eyebrow">Message sent</p>
        <p className="display mt-3 text-3xl">Thank you. We&rsquo;ll be in touch soon.</p>
        <button onClick={reset} className="link-line mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 sm:grid-cols-2">
      <Field id={`${p}name`} label="Name" error={e.name}>
        <input {...aria(`${p}name`, e.name)} required autoComplete="name" className="field" />
      </Field>
      <Field id={`${p}phone`} label="Phone" error={e.phone}>
        <input {...aria(`${p}phone`, e.phone)} type="tel" inputMode="tel" autoComplete="tel" className="field" />
      </Field>
      <Field id={`${p}email`} label="Email (optional)" error={e.email} className={kind === "contact" ? "sm:col-span-2" : ""}>
        <input {...aria(`${p}email`, e.email)} type="email" autoComplete="email" className="field" />
      </Field>
      {kind === "group" && (
        <>
          <Field id={`${p}guests`} label="Approx. guests" error={e.guests}>
            <input {...aria(`${p}guests`, e.guests)} type="number" min={1} max={500} inputMode="numeric" className="field" />
          </Field>
          <Field id={`${p}date`} label="Preferred date" error={e.date}>
            <input {...aria(`${p}date`, e.date)} type="date" className="field" />
          </Field>
          <Field id={`${p}occasion`} label="Occasion (optional)" error={e.occasion}>
            <input {...aria(`${p}occasion`, e.occasion)} className="field" placeholder="Family dinner, reunion…" />
          </Field>
        </>
      )}
      <Field id={`${p}message`} label="Message" error={e.message} className="sm:col-span-2">
        <textarea {...aria(`${p}message`, e.message)} required rows={3} maxLength={2000} className="field resize-none" />
      </Field>
      <div aria-hidden className="absolute -left-[9999px]"><input name={`${p}website`} tabIndex={-1} autoComplete="off" /></div>
      <div className="sm:col-span-2">
        {state.status === "error" && <p role="alert" className="mb-5 border-l-2 border-[#d2765a] pl-4 text-sm text-[#f0b5a2]">{state.message}</p>}
        <button type="submit" disabled={state.status === "loading"} className="btn btn-gold">
          {state.status === "loading" ? "Sending…" : kind === "group" ? "Send Group Inquiry" : "Send Message"}
        </button>
      </div>
    </form>
  );
}
