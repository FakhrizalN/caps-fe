import { Button } from "@/components/ui/button"
import { ArrowRight, GraduationCap, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <GraduationCap className="h-4 w-4" />
            <span className="text-sm font-medium">Institut Teknologi Kalimantan</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Tracer Study
            <span className="text-primary block mt-2">Institut Teknologi Kalimantan</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Sistem penelusuran alumni untuk mengukur dan melacak kinerja lulusan dalam rangka peningkatan mutu
            pendidikan di Institut Teknologi Kalimantan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="#kuesioner">
                Isi Kuesioner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 bg-transparent"
            >
              <Link href="#tentang">Pelajari Lebih Lanjut</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-xl bg-secondary">
              <GraduationCap className="h-10 w-10 text-primary mb-3" />
              <span className="text-3xl font-bold text-foreground">5000+</span>
              <span className="text-muted-foreground">Alumni Terdaftar</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-xl bg-secondary">
              <Users className="h-10 w-10 text-primary mb-3" />
              <span className="text-3xl font-bold text-foreground">85%</span>
              <span className="text-muted-foreground">Tingkat Partisipasi</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-xl bg-secondary">
              <BarChart3 className="h-10 w-10 text-primary mb-3" />
              <span className="text-3xl font-bold text-foreground">92%</span>
              <span className="text-muted-foreground">Terserap di Dunia Kerja</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
