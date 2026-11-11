import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { pickTranslation } from "./i18n";
import {
  deletePoint,
  getParcoursBySlug,
  getParcoursList,
  getPoints,
  isAdmin,
  saveParcours,
  savePoint,
} from "./queries";
import type { Database } from "./types";

type Call = { table: string; ops: [string, unknown[]][] };

/** Minimal chainable stand-in for the Supabase query builder. */
function fakeClient(
  tables: Record<string, unknown>,
  options: { errorOn?: string; rpc?: { data: unknown; error: unknown } } = {},
) {
  const calls: Call[] = [];
  const client = {
    from(table: string) {
      const call: Call = { table, ops: [] };
      calls.push(call);
      const builder: Record<string, unknown> = {};
      for (const op of [
        "select", "insert", "update", "delete", "eq", "in", "order", "limit", "single",
      ]) {
        builder[op] = (...args: unknown[]) => {
          call.ops.push([op, args]);
          return builder;
        };
      }
      builder.then = (resolve: (v: unknown) => void) => {
        const isWrite = call.ops.some(([o]) => ["insert", "update", "delete"].includes(o));
        const failing = options.errorOn === table && isWrite;
        const data = tables[table] ?? [];
        resolve(
          failing
            ? { data: null, error: { message: `boom ${table}` } }
            : { data: call.ops.some(([o]) => o === "single") ? { id: "new-id" } : data, error: null },
        );
      };
      return builder;
    },
    rpc: async () => options.rpc ?? { data: true, error: null },
  };
  return { client: client as unknown as SupabaseClient<Database>, calls };
}

const point = (id: string, numero: string) => ({
  id, numero, pos_x: 0, pos_y: 0, pos_z: 0, normal_x: 0, normal_y: 0, normal_z: 1,
  model_version: "provisoire", created_at: "", updated_at: "",
});

describe("pickTranslation", () => {
  const list = [
    { locale: "fr" as const, v: "bonjour" },
    { locale: "en" as const, v: "hello" },
  ];
  it("returns the requested locale", () => {
    expect(pickTranslation(list, "en")?.v).toBe("hello");
  });
  it("falls back to French, then to any translation", () => {
    expect(pickTranslation(list, "vi")?.v).toBe("bonjour");
    expect(pickTranslation([{ locale: "en" as const, v: "hello" }], "vi")?.v).toBe("hello");
    expect(pickTranslation([], "fr")).toBeUndefined();
  });
});

describe("reads", () => {
  it("getPoints resolves texts for the locale with fallback", async () => {
    const { client } = fakeClient({
      points: [point("p1", "T1")],
      points_traductions: [
        { point_id: "p1", locale: "fr", nom: "Point test 1", zone: "Z", description: null },
        { point_id: "p1", locale: "en", nom: "Test point 1", zone: null, description: null },
      ],
    });
    expect((await getPoints(client, "en"))[0].nom).toBe("Test point 1");
    expect((await getPoints(client, "vi"))[0].nom).toBe("Point test 1");
  });

  it("getParcoursList filters by category when asked", async () => {
    const { client, calls } = fakeClient({ parcours: [] });
    expect(await getParcoursList(client, "fr", { categorie: "douleur" })).toEqual([]);
    expect(calls[0].ops).toContainEqual(["eq", ["categorie", "douleur"]]);
  });

  it("getParcoursBySlug returns null when nothing is visible", async () => {
    const { client } = fakeClient({ parcours: [] });
    expect(await getParcoursBySlug(client, "absent", "fr")).toBeNull();
  });

  it("getParcoursBySlug returns steps ordered with their point and note", async () => {
    const etape = (id: string, ordre: number, point_id: string) => ({
      id, parcours_id: "a1", point_id, ordre, cote: "central", mode_dosage: "duree",
      duree_secondes: 30, repetitions: null, cadence_par_minute: null,
      technique: null, outil: null, pause_apres_secondes: 0,
    });
    const { client, calls } = fakeClient({
      parcours: [{
        id: "a1", slug: "demo", categorie: "douleur", tours: 1,
        duree_defaut_secondes: 30, publie: true, created_at: "", updated_at: "",
      }],
      parcours_traductions: [
        { parcours_id: "a1", locale: "fr", titre: "Démo", description: null, avertissement: "Avis" },
      ],
      parcours_etapes: [etape("e1", 0, "p1"), etape("e2", 1, "p2")],
      points: [point("p1", "T1"), point("p2", "T2")],
      points_traductions: [
        { point_id: "p1", locale: "fr", nom: "Un", zone: null, description: null },
        { point_id: "p2", locale: "fr", nom: "Deux", zone: null, description: null },
      ],
      etapes_traductions: [{ etape_id: "e1", locale: "fr", note: "Note 1" }],
    });
    const result = await getParcoursBySlug(client, "demo", "en");
    expect(result?.titre).toBe("Démo");
    expect(result?.avertissement).toBe("Avis");
    expect(result?.etapes.map((e) => e.point.nom)).toEqual(["Un", "Deux"]);
    expect(result?.etapes[0].note).toBe("Note 1");
    expect(result?.etapes[1].note).toBeNull();
    const stepsCall = calls.find((c) => c.table === "parcours_etapes");
    expect(stepsCall?.ops).toContainEqual(["order", ["ordre"]]);
  });

  it("isAdmin reflects the rpc result", async () => {
    expect(await isAdmin(fakeClient({}, { rpc: { data: true, error: null } }).client)).toBe(true);
    expect(await isAdmin(fakeClient({}, { rpc: { data: false, error: null } }).client)).toBe(false);
  });
});

describe("writes", () => {
  it("savePoint inserts the point then replaces its translations", async () => {
    const { client, calls } = fakeClient({});
    const id = await savePoint(client, {
      numero: "T9",
      position: { x: 1, y: 2, z: 3 },
      normal: { x: 0, y: 0, z: 1 },
      modelVersion: "provisoire",
      translations: { fr: { nom: "Nom" }, en: { nom: "Name", zone: "Zone" } },
    });
    expect(id).toBe("new-id");
    expect(calls[0].table).toBe("points");
    expect(calls[0].ops[0]).toEqual([
      "insert",
      [expect.objectContaining({ numero: "T9", pos_x: 1, pos_y: 2, pos_z: 3, model_version: "provisoire" })],
    ]);
    const insert = calls.find((c) => c.table === "points_traductions" && c.ops[0][0] === "insert");
    expect(insert?.ops[0][1]).toEqual([
      [
        { locale: "fr", nom: "Nom", zone: null, description: null, point_id: "new-id" },
        { locale: "en", nom: "Name", zone: "Zone", description: null, point_id: "new-id" },
      ],
    ]);
  });

  it("savePoint updates when an id is given", async () => {
    const { client, calls } = fakeClient({});
    await savePoint(client, {
      id: "p1", numero: "T1", position: { x: 0, y: 0, z: 0 },
      normal: { x: 0, y: 0, z: 1 }, modelVersion: "v", translations: {},
    });
    expect(calls[0].ops.map(([o]) => o)).toContain("update");
    expect(calls[0].ops).toContainEqual(["eq", ["id", "p1"]]);
  });

  it("saveParcours defaults to unpublished with one tour", async () => {
    const { client, calls } = fakeClient({});
    await saveParcours(client, {
      slug: "demo", categorie: "trouble", translations: { fr: { titre: "T" } },
    });
    expect(calls[0].ops[0][1]).toEqual([
      { slug: "demo", categorie: "trouble", tours: 1, duree_defaut_secondes: null, publie: false },
    ]);
  });

  it("surfaces database errors (e.g. deleting a point used in a parcours)", async () => {
    const { client } = fakeClient({}, { errorOn: "points" });
    await expect(deletePoint(client, "p1")).rejects.toThrow("boom points");
  });
});
