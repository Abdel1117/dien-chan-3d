import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/SiteHeader";
import { fraunces } from "@/components/landing/fonts";
import { LandingMotion } from "@/components/landing/motion/LandingMotion";
import { ClosingSection } from "@/components/landing/sections/ClosingSection";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { HowItWorksSection } from "@/components/landing/sections/HowItWorksSection";
import { LandingFooter } from "@/components/landing/sections/LandingFooter";
import { SessionSection } from "@/components/landing/sections/SessionSection";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className={`${fraunces.variable} bg-stone-50`}>
      <SiteHeader />
      <LandingMotion>
        <main>
          <HeroSection />
          <HowItWorksSection />
          <SessionSection />
          <ClosingSection />
        </main>
        <LandingFooter />
      </LandingMotion>
    </div>
  );
}
