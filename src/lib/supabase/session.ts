import { isAdmin } from "./queries";
import { createClient } from "./server";

export type Session =
  | { signedIn: false }
  | { signedIn: true; email: string; admin: boolean };

/** Reads the session from the cookies (validated JWT) on the server. */
export async function getSession(): Promise<Session> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { signedIn: false };
  return {
    signedIn: true,
    email: typeof data.claims.email === "string" ? data.claims.email : "",
    admin: await isAdmin(supabase),
  };
}
