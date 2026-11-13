/**
 * Facts shown on the legal notice and the privacy policy. The texts live in
 * messages/*.json and refer to these values as {contactEmail}, {hostName}…
 *
 * The publisher is a private individual who does not publish their name or
 * address (allowed by French law as long as the host knows who they are).
 */
export const LEGAL = {
  /** Date of the last change to the legal texts (ISO). */
  lastUpdated: "2026-11-13",

  // How to reach the publisher.
  contactEmail: "abderahmane.adjali@live.fr",

  // Where the site is served from (see A-FAIRE-DEMAIN.md: Vercel).
  hostName: "Vercel Inc.",
  hostAddress: "440 N Barranca Avenue #4133, Covina, CA 91723, USA",
  hostWebsite: "vercel.com",

  // Where the database and the accounts live.
  databaseName: "Supabase Inc.",
  databaseAddress: "970 Toa Payoh North #07-04, Singapore 318992",
  databaseWebsite: "supabase.com",
} as const;
