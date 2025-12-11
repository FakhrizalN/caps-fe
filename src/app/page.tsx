import { AboutSection } from "@/components/about-section"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { KuesionerSection } from "@/components/kuesioner-section"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <main className="min-h-screen bg-background [&_*:not(input):not(textarea):not([contenteditable='true'])]:caret-transparent">
      <Navbar />
      <HeroSection />
      <KuesionerSection />
      <AboutSection />
      <Footer />
    </main>
  )
}
