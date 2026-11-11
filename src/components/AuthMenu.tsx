import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/supabase/session";
import { SignOutButton } from "./SignOutButton";

const itemClass =
  "block w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-100";

/** "Connexion" for visitors, a profile dropdown once signed in. */
export async function AuthMenu() {
  const t = await getTranslations("Header");
  const session = await getSession();

  if (!session.signedIn) {
    return (
      <Link href="/admin/connexion" className="hover:text-stone-900">
        {t("login")}
      </Link>
    );
  }

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-full border border-stone-300 px-3 py-1 text-stone-800 hover:bg-stone-100">
        {t("profile")}
      </summary>
      <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
        <Link href="/profil" className={itemClass}>
          {t("myProfile")}
        </Link>
        {session.admin && (
          <Link href="/admin" className={itemClass}>
            {t("admin")}
          </Link>
        )}
        <SignOutButton className={itemClass} />
      </div>
    </details>
  );
}
