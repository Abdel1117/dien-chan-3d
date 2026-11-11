import type { SupabaseClient } from "@supabase/supabase-js";
import { pickTranslation } from "./i18n";
import type {
  Categorie,
  Database,
  EtapeRow,
  EtapeTraductionRow,
  Locale,
  ParcoursRow,
  ParcoursTraductionRow,
  PointRow,
  PointTraductionRow,
} from "./types";

type Client = SupabaseClient<Database>;

/** Throws on a Supabase error, otherwise returns the data. */
function unwrap<T>(result: {
  data: T | null;
  error: { message: string } | null;
}): T {
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? ([] as unknown)) as T;
}

function groupBy<T, K extends keyof T>(rows: readonly T[], key: K) {
  const map = new Map<T[K], T[]>();
  for (const row of rows) {
    const list = map.get(row[key]);
    if (list) list.push(row);
    else map.set(row[key], [row]);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Types returned to the UI (texts already resolved for one locale)
// ---------------------------------------------------------------------------

export type Point = PointRow & {
  nom: string;
  zone: string | null;
  description: string | null;
};

export type ParcoursSummary = ParcoursRow & {
  titre: string;
  description: string | null;
  avertissement: string | null;
};

export type Etape = EtapeRow & { note: string | null; point: Point };

export type ParcoursDetail = ParcoursSummary & { etapes: Etape[] };

function toPoint(row: PointRow, translations: PointTraductionRow[], locale: Locale): Point {
  const t = pickTranslation(translations, locale);
  return {
    ...row,
    nom: t?.nom ?? row.numero,
    zone: t?.zone ?? null,
    description: t?.description ?? null,
  };
}

function toParcours(
  row: ParcoursRow,
  translations: ParcoursTraductionRow[],
  locale: Locale,
): ParcoursSummary {
  const t = pickTranslation(translations, locale);
  return {
    ...row,
    titre: t?.titre ?? row.slug,
    description: t?.description ?? null,
    avertissement: t?.avertissement ?? null,
  };
}

// ---------------------------------------------------------------------------
// Reads (public: RLS only returns published parcours to visitors)
// ---------------------------------------------------------------------------

export async function getPoints(client: Client, locale: Locale): Promise<Point[]> {
  const rows = unwrap(
    await client.from("points").select("*").order("numero"),
  ) as PointRow[];
  if (rows.length === 0) return [];
  const translations = unwrap(
    await client.from("points_traductions").select("*"),
  ) as PointTraductionRow[];
  const byPoint = groupBy(translations, "point_id");
  return rows.map((r) => toPoint(r, byPoint.get(r.id) ?? [], locale));
}

export async function getParcoursList(
  client: Client,
  locale: Locale,
  options: { categorie?: Categorie } = {},
): Promise<ParcoursSummary[]> {
  let query = client.from("parcours").select("*").order("created_at");
  if (options.categorie) query = query.eq("categorie", options.categorie);
  const rows = unwrap(await query) as ParcoursRow[];
  if (rows.length === 0) return [];
  const translations = unwrap(
    await client.from("parcours_traductions").select("*"),
  ) as ParcoursTraductionRow[];
  const byParcours = groupBy(translations, "parcours_id");
  return rows.map((r) => toParcours(r, byParcours.get(r.id) ?? [], locale));
}

/** Returns the parcours with its steps in order, or null if not visible. */
export async function getParcoursBySlug(
  client: Client,
  slug: string,
  locale: Locale,
): Promise<ParcoursDetail | null> {
  const rows = unwrap(
    await client.from("parcours").select("*").eq("slug", slug).limit(1),
  ) as ParcoursRow[];
  const row = rows[0];
  if (!row) return null;

  const parcoursTranslations = unwrap(
    await client.from("parcours_traductions").select("*").eq("parcours_id", row.id),
  ) as ParcoursTraductionRow[];

  const etapeRows = unwrap(
    await client
      .from("parcours_etapes")
      .select("*")
      .eq("parcours_id", row.id)
      .order("ordre"),
  ) as EtapeRow[];

  const summary = toParcours(row, parcoursTranslations, locale);
  if (etapeRows.length === 0) return { ...summary, etapes: [] };

  const pointIds = [...new Set(etapeRows.map((e) => e.point_id))];
  const pointRows = unwrap(
    await client.from("points").select("*").in("id", pointIds),
  ) as PointRow[];
  const pointTranslations = unwrap(
    await client.from("points_traductions").select("*").in("point_id", pointIds),
  ) as PointTraductionRow[];
  const etapeTranslations = unwrap(
    await client
      .from("etapes_traductions")
      .select("*")
      .in("etape_id", etapeRows.map((e) => e.id)),
  ) as EtapeTraductionRow[];

  const pointById = new Map(
    pointRows.map((p) => [
      p.id,
      toPoint(p, pointTranslations.filter((t) => t.point_id === p.id), locale),
    ]),
  );
  const notesByEtape = groupBy(etapeTranslations, "etape_id");

  const etapes: Etape[] = [];
  for (const e of etapeRows) {
    const point = pointById.get(e.point_id);
    if (!point) continue;
    etapes.push({
      ...e,
      note: pickTranslation(notesByEtape.get(e.id) ?? [], locale)?.note ?? null,
      point,
    });
  }
  return { ...summary, etapes };
}

/** True if the signed-in user is listed in `admins`. */
export async function isAdmin(client: Client): Promise<boolean> {
  const { data, error } = await client.rpc("is_admin");
  if (error) throw new Error(error.message);
  return data === true;
}

// ---------------------------------------------------------------------------
// Writes (RLS rejects them unless the user is an admin)
// ---------------------------------------------------------------------------

type Translations<T> = Partial<Record<Locale, T>>;

async function replaceTranslations<R extends { locale: Locale }>(
  client: Client,
  table: "points_traductions" | "parcours_traductions" | "etapes_traductions",
  ownerColumn: "point_id" | "parcours_id" | "etape_id",
  ownerId: string,
  rows: R[],
) {
  // Generic helper over three tables: use the untyped client view here. The
  // callers build rows that match each table's Insert type.
  const db = client as unknown as SupabaseClient;
  const del = await db.from(table).delete().eq(ownerColumn, ownerId);
  if (del.error) throw new Error(del.error.message);
  if (rows.length === 0) return;
  const ins = await db
    .from(table)
    .insert(rows.map((r) => ({ ...r, [ownerColumn]: ownerId })));
  if (ins.error) throw new Error(ins.error.message);
}

export type PointInput = {
  id?: string;
  numero: string;
  position: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
  modelVersion: string;
  translations: Translations<{
    nom: string;
    zone?: string | null;
    description?: string | null;
  }>;
};

export async function savePoint(client: Client, input: PointInput): Promise<string> {
  const values = {
    numero: input.numero,
    pos_x: input.position.x,
    pos_y: input.position.y,
    pos_z: input.position.z,
    normal_x: input.normal.x,
    normal_y: input.normal.y,
    normal_z: input.normal.z,
    model_version: input.modelVersion,
  };
  const saved = unwrap(
    await (input.id
      ? client.from("points").update(values).eq("id", input.id).select("id").single()
      : client.from("points").insert(values).select("id").single()),
  ) as { id: string };

  await replaceTranslations(
    client,
    "points_traductions",
    "point_id",
    saved.id,
    (Object.entries(input.translations) as [Locale, NonNullable<PointInput["translations"][Locale]>][]).map(
      ([locale, t]) => ({
        locale,
        nom: t.nom,
        zone: t.zone ?? null,
        description: t.description ?? null,
      }),
    ),
  );
  return saved.id;
}

/** Fails if the point is used by a parcours step. */
export async function deletePoint(client: Client, id: string): Promise<void> {
  const { error } = await client.from("points").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export type ParcoursInput = {
  id?: string;
  slug: string;
  categorie: Categorie;
  tours?: number;
  dureeDefautSecondes?: number | null;
  publie?: boolean;
  translations: Translations<{
    titre: string;
    description?: string | null;
    avertissement?: string | null;
  }>;
};

export async function saveParcours(client: Client, input: ParcoursInput): Promise<string> {
  const values = {
    slug: input.slug,
    categorie: input.categorie,
    tours: input.tours ?? 1,
    duree_defaut_secondes: input.dureeDefautSecondes ?? null,
    publie: input.publie ?? false,
  };
  const saved = unwrap(
    await (input.id
      ? client.from("parcours").update(values).eq("id", input.id).select("id").single()
      : client.from("parcours").insert(values).select("id").single()),
  ) as { id: string };

  await replaceTranslations(
    client,
    "parcours_traductions",
    "parcours_id",
    saved.id,
    (Object.entries(input.translations) as [Locale, NonNullable<ParcoursInput["translations"][Locale]>][]).map(
      ([locale, t]) => ({
        locale,
        titre: t.titre,
        description: t.description ?? null,
        avertissement: t.avertissement ?? null,
      }),
    ),
  );
  return saved.id;
}

/** Deletes the parcours and, by cascade, its steps. */
export async function deleteParcours(client: Client, id: string): Promise<void> {
  const { error } = await client.from("parcours").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export type EtapeInput = Omit<EtapeRow, "id" | "parcours_id"> & {
  id?: string;
  parcoursId: string;
  notes?: Translations<string | null>;
};

export async function saveEtape(client: Client, input: EtapeInput): Promise<string> {
  const { id, parcoursId, notes, ...rest } = input;
  const values = { ...rest, parcours_id: parcoursId };
  const saved = unwrap(
    await (id
      ? client.from("parcours_etapes").update(values).eq("id", id).select("id").single()
      : client.from("parcours_etapes").insert(values).select("id").single()),
  ) as { id: string };

  if (notes) {
    await replaceTranslations(
      client,
      "etapes_traductions",
      "etape_id",
      saved.id,
      (Object.entries(notes) as [Locale, string | null][]).map(([locale, note]) => ({
        locale,
        note,
      })),
    );
  }
  return saved.id;
}

export async function deleteEtape(client: Client, id: string): Promise<void> {
  const { error } = await client.from("parcours_etapes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
