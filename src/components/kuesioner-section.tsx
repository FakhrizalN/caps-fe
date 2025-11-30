import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ClipboardList, Award, Users } from "lucide-react"

const surveys = [
  {
    icon: FileText,
    title: "Exit Survey",
    description:
      "Survei yang dilakukan kepada mahasiswa yang akan menyelesaikan studi di ITK. Survei ini bertujuan untuk mengukur kepuasan mahasiswa terhadap layanan akademik dan non-akademik selama menempuh pendidikan di kampus.",
  },
  {
    icon: ClipboardList,
    title: "Tracer Study Level 1",
    description:
      "Survei penelusuran alumni yang dilakukan 6 bulan setelah kelulusan. Bertujuan untuk mengetahui masa tunggu kerja, status pekerjaan pertama, dan relevansi pekerjaan dengan bidang studi yang ditempuh.",
  },
  {
    icon: Award,
    title: "Tracer Study Level 2",
    description:
      "Survei penelusuran alumni yang dilakukan 2 tahun setelah kelulusan. Survei ini mengukur perkembangan karir, kompetensi yang dibutuhkan di dunia kerja, serta feedback untuk pengembangan kurikulum.",
  },
  {
    icon: Users,
    title: "Survey Kepuasan Pengguna",
    description:
      "Survei yang ditujukan kepada pengguna lulusan (atasan/perusahaan). Bertujuan untuk mengukur kepuasan terhadap kinerja lulusan ITK dan mendapatkan masukan untuk peningkatan kualitas lulusan.",
  },
]

export function KuesionerSection() {
  return (
    <section id="kuesioner" className="py-20 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Kuesioner</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilih dan isi kuesioner sesuai dengan kategori Anda. Partisipasi Anda sangat berarti untuk pengembangan
            kualitas pendidikan di ITK.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {surveys.map((survey, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <survey.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{survey.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base mb-6">{survey.description}</CardDescription>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Isi Kuesioner</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
