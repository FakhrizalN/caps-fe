"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Bar, BarChart, CartesianGrid, LabelList, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, XAxis, YAxis } from "recharts"

// KPI Cards Data
const stats = [
  { title: "Total Responden", value: "1,234", description: "Total alumni yang merespons" },
  { title: "Alumni Bekerja", value: "72%", description: "Dari total responden" },
  { title: "Rata-rata Waktu Tunggu", value: "4.2 bulan", description: "Mendapat pekerjaan pertama" },
  { title: "Relevansi Pendidikan", value: "78%", description: "Pekerjaan sesuai bidang studi" },
  { title: "Rata-rata Pendapatan", value: "Rp 6.8jt", description: "Take home pay per bulan" },
  { title: "Response Rate", value: "61%", description: "Dari total alumni" },
]

// 1. Status dan Kondisi Kerja Alumni
// Status Alumni - Pie Chart
const statusAlumniData = [
  { status: "Bekerja Full Time", alumni: 650, fill: "var(--color-bekerjaFullTime)" },
  { status: "Bekerja Part Time", alumni: 142, fill: "var(--color-bekerjaPartTime)" },
  { status: "Wiraswasta", alumni: 156, fill: "var(--color-wiraswasta)" },
  { status: "Melanjutkan Pendidikan", alumni: 98, fill: "var(--color-melanjutkanPendidikan)" },
  { status: "Mencari Kerja", alumni: 145, fill: "var(--color-mencariKerja)" },
  { status: "Belum Memungkinkan Bekerja", alumni: 43, fill: "var(--color-belumMemungkinkan)" },
]

// Pekerjaan ≤6 Bulan - Donut Chart
const pekerjaanCepatData = [
  { status: "Ya", alumni: 756, fill: "var(--color-ya)" },
  { status: "Tidak", alumni: 478, fill: "var(--color-tidak)" },
]

// Waktu Tunggu Kerja - Bar Chart
const waktuTungguData = [
  { bulan: "0-3", jumlah: 342, fill: "var(--color-jumlah)" },
  { bulan: "4-6", jumlah: 298, fill: "var(--color-jumlah)" },
  { bulan: "7-9", jumlah: 186, fill: "var(--color-jumlah)" },
  { bulan: "10-12", jumlah: 124, fill: "var(--color-jumlah)" },
  { bulan: "13-18", jumlah: 78, fill: "var(--color-jumlah)" },
  { bulan: ">18", jumlah: 56, fill: "var(--color-jumlah)" },
]

// Distribusi Pendapatan - Histogram
const pendapatanData = [
  { range: "< 2jt", jumlah: 89, fill: "var(--color-pendapatan)" },
  { range: "2-4jt", jumlah: 234, fill: "var(--color-pendapatan)" },
  { range: "4-6jt", jumlah: 378, fill: "var(--color-pendapatan)" },
  { range: "6-8jt", jumlah: 298, fill: "var(--color-pendapatan)" },
  { range: "8-10jt", jumlah: 145, fill: "var(--color-pendapatan)" },
  { range: "10-15jt", jumlah: 67, fill: "var(--color-pendapatan)" },
  { range: "> 15jt", jumlah: 23, fill: "var(--color-pendapatan)" },
]

// 2. Profil Pekerjaan
// Jenis Institusi - Donut Chart
const jenisInstitusiData = [
  { institusi: "Perusahaan Swasta", jumlah: 567, fill: "var(--color-perusahaanSwasta)" },
  { institusi: "Wiraswasta", jumlah: 234, fill: "var(--color-wiraswasta2)" },
  { institusi: "Instansi Pemerintah", jumlah: 198, fill: "var(--color-instansiPemerintah)" },
  { institusi: "BUMN/BUMD", jumlah: 145, fill: "var(--color-bumn)" },
  { institusi: "Organisasi Non-Profit", jumlah: 67, fill: "var(--color-nonprofit)" },
  { institusi: "Institusi Multilateral", jumlah: 23, fill: "var(--color-multilateral)" },
]

// Tingkat Tempat Kerja - Stacked Bar Chart
const tingkatKerjaData = [
  { level: "Lokal/Wilayah", jumlah: 456, fill: "var(--color-tingkat)" },
  { level: "Nasional", jumlah: 534, fill: "var(--color-tingkat)" },
  { level: "Multinasional", jumlah: 244, fill: "var(--color-tingkat)" },
]

// 3. Relevansi Pendidikan
// Relevansi Bidang Studi - Stacked Bar Chart
const relevansiBidangData = [
  { kategori: "Sangat Erat", persentase: 38, fill: "var(--color-relevansi)" },
  { kategori: "Erat", persentase: 32, fill: "var(--color-relevansi)" },
  { kategori: "Cukup Erat", persentase: 18, fill: "var(--color-relevansi)" },
  { kategori: "Kurang Erat", persentase: 8, fill: "var(--color-relevansi)" },
  { kategori: "Tidak Sama Sekali", persentase: 4, fill: "var(--color-relevansi)" },
]

// Kesesuaian Tingkat Pendidikan - Pie Chart
const tingkatPendidikanData = [
  { tingkat: "Setingkat", jumlah: 756, fill: "var(--color-setingkat)" },
  { tingkat: "Lebih Tinggi", jumlah: 234, fill: "var(--color-lebihTinggi)" },
  { tingkat: "Lebih Rendah", jumlah: 156, fill: "var(--color-lebihRendah)" },
  { tingkat: "Tidak Perlu Pendidikan Tinggi", jumlah: 88, fill: "var(--color-tidakPerlu)" },
]

// 4. Kompetensi Alumni - Gap Analysis (Radar Chart)
const kompetensiData = [
  { kompetensi: "Etika", saatLulus: 82, kebutuhanKerja: 88 },
  { kompetensi: "Keahlian Bidang Ilmu", saatLulus: 75, kebutuhanKerja: 92 },
  { kompetensi: "Bahasa Inggris", saatLulus: 68, kebutuhanKerja: 85 },
  { kompetensi: "Penggunaan TI", saatLulus: 78, kebutuhanKerja: 90 },
  { kompetensi: "Komunikasi", saatLulus: 72, kebutuhanKerja: 87 },
  { kompetensi: "Kerja Sama Tim", saatLulus: 80, kebutuhanKerja: 89 },
  { kompetensi: "Pengembangan Diri", saatLulus: 70, kebutuhanKerja: 86 },
]

// 5. Metode Pembelajaran - Horizontal Bar Chart
const metodePembelajaranData = [
  { metode: "Perkuliahan", efektivitas: 85, fill: "var(--color-metode)" },
  { metode: "Diskusi", efektivitas: 82, fill: "var(--color-metode)" },
  { metode: "Praktikum", efektivitas: 88, fill: "var(--color-metode)" },
  { metode: "Magang", efektivitas: 92, fill: "var(--color-metode)" },
  { metode: "Kerja Lapangan", efektivitas: 86, fill: "var(--color-metode)" },
  { metode: "Demonstrasi", efektivitas: 78, fill: "var(--color-metode)" },
  { metode: "Partisipasi Proyek Riset", efektivitas: 80, fill: "var(--color-metode)" },
]

// 6. Proses Pencarian Kerja
// Timeline Pencari Kerja - Bar Chart
const timelinePencarianData = [
  { kategori: "Sebelum Lulus", jumlah: 456, fill: "var(--color-timeline)" },
  { kategori: "Sesudah Lulus", jumlah: 678, fill: "var(--color-timeline)" },
  { kategori: "Tidak Mencari", jumlah: 100, fill: "var(--color-timeline)" },
]

// Strategi Pencarian Kerja - Horizontal Bar Chart
const strategiPencarianData = [
  { strategi: "Internet/Job Portal", jumlah: 678, fill: "var(--color-strategi)" },
  { strategi: "Melamar Langsung", jumlah: 534, fill: "var(--color-strategi)" },
  { strategi: "Networking/Relasi", jumlah: 456, fill: "var(--color-strategi)" },
  { strategi: "Pusat Karir Kampus", jumlah: 345, fill: "var(--color-strategi)" },
  { strategi: "Bursa Kerja", jumlah: 289, fill: "var(--color-strategi)" },
  { strategi: "Dihubungi Perusahaan", jumlah: 234, fill: "var(--color-strategi)" },
  { strategi: "Tempat Kerja Saat Kuliah", jumlah: 198, fill: "var(--color-strategi)" },
  { strategi: "Magang", jumlah: 167, fill: "var(--color-strategi)" },
  { strategi: "Iklan Koran", jumlah: 89, fill: "var(--color-strategi)" },
  { strategi: "Bisnis Sendiri", jumlah: 78, fill: "var(--color-strategi)" },
]

// Status Aktif Pencarian - Pie Chart
const statusPencarianData = [
  { status: "Mulai Bekerja", jumlah: 792, fill: "var(--color-mulaiBekerja)" },
  { status: "Sedang Tunggu Hasil", jumlah: 234, fill: "var(--color-tungguHasil)" },
  { status: "Belum Pasti", jumlah: 123, fill: "var(--color-belumPasti)" },
  { status: "Tidak Mencari", jumlah: 85, fill: "var(--color-tidakMencari)" },
]

// 7. Pembiayaan Pendidikan
const sumberDanaData = [
  { sumber: "Biaya Sendiri/Keluarga", jumlah: 678, fill: "var(--color-biayaSendiri)" },
  { sumber: "Beasiswa BIDIKMISI", jumlah: 234, fill: "var(--color-bidikmisi)" },
  { sumber: "Beasiswa ADIK", jumlah: 145, fill: "var(--color-adik)" },
  { sumber: "Beasiswa PPA", jumlah: 89, fill: "var(--color-ppa)" },
  { sumber: "Beasiswa Perusahaan", jumlah: 56, fill: "var(--color-perusahaan)" },
  { sumber: "Lainnya", jumlah: 32, fill: "var(--color-lainnya)" },
]

// 8. Alasan Mengambil Pekerjaan Tidak Sesuai
const alasanPekerjaanData = [
  { alasan: "Prospek Karir Baik", jumlah: 345, fill: "var(--color-alasan)" },
  { alasan: "Pendapatan Lebih Tinggi", jumlah: 298, fill: "var(--color-alasan)" },
  { alasan: "Belum Dapat yang Sesuai", jumlah: 267, fill: "var(--color-alasan)" },
  { alasan: "Lebih Menarik", jumlah: 234, fill: "var(--color-alasan)" },
  { alasan: "Lebih Aman/Terjamin", jumlah: 198, fill: "var(--color-alasan)" },
  { alasan: "Awal Karir Harus Terima", jumlah: 178, fill: "var(--color-alasan)" },
  { alasan: "Jadwal Fleksibel", jumlah: 156, fill: "var(--color-alasan)" },
  { alasan: "Lokasi Dekat Rumah", jumlah: 134, fill: "var(--color-alasan)" },
  { alasan: "Lebih Suka Area Berbeda", jumlah: 112, fill: "var(--color-alasan)" },
  { alasan: "Menjamin Keluarga", jumlah: 89, fill: "var(--color-alasan)" },
]

const chartConfig = {
  alumni: { label: "Alumni" },
  jumlah: { label: "Jumlah", color: "#007FCB" },
  pendapatan: { label: "Pendapatan", color: "#00C49F" },
  tingkat: { label: "Tingkat", color: "#007FCB" },
  relevansi: { label: "Relevansi", color: "#00C49F" },
  persentase: { label: "Persentase", color: "#00C49F" },
  efektivitas: { label: "Efektivitas", color: "#FFBB28" },
  metode: { label: "Metode", color: "#FFBB28" },
  timeline: { label: "Timeline", color: "#007FCB" },
  strategi: { label: "Strategi", color: "#007FCB" },
  alasan: { label: "Alasan", color: "#007FCB" },
  saatLulus: { label: "Saat Lulus", color: "#007FCB" },
  kebutuhanKerja: { label: "Kebutuhan Kerja", color: "#FF8042" },
  // Status Alumni
  bekerjaFullTime: { label: "Bekerja Full Time", color: "#007FCB" },
  bekerjaPartTime: { label: "Bekerja Part Time", color: "#00C49F" },
  wiraswasta: { label: "Wiraswasta", color: "#FFBB28" },
  melanjutkanPendidikan: { label: "Melanjutkan Pendidikan", color: "#FF8042" },
  mencariKerja: { label: "Mencari Kerja", color: "#8884d8" },
  belumMemungkinkan: { label: "Belum Memungkinkan Bekerja", color: "#82ca9d" },
  // Pekerjaan Cepat
  ya: { label: "Ya", color: "#00C49F" },
  tidak: { label: "Tidak", color: "#FF8042" },
  // Jenis Institusi
  perusahaanSwasta: { label: "Perusahaan Swasta", color: "#007FCB" },
  wiraswasta2: { label: "Wiraswasta", color: "#00C49F" },
  instansiPemerintah: { label: "Instansi Pemerintah", color: "#FFBB28" },
  bumn: { label: "BUMN/BUMD", color: "#FF8042" },
  nonprofit: { label: "Organisasi Non-Profit", color: "#8884d8" },
  multilateral: { label: "Institusi Multilateral", color: "#82ca9d" },
  // Tingkat Pendidikan
  setingkat: { label: "Setingkat", color: "#00C49F" },
  lebihTinggi: { label: "Lebih Tinggi", color: "#007FCB" },
  lebihRendah: { label: "Lebih Rendah", color: "#FF8042" },
  tidakPerlu: { label: "Tidak Perlu Pendidikan Tinggi", color: "#8884d8" },
  // Status Pencarian
  mulaiBekerja: { label: "Mulai Bekerja", color: "#00C49F" },
  tungguHasil: { label: "Sedang Tunggu Hasil", color: "#FFBB28" },
  belumPasti: { label: "Belum Pasti", color: "#FF8042" },
  tidakMencari: { label: "Tidak Mencari", color: "#8884d8" },
  // Sumber Dana
  biayaSendiri: { label: "Biaya Sendiri/Keluarga", color: "#007FCB" },
  bidikmisi: { label: "Beasiswa BIDIKMISI", color: "#00C49F" },
  adik: { label: "Beasiswa ADIK", color: "#FFBB28" },
  ppa: { label: "Beasiswa PPA", color: "#FF8042" },
  perusahaan: { label: "Beasiswa Perusahaan", color: "#8884d8" },
  lainnya: { label: "Lainnya", color: "#82ca9d" },
  label: { color: "hsl(var(--background))" },
}

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 z-10">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 !h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard Tracer Study</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Tracer Study</h1>
                <p className="text-muted-foreground">
                  Analisis komprehensif data alumni dan insersi lulusan
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Section 1: Status dan Kondisi Kerja Alumni */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Status dan Kondisi Kerja Alumni</h2>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {/* Status Alumni - Pie Chart */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Status Alumni</CardTitle>
                      <CardDescription className="text-xs">
                        Distribusi status pekerjaan alumni saat ini
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie data={statusAlumniData} dataKey="alumni" nameKey="status" />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Pekerjaan ≤6 Bulan - Donut Chart */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Pekerjaan ≤6 Bulan</CardTitle>
                      <CardDescription className="text-xs">
                        Alumni dapat pekerjaan dalam 6 bulan
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie data={pekerjaanCepatData} dataKey="alumni" nameKey="status" innerRadius={60} />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Waktu Tunggu Kerja - Bar Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Waktu Tunggu Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Distribusi waktu tunggu (bulan)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart accessibilityLayer data={waktuTungguData}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="bulan"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="jumlah" fill="var(--color-jumlah)" radius={8} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Distribusi Pendapatan - Histogram */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Distribusi Pendapatan</CardTitle>
                      <CardDescription className="text-xs">
                        Rentang take home pay per bulan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart accessibilityLayer data={pendapatanData}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="range"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 5)}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="jumlah" fill="var(--color-pendapatan)" radius={8} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Section 2: Profil Pekerjaan */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Profil Pekerjaan</h2>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {/* Jenis Institusi - Donut Chart */}
                  <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Jenis Institusi Tempat Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Distribusi jenis tempat alumni bekerja
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie data={jenisInstitusiData} dataKey="jumlah" nameKey="institusi" innerRadius={60} />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Tingkat Tempat Kerja - Bar Chart */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Tingkat Tempat Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Level organisasi tempat alumni bekerja
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart accessibilityLayer data={tingkatKerjaData}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="level"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="jumlah" fill="var(--color-tingkat)" radius={8} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Section 3: Relevansi Pendidikan */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Relevansi Pendidikan</h2>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {/* Relevansi Bidang Studi - Horizontal Bar Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Relevansi Bidang Studi</CardTitle>
                      <CardDescription className="text-xs">
                        Keeratan hubungan bidang studi dengan pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart
                          accessibilityLayer
                          data={relevansiBidangData}
                          layout="vertical"
                          margin={{ right: 16 }}
                        >
                          <CartesianGrid horizontal={false} />
                          <YAxis
                            dataKey="kategori"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            hide
                          />
                          <XAxis dataKey="persentase" type="number" hide />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                          <Bar dataKey="persentase" fill="var(--color-relevansi)" radius={4}>
                            <LabelList
                              dataKey="kategori"
                              position="insideLeft"
                              offset={8}
                              className="fill-[--color-label]"
                              fontSize={12}
                            />
                            <LabelList
                              dataKey="persentase"
                              position="right"
                              offset={8}
                              className="fill-foreground"
                              fontSize={12}
                            />
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Kesesuaian Tingkat Pendidikan - Pie Chart */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Kesesuaian Tingkat Pendidikan</CardTitle>
                      <CardDescription className="text-xs">
                        Kesesuaian tingkat pendidikan dengan pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie data={tingkatPendidikanData} dataKey="jumlah" nameKey="tingkat" />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Gap Analysis Kompetensi Alumni - Radar Chart */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2 items-center">
                      <CardTitle className="text-base">Gap Kompetensi Alumni</CardTitle>
                      <CardDescription className="text-xs text-center">
                        Perbandingan kompetensi saat lulus vs kebutuhan kerja
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <RadarChart data={kompetensiData} margin={{ top: -40, bottom: -10 }}>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                          <PolarAngleAxis dataKey="kompetensi" />
                          <PolarGrid />
                          <Radar
                            dataKey="saatLulus"
                            fill="var(--color-saatLulus)"
                            fillOpacity={0.6}
                          />
                          <Radar dataKey="kebutuhanKerja" fill="var(--color-kebutuhanKerja)" />
                          <ChartLegend className="mt-8" content={<ChartLegendContent />} />
                        </RadarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Efektivitas Metode Pembelajaran */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Efektivitas Metode Pembelajaran</CardTitle>
                      <CardDescription className="text-xs">
                        Kontribusi metode pembelajaran terhadap pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart
                          accessibilityLayer
                          data={metodePembelajaranData}
                          layout="vertical"
                          margin={{ right: 16 }}
                        >
                          <CartesianGrid horizontal={false} />
                          <YAxis
                            dataKey="metode"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            hide
                          />
                          <XAxis dataKey="efektivitas" type="number" hide />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                          <Bar dataKey="efektivitas" fill="var(--color-metode)" radius={4}>
                            <LabelList
                              dataKey="metode"
                              position="insideLeft"
                              offset={8}
                              className="fill-[--color-label]"
                              fontSize={12}
                            />
                            <LabelList
                              dataKey="efektivitas"
                              position="right"
                              offset={8}
                              className="fill-foreground"
                              fontSize={12}
                            />
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Section 4: Proses Pencarian Kerja */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Proses Pencarian Kerja</h2>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {/* Timeline Pencarian Kerja */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Timeline Pencarian Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Kapan alumni mulai mencari pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart accessibilityLayer data={timelinePencarianData}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="kategori"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 10)}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="jumlah" fill="var(--color-timeline)" radius={8} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Status Aktif Pencarian */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Status Pencarian Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Kondisi pencarian kerja alumni saat ini
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie data={statusPencarianData} dataKey="jumlah" nameKey="status" />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Strategi Pencarian Kerja */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Strategi Pencarian Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Top 10 metode yang digunakan alumni
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart
                          accessibilityLayer
                          data={strategiPencarianData.slice(0, 10)}
                          layout="vertical"
                          margin={{ right: 16 }}
                        >
                          <CartesianGrid horizontal={false} />
                          <YAxis
                            dataKey="strategi"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            hide
                          />
                          <XAxis dataKey="jumlah" type="number" hide />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                          <Bar dataKey="jumlah" fill="var(--color-strategi)" radius={4}>
                            <LabelList
                              dataKey="strategi"
                              position="insideLeft"
                              offset={8}
                              className="fill-[--color-label]"
                              fontSize={12}
                            />
                            <LabelList
                              dataKey="jumlah"
                              position="right"
                              offset={8}
                              className="fill-foreground"
                              fontSize={12}
                            />
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Section 5: Alasan Pekerjaan Tidak Sesuai */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Alasan Mengambil Pekerjaan Tidak Sesuai Bidang</CardTitle>
                  <CardDescription>
                    Top 10 faktor yang mempengaruhi keputusan alumni
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <BarChart
                      accessibilityLayer
                      data={alasanPekerjaanData.slice(0, 10)}
                      layout="vertical"
                      margin={{ right: 16 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="alasan"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        hide
                      />
                      <XAxis dataKey="jumlah" type="number" hide />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                      <Bar dataKey="jumlah" fill="var(--color-alasan)" radius={4}>
                        <LabelList
                          dataKey="alasan"
                          position="insideLeft"
                          offset={8}
                          className="fill-[--color-label]"
                          fontSize={12}
                        />
                        <LabelList
                          dataKey="jumlah"
                          position="right"
                          offset={8}
                          className="fill-foreground"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Section 6: Pembiayaan Pendidikan */}
              <Card>
                <CardHeader className="pb-2 items-center">
                  <CardTitle>Sumber Pembiayaan Pendidikan</CardTitle>
                  <CardDescription>
                    Distribusi sumber dana kuliah alumni
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie data={sumberDanaData} dataKey="jumlah" nameKey="sumber" />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}
