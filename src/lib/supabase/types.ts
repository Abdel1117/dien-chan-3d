// Types of the database schema (supabase/migrations). Keep in sync by hand
// or regenerate with `supabase gen types typescript`.

export type Locale = "fr" | "en" | "vi";
export type Categorie = "douleur" | "trouble";
export type Cote = "gauche" | "droite" | "les_deux" | "central";
export type ModeDosage = "duree" | "repetitions";

type Timestamps = { created_at: string; updated_at: string };

export type PointRow = {
  id: string;
  numero: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  normal_x: number;
  normal_y: number;
  normal_z: number;
  model_version: string;
} & Timestamps;

export type PointTraductionRow = {
  point_id: string;
  locale: Locale;
  nom: string;
  zone: string | null;
  description: string | null;
};

export type ParcoursRow = {
  id: string;
  slug: string;
  categorie: Categorie;
  tours: number;
  duree_defaut_secondes: number | null;
  publie: boolean;
} & Timestamps;

export type ParcoursTraductionRow = {
  parcours_id: string;
  locale: Locale;
  titre: string;
  description: string | null;
  avertissement: string | null;
};

export type EtapeRow = {
  id: string;
  parcours_id: string;
  point_id: string;
  ordre: number;
  cote: Cote;
  mode_dosage: ModeDosage;
  duree_secondes: number | null;
  repetitions: number | null;
  cadence_par_minute: number | null;
  technique: string | null;
  outil: string | null;
  pause_apres_secondes: number;
};

export type EtapeTraductionRow = {
  etape_id: string;
  locale: Locale;
  note: string | null;
};

type Generated = "id" | "created_at" | "updated_at";

type Table<Row, Required extends keyof Row, Auto extends keyof Row = never> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
  Update: Partial<Omit<Row, Auto>>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admins: Table<{ user_id: string }, "user_id">;
      points: Table<
        PointRow,
        | "numero"
        | "pos_x"
        | "pos_y"
        | "pos_z"
        | "normal_x"
        | "normal_y"
        | "normal_z"
        | "model_version",
        Generated
      >;
      points_traductions: Table<
        PointTraductionRow,
        "point_id" | "locale" | "nom"
      >;
      parcours: Table<ParcoursRow, "slug" | "categorie", Generated>;
      parcours_traductions: Table<
        ParcoursTraductionRow,
        "parcours_id" | "locale" | "titre"
      >;
      parcours_etapes: Table<
        EtapeRow,
        "parcours_id" | "point_id" | "ordre" | "cote" | "mode_dosage",
        "id"
      >;
      etapes_traductions: Table<EtapeTraductionRow, "etape_id" | "locale">;
    };
    Views: Record<string, never>;
    Functions: { is_admin: { Args: never; Returns: boolean } };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
