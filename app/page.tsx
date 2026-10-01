import Hero from "@/components/sections/Hero";
import LanguageMarquee from "@/components/sections/LanguageMarquee";
import Problem from "@/components/sections/Problem";
import WhySticky from "@/components/sections/WhySticky";
import ManyVoices from "@/components/sections/ManyVoices";
import Research from "@/components/sections/Research";
import EarlyAccess from "@/components/sections/EarlyAccess";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <LanguageMarquee />
      <Problem />
      <WhySticky />
      <ManyVoices />
      <Research />
      <EarlyAccess />
      <Footer />
    </main>
  );
}
