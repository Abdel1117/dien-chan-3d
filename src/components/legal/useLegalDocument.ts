import { useFormatter, useTranslations } from "next-intl";
import { LEGAL } from "@/lib/legal";

export type LegalNamespace = "Legal" | "Privacy";
type Section = { title: string; body: string[] };

/** Replaces {name} with the matching fact; unknown names are left as they are. */
function fill(text: string, facts: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (match, name: string) => facts[name] ?? match);
}

/**
 * Reads a legal text from the messages and fills in the facts of
 * src/lib/legal.ts (publisher, host…). Returns what the page displays.
 */
export function useLegalDocument(namespace: LegalNamespace) {
  const t = useTranslations(namespace);
  const brand = useTranslations("Header")("brand");
  const format = useFormatter();

  const facts: Record<string, string> = { ...LEGAL, siteName: brand };
  const sections = (t.raw("sections") as Section[]).map((section) => ({
    title: section.title,
    body: section.body.map((paragraph) => fill(paragraph, facts)),
  }));

  return {
    title: t("title"),
    updated: t("updated", {
      date: format.dateTime(new Date(LEGAL.lastUpdated), { dateStyle: "long", timeZone: "UTC" }),
    }),
    sections,
  };
}
