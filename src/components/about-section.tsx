import { CheckCircle } from "lucide-react"

const objectives = [
  "Mengumpulkan data dan informasi tentang keberhasilan alumni di dunia kerja",
  "Mengukur relevansi kurikulum dengan kebutuhan pasar kerja",
  "Memberikan umpan balik untuk perbaikan proses pembelajaran",
  "Menjalin komunikasi dan hubungan yang baik dengan alumni",
  "Memenuhi kebutuhan akreditasi program studi dan institusi",
  "Meningkatkan kualitas lulusan Institut Teknologi Kalimantan",
]

export function AboutSection() {
  return (
    <section id="tentang" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">Tentang Tracer Study ITK</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Tracer Study adalah studi penelusuran yang dilakukan kepada alumni perguruan tinggi. Di Institut Teknologi
              Kalimantan, Tracer Study menjadi instrumen penting untuk mengukur dan melacak kinerja lulusan sebagai
              salah satu indikator keberhasilan proses pendidikan.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Hasil dari Tracer Study digunakan sebagai bahan evaluasi untuk perbaikan kurikulum, metode pembelajaran,
              dan layanan kemahasiswaan agar dapat menghasilkan lulusan yang berkualitas dan sesuai dengan kebutuhan
              industri serta masyarakat.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">Tujuan Tracer Study:</h3>
            <ul className="space-y-3">
              {objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 rounded-2xl p-8 lg:p-12">
            <div className="space-y-6">
              <div className="p-6 bg-background rounded-xl shadow-sm">
                <h4 className="font-semibold text-foreground mb-2">Siapa yang Mengisi?</h4>
                <p className="text-muted-foreground text-sm">
                  Alumni ITK dari semua program studi yang telah menyelesaikan pendidikan, mahasiswa tingkat akhir, dan
                  pengguna lulusan (perusahaan/institusi).
                </p>
              </div>
              <div className="p-6 bg-background rounded-xl shadow-sm">
                <h4 className="font-semibold text-foreground mb-2">Kapan Dilakukan?</h4>
                <p className="text-muted-foreground text-sm">
                  Exit Survey dilakukan saat wisuda, Tracer Study Level 1 dilakukan 6 bulan setelah lulus, dan Level 2
                  dilakukan 2 tahun setelah kelulusan.
                </p>
              </div>
              <div className="p-6 bg-background rounded-xl shadow-sm">
                <h4 className="font-semibold text-foreground mb-2">Kerahasiaan Data</h4>
                <p className="text-muted-foreground text-sm">
                  Seluruh data yang dikumpulkan dijamin kerahasiaannya dan hanya digunakan untuk kepentingan
                  pengembangan institusi dan akreditasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
