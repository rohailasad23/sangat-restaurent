import { test } from "node:test";
import assert from "node:assert/strict";
import { inquirySchema, menuItemSchema, reservationSchema, settingsSchema } from "../src/lib/validation";
import { formatPrice, summarizeHours, whatsappLink } from "../src/lib/format";
import { DEFAULT_MENU, DEFAULT_SETTINGS } from "../src/lib/defaults";

const future = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);

test("valid reservation passes", () => {
  const r = reservationSchema.safeParse({ name: "Ali Raza", phone: "0300 1234567", date: future, time: "20:30", guests: "4" });
  assert.ok(r.success);
  assert.equal(r.data?.guests, 4);
  assert.equal(r.data?.seating, "no-preference");
});

test("reservation rejects past dates, bad time, bad phone and too many guests", () => {
  const r = reservationSchema.safeParse({ name: "A", phone: "abc", date: "2020-01-01", time: "24:10", guests: 500 });
  assert.ok(!r.success);
  const paths = r.error!.issues.map((i) => i.path[0]);
  for (const p of ["name", "phone", "time", "guests"]) assert.ok(paths.includes(p), `missing ${p}`);
});

test("reservation rejects dates more than 120 days ahead", () => {
  const far = new Date(Date.now() + 200 * 86400_000).toISOString().slice(0, 10);
  assert.ok(!reservationSchema.safeParse({ name: "Ali", phone: "03001234567", date: far, time: "20:00", guests: 2 }).success);
});

test("reservation rejects unknown seating", () => {
  assert.ok(!reservationSchema.safeParse({ name: "Ali", phone: "03001234567", date: future, time: "20:00", guests: 2, seating: "rooftop" }).success);
});

test("inquiry needs phone or email", () => {
  assert.ok(!inquirySchema.safeParse({ name: "Ali", message: "Hello there" }).success);
  assert.ok(inquirySchema.safeParse({ name: "Ali", email: "a@b.co", message: "Hello there" }).success);
});

test("default content is valid against the admin settings schema", () => {
  const r = settingsSchema.safeParse(DEFAULT_SETTINGS);
  assert.ok(r.success, JSON.stringify(r.error?.issues));
});

test("no default dish carries an invented price", () => {
  assert.ok(DEFAULT_MENU.every((m) => m.price === null));
  for (const m of DEFAULT_MENU) assert.ok(menuItemSchema.safeParse(m).success);
});

test("formatting helpers", () => {
  assert.equal(formatPrice(null), "Price on request");
  assert.equal(formatPrice(1450), "Rs. 1,450");
  assert.equal(whatsappLink("+92 345 8933300"), "https://wa.me/923458933300");
  assert.equal(whatsappLink("0345 8933300"), "https://wa.me/923458933300");
  assert.deepEqual(summarizeHours(DEFAULT_SETTINGS.hours), [{ label: "Monday – Sunday", value: "5:00 PM – 2:00 AM" }]);
});
