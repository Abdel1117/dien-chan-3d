import { Suspense, type ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/supabase/session";

async function AdminGuard({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session.signedIn) redirect({ href: "/admin/connexion", locale });
  else if (!session.admin) redirect({ href: "/profil", locale });
  return <>{children}</>;
}

/** Admin pages: signed in AND listed in `admins`. */
export default async function ProtectedAdminLayout({
  children,
  params,
}: LayoutProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={null}>
      <AdminGuard locale={locale}>{children}</AdminGuard>
    </Suspense>
  );
}
