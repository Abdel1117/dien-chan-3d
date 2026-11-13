import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fraunces } from "@/components/landing/fonts";
import { useLegalDocument, type LegalNamespace } from "./useLegalDocument";

/** A legal page: header, the titled sections of the text, footer. */
export function LegalDocument({ namespace }: { namespace: LegalNamespace }) {
  const { title, updated, sections } = useLegalDocument(namespace);

  return (
    <div className={`${fraunces.variable} flex min-h-dvh flex-col bg-stone-50`}>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h1 className="text-balance font-display text-4xl font-medium tracking-tight text-stone-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-stone-500">{updated}</p>

          {sections.map((section) => (
            <section key={section.title} className="mt-12">
              <h2 className="text-xl font-semibold text-stone-900">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-relaxed text-stone-700">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
