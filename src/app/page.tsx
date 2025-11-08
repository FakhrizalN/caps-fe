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
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip, XAxis, YAxis } from "recharts"

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
  { name: "Bekerja Full Time", value: 650, color: "#007FCB" },
  { name: "Bekerja Part Time", value: 142, color: "#00C49F" },
  { name: "Wiraswasta", value: 156, color: "#FFBB28" },
  { name: "Melanjutkan Pendidikan", value: 98, color: "#FF8042" },
  { name: "Mencari Kerja", value: 145, color: "#8884d8" },
  { name: "Belum Memungkinkan Bekerja", value: 43, color: "#82ca9d" },
]

// Pekerjaan ≤6 Bulan - Donut Chart
const pekerjaanCepatData = [
  { name: "Ya", value: 756, color: "#00C49F" },
  { name: "Tidak", value: 478, color: "#FF8042" },
]

// Waktu Tunggu Kerja - Bar Chart
const waktuTungguData = [
  { bulan: "0-3", jumlah: 342 },
  { bulan: "4-6", jumlah: 298 },
  { bulan: "7-9", jumlah: 186 },
  { bulan: "10-12", jumlah: 124 },
  { bulan: "13-18", jumlah: 78 },
  { bulan: ">18", jumlah: 56 },
]

// Distribusi Pendapatan - Histogram
const pendapatanData = [
  { range: "< 2jt", jumlah: 89 },
  { range: "2-4jt", jumlah: 234 },
  { range: "4-6jt", jumlah: 378 },
  { range: "6-8jt", jumlah: 298 },
  { range: "8-10jt", jumlah: 145 },
  { range: "10-15jt", jumlah: 67 },
  { range: "> 15jt", jumlah: 23 },
]

// 2. Profil Pekerjaan
// Jenis Institusi - Donut Chart
const jenisInstitusiData = [
  { name: "Perusahaan Swasta", value: 567, color: "#007FCB" },
  { name: "Wiraswasta", value: 234, color: "#00C49F" },
  { name: "Instansi Pemerintah", value: 198, color: "#FFBB28" },
  { name: "BUMN/BUMD", value: 145, color: "#FF8042" },
  { name: "Organisasi Non-Profit", value: 67, color: "#8884d8" },
  { name: "Institusi Multilateral", value: 23, color: "#82ca9d" },
]

// Tingkat Tempat Kerja - Stacked Bar Chart
const tingkatKerjaData = [
  { level: "Lokal/Wilayah", jumlah: 456 },
  { level: "Nasional", jumlah: 534 },
  { level: "Multinasional", jumlah: 244 },
]

// 3. Relevansi Pendidikan
// Relevansi Bidang Studi - Stacked Bar Chart
const relevansiBidangData = [
  { kategori: "Sangat Erat", persentase: 38 },
  { kategori: "Erat", persentase: 32 },
  { kategori: "Cukup Erat", persentase: 18 },
  { kategori: "Kurang Erat", persentase: 8 },
  { kategori: "Tidak Sama Sekali", persentase: 4 },
]

// Kesesuaian Tingkat Pendidikan - Pie Chart
const tingkatPendidikanData = [
  { name: "Setingkat", value: 756, color: "#00C49F" },
  { name: "Lebih Tinggi", value: 234, color: "#007FCB" },
  { name: "Lebih Rendah", value: 156, color: "#FF8042" },
  { name: "Tidak Perlu Pendidikan Tinggi", value: 88, color: "#8884d8" },
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
  { metode: "Perkuliahan", efektivitas: 85 },
  { metode: "Diskusi", efektivitas: 82 },
  { metode: "Praktikum", efektivitas: 88 },
  { metode: "Magang", efektivitas: 92 },
  { metode: "Kerja Lapangan", efektivitas: 86 },
  { metode: "Demonstrasi", efektivitas: 78 },
  { metode: "Partisipasi Proyek Riset", efektivitas: 80 },
]

// 6. Proses Pencarian Kerja
// Timeline Pencari Kerja - Bar Chart
const timelinePencarianData = [
  { kategori: "Sebelum Lulus", jumlah: 456 },
  { kategori: "Sesudah Lulus", jumlah: 678 },
  { kategori: "Tidak Mencari", jumlah: 100 },
]

// Strategi Pencarian Kerja - Horizontal Bar Chart
const strategiPencarianData = [
  { strategi: "Internet/Job Portal", jumlah: 678 },
  { strategi: "Melamar Langsung", jumlah: 534 },
  { strategi: "Networking/Relasi", jumlah: 456 },
  { strategi: "Pusat Karir Kampus", jumlah: 345 },
  { strategi: "Bursa Kerja", jumlah: 289 },
  { strategi: "Dihubungi Perusahaan", jumlah: 234 },
  { strategi: "Tempat Kerja Saat Kuliah", jumlah: 198 },
  { strategi: "Magang", jumlah: 167 },
  { strategi: "Iklan Koran", jumlah: 89 },
  { strategi: "Bisnis Sendiri", jumlah: 78 },
]

// Status Aktif Pencarian - Pie Chart
const statusPencarianData = [
  { name: "Mulai Bekerja", value: 792, color: "#00C49F" },
  { name: "Sedang Tunggu Hasil", value: 234, color: "#FFBB28" },
  { name: "Belum Pasti", value: 123, color: "#FF8042" },
  { name: "Tidak Mencari", value: 85, color: "#8884d8" },
]

// 7. Pembiayaan Pendidikan
const sumberDanaData = [
  { name: "Biaya Sendiri/Keluarga", value: 678, color: "#007FCB" },
  { name: "Beasiswa BIDIKMISI", value: 234, color: "#00C49F" },
  { name: "Beasiswa ADIK", value: 145, color: "#FFBB28" },
  { name: "Beasiswa PPA", value: 89, color: "#FF8042" },
  { name: "Beasiswa Perusahaan", value: 56, color: "#8884d8" },
  { name: "Lainnya", value: 32, color: "#82ca9d" },
]

// 8. Alasan Mengambil Pekerjaan Tidak Sesuai
const alasanPekerjaanData = [
  { alasan: "Prospek Karir Baik", jumlah: 345 },
  { alasan: "Pendapatan Lebih Tinggi", jumlah: 298 },
  { alasan: "Belum Dapat yang Sesuai", jumlah: 267 },
  { alasan: "Lebih Menarik", jumlah: 234 },
  { alasan: "Lebih Aman/Terjamin", jumlah: 198 },
  { alasan: "Awal Karir Harus Terima", jumlah: 178 },
  { alasan: "Jadwal Fleksibel", jumlah: 156 },
  { alasan: "Lokasi Dekat Rumah", jumlah: 134 },
  { alasan: "Lebih Suka Area Berbeda", jumlah: 112 },
  { alasan: "Menjamin Keluarga", jumlah: 89 },
]

const chartConfig = {
  value: { label: "Jumlah" },
  jumlah: { label: "Jumlah", color: "#007FCB" },
  persentase: { label: "Persentase", color: "#00C49F" },
  efektivitas: { label: "Efektivitas", color: "#FFBB28" },
  saatLulus: { label: "Saat Lulus", color: "#007FCB" },
  kebutuhanKerja: { label: "Kebutuhan Kerja", color: "#FF8042" },
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
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Status Alumni</CardTitle>
                      <CardDescription className="text-xs">
                        Distribusi status pekerjaan alumni saat ini
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <PieChart>
                          <Pie
                            data={statusAlumniData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusAlumniData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Pekerjaan ≤6 Bulan - Donut Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Pekerjaan ≤6 Bulan</CardTitle>
                      <CardDescription className="text-xs">
                        Alumni dapat pekerjaan dalam 6 bulan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <PieChart>
                          <Pie
                            data={pekerjaanCepatData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pekerjaanCepatData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Waktu Tunggu Kerja - Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Waktu Tunggu Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Distribusi waktu tunggu (bulan)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <BarChart data={waktuTungguData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="bulan" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="jumlah" fill="var(--color-jumlah)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Distribusi Pendapatan - Histogram */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Distribusi Pendapatan</CardTitle>
                      <CardDescription className="text-xs">
                        Rentang take home pay per bulan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <BarChart data={pendapatanData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="jumlah" fill="var(--color-persentase)" radius={[4, 4, 0, 0]} />
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
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base">Jenis Institusi Tempat Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Distribusi jenis tempat alumni bekerja
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <PieChart>
                          <Pie
                            data={jenisInstitusiData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {jenisInstitusiData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Tingkat Tempat Kerja - Bar Chart */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base">Tingkat Tempat Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Level organisasi tempat alumni bekerja
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <BarChart data={tingkatKerjaData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="level" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="jumlah" fill="var(--color-jumlah)" radius={[4, 4, 0, 0]} />
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
                    <CardHeader>
                      <CardTitle className="text-base">Relevansi Bidang Studi</CardTitle>
                      <CardDescription className="text-xs">
                        Keeratan hubungan bidang studi dengan pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <BarChart data={relevansiBidangData} layout="vertical">
                          <CartesianGrid horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis dataKey="kategori" type="category" width={100} tick={{ fontSize: 10 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="persentase" fill="var(--color-persentase)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Kesesuaian Tingkat Pendidikan - Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Kesesuaian Tingkat Pendidikan</CardTitle>
                      <CardDescription className="text-xs">
                        Kesesuaian tingkat pendidikan dengan pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <PieChart>
                          <Pie
                            data={tingkatPendidikanData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {tingkatPendidikanData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Gap Analysis Kompetensi Alumni - Radar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Gap Kompetensi</CardTitle>
                      <CardDescription className="text-xs">
                        Saat lulus vs kebutuhan dunia kerja
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <RadarChart data={kompetensiData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="kompetensi" tick={{ fontSize: 8 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                          <Radar
                            name="Saat Lulus"
                            dataKey="saatLulus"
                            stroke="var(--color-saatLulus)"
                            fill="var(--color-saatLulus)"
                            fillOpacity={0.5}
                          />
                          <Radar
                            name="Kebutuhan Kerja"
                            dataKey="kebutuhanKerja"
                            stroke="var(--color-kebutuhanKerja)"
                            fill="var(--color-kebutuhanKerja)"
                            fillOpacity={0.5}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Efektivitas Metode Pembelajaran */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Metode Pembelajaran</CardTitle>
                      <CardDescription className="text-xs">
                        Efektivitas metode pembelajaran (0-100)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <BarChart data={metodePembelajaranData} layout="vertical">
                          <CartesianGrid horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 8 }} />
                          <YAxis dataKey="metode" type="category" width={100} tick={{ fontSize: 8 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="efektivitas" fill="var(--color-efektivitas)" radius={[0, 4, 4, 0]} />
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
                    <CardHeader>
                      <CardTitle className="text-base">Timeline Pencarian Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Kapan alumni mulai mencari pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <BarChart data={timelinePencarianData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="kategori" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="jumlah" fill="var(--color-jumlah)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Status Aktif Pencarian */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Status Pencarian Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Kondisi pencarian kerja alumni saat ini
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <PieChart>
                          <Pie
                            data={statusPencarianData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusPencarianData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Strategi Pencarian Kerja */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Strategi Pencarian Kerja</CardTitle>
                      <CardDescription className="text-xs">
                        Metode yang digunakan alumni
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <BarChart data={strategiPencarianData} layout="vertical">
                          <CartesianGrid horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 8 }} />
                          <YAxis dataKey="strategi" type="category" width={120} tick={{ fontSize: 8 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="jumlah" fill="var(--color-jumlah)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Alasan Pekerjaan Tidak Sesuai */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Alasan Pekerjaan Tidak Sesuai</CardTitle>
                      <CardDescription className="text-xs">
                        Faktor mengambil pekerjaan di luar bidang
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <BarChart data={alasanPekerjaanData} layout="vertical">
                          <CartesianGrid horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 8 }} />
                          <YAxis dataKey="alasan" type="category" width={120} tick={{ fontSize: 8 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="jumlah" fill="var(--color-jumlah)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Section 5: Pembiayaan Pendidikan */}
              <Card>
                <CardHeader>
                  <CardTitle>Sumber Pembiayaan Pendidikan</CardTitle>
                  <CardDescription>
                    Distribusi sumber dana kuliah alumni
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={sumberDanaData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sumberDanaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
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
