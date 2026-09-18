import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { rankPlaces, type PlaceScore } from "./bestPlaces";

export type SavedChart = {
  id: number;
  name: string;
  placeName: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  simDays: number;
  places: PlaceScore[];
};

export type ChartDraft = {
  name: string;
  placeName: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  simDays: number;
};

type ChartRow = {
  id: number;
  name: string;
  place_name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  sim_days: number;
};

function toSaved(row: ChartRow): SavedChart {
  return {
    id: row.id,
    name: row.name,
    placeName: row.place_name,
    year: row.year,
    month: row.month,
    day: row.day,
    hour: row.hour,
    minute: row.minute,
    lat: row.lat,
    lon: row.lon,
    simDays: row.sim_days,
    places: rankPlaces(row.sim_days).slice(0, 8),
  };
}

function asDraft(d: ChartDraft): ChartDraft {
  const year = Math.round(Number(d.year));
  const month = Math.round(Number(d.month));
  const day = Math.round(Number(d.day));
  const hour = Math.round(Number(d.hour));
  const minute = Math.round(Number(d.minute));
  const lat = Number(d.lat);
  const lon = Number(d.lon);
  const simDays = Number(d.simDays);
  if (!Number.isFinite(year) || year < 1800 || year > 2100) throw new Error("Bad year");
  if (month < 1 || month > 12) throw new Error("Bad month");
  if (day < 1 || day > 31) throw new Error("Bad day");
  if (hour < 0 || hour > 23) throw new Error("Bad hour");
  if (minute < 0 || minute > 59) throw new Error("Bad minute");
  if (!Number.isFinite(lat) || Math.abs(lat) > 90) throw new Error("Bad lat");
  if (!Number.isFinite(lon) || Math.abs(lon) > 180) throw new Error("Bad lon");
  if (!Number.isFinite(simDays)) throw new Error("Bad time");
  const placeName = String(d.placeName ?? "").trim().slice(0, 80);
  if (!placeName) throw new Error("Name a place");
  const name = String(d.name ?? "").trim().slice(0, 80) || placeName;
  return { name, placeName, year, month, day, hour, minute, lat, lon, simDays };
}

export const listCharts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ChartRow>`
      select id, name, place_name, year, month, day, hour, minute, lat, lon, sim_days
      from charts
      where user_id = ${context.userId}
      order by created_at desc
      limit 24
    `;
    return rows.map(toSaved);
  });

export const saveChart = createServerFn({ method: "POST" })
  .validator((d: ChartDraft) => asDraft(d))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<ChartRow>`
      insert into charts (
        user_id, name, place_name, year, month, day, hour, minute, lat, lon, sim_days
      ) values (
        ${context.userId}, ${data.name}, ${data.placeName},
        ${data.year}, ${data.month}, ${data.day}, ${data.hour}, ${data.minute},
        ${data.lat}, ${data.lon}, ${data.simDays}
      )
      returning id, name, place_name, year, month, day, hour, minute, lat, lon, sim_days
    `;
    return toSaved(rows[0]);
  });

export const deleteChart = createServerFn({ method: "POST" })
  .validator((id: number) => {
    const n = Math.round(Number(id));
    if (!Number.isFinite(n) || n < 1) throw new Error("Bad id");
    return n;
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from charts where id = ${id} and user_id = ${context.userId}`;
    return { ok: true };
  });
