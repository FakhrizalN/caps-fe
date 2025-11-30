import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { KuesionerSection } from "@/components/kuesioner-section"
import { AboutSection } from "@/components/about-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <KuesionerSection />
      <AboutSection />
      <Footer />
    </main>
  )
}
