import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SignOutButton } from "@/components/SignOutButton";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/supabase/session";

async function Profile({ locale }: { locale: string }) {
  const t = await getTranslations("Profile");
  const session = await getSession();
  if (!session.signedIn) redirect({ href: "/admin/connexion", locale });
  else
    return (
      <>
        <p className="mt-2 text-sm text-stone-600">
          {t("email")} : <strong>{session.email}</strong>
        </p>
        <SignOutButton className="mt-6 rounded-full border border-stone-300 px-5 py-2 text-sm hover:bg-stone-100" />
      </>
    );
}

export default async function ProfilePage({
  params,
}: PageProps<"/[locale]/profil">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Profile");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          {t("title")}
        </h1>
        <Suspense fallback={null}>
          <Profile locale={locale} />
        </Suspense>
      </main>
    </>
  );
}
