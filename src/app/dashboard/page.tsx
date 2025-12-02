"use client";
import {
  assignPalette as _assignPalette,
  getClusterColors as _getClusterColors,
  numberFormatter as _numberFormatter,
  computeAlasanPekerjaan,
  computeComputedStats,
  computeJenisInstitusi,
  computeKompetensiData,
  computeMetodePembelajaran,
  computePekerjaanCepat,
  computePendapatanData,
  computeRelevansiBidang,
  computeStatusAlumni,
  computeStatusPencarian,
  computeStrategiPencarian,
  computeSumberDana,
  computeTimelinePencarian,
  computeTingkatKerja,
  computeTingkatPendidikan,
  computeWaktuTunggu,
} from "../../../utils/dashboard-utils";

import { AppSidebar } from "@/components/app-sidebar";
import { ClusterInterpretation } from "@/components/clusterinterpretation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { parseCSV } from "../../../utils/csv";
import { computeClustering } from "../../../utils/dashboard-utils";
import { arForecast } from "../../../utils/forecasting";

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
};

export default function Dashboard() {
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [pcaVariance, setPcaVariance] = useState<number[]>([0, 0]);
  const [config, setConfig] = useState<any>(null);

  const [xFeature, setXFeature] = useState<string>("");
  const [yFeature, setYFeature] = useState<string>("");
  const [kClusters, setKClusters] = useState<number>(3);
  const [clusterResult, setClusterResult] = useState<
    Array<{ x: number; y: number; cluster: number }>
  >([]);

  const [tsSeries, setTsSeries] = useState<Array<{ t: string; value: number }>>(
    []
  );
  const [arOrder, setArOrder] = useState<number>(2);
  const [diff, setDiff] = useState<number>(0);
  const [horizon, setHorizon] = useState<number>(3);
  const [forecastResult, setForecastResult] = useState<number[]>([]);

  useEffect(() => {
    fetch("/preprocessing_config.json")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
      })
      .catch((err) => console.error("Failed to load config:", err));
  }, []);

  useEffect(() => {
    fetch("/data.csv")
      .then((r) => r.text())
      .then((txt) => {
        const parsed = parseCSV(txt);
        if (parsed.length > 0) {
          setColumns(Object.keys(parsed[0]));
          setRows(parsed);
          setCsvLoaded(true);

          setXFeature("F502");
          setYFeature("F505");
          setKClusters(4);

          if (Object.keys(parsed[0]).includes("Tahun Lulus")) {
            const agg: Record<string, number> = {};
            parsed.forEach((r) => {
              const y = r["Tahun Lulus"]?.trim();
              if (!y) return;
              agg[y] = (agg[y] || 0) + 1;
            });

            const years = Object.keys(agg)
              .map((k) => parseInt(k, 10))
              .filter((v) => !isNaN(v))
              .sort((a, b) => a - b);

            const series = years.map((y) => ({
              t: String(y),
              value: agg[String(y)],
            }));

            // kalau ada 2025, isi dengan rata-rata 3 tahun lengkap sebelumnya
            const idx2025 = years.indexOf(2025);
            if (idx2025 !== -1) {
              const last3 = series
                .filter((d) => parseInt(d.t, 10) < 2025)
                .slice(-3)
                .map((d) => d.value);

              if (last3.length > 0) {
                const avg = last3.reduce((s, v) => s + v, 0) / last3.length;
                series[idx2025].value = avg;
              }
            }

            setTsSeries(series);
          }
        }
      })
      .catch((err) => console.error("csv load", err));
  }, []);

  useEffect(() => {
    if (!csvLoaded || !xFeature || !yFeature || !config) return;

    const { clusterPlot, explainedVariance } = computeClustering(rows, config, kClusters);
    if (clusterPlot && clusterPlot.length > 0) {
      setClusterResult(clusterPlot);
    }
    if (explainedVariance) setPcaVariance(explainedVariance);
  }, [csvLoaded, xFeature, yFeature, kClusters, rows, config]);

  const numberFormatter = _numberFormatter;

  const computedStats = useMemo(() => computeComputedStats(rows), [rows]);
  const statusAlumni = useMemo(() => computeStatusAlumni(rows), [rows]);
  const pekerjaanCepat = useMemo(() => computePekerjaanCepat(rows), [rows]);
  const waktuTunggu = useMemo(() => computeWaktuTunggu(rows), [rows]);
  const pendapatanDataComputed = useMemo(() => computePendapatanData(rows), [rows]);
  const jenisInstitusi = useMemo(() => computeJenisInstitusi(rows), [rows]);
  const tingkatKerja = useMemo(() => computeTingkatKerja(rows), [rows]);
  const relevansiBidang = useMemo(() => computeRelevansiBidang(rows), [rows]);
  const tingkatPendidikan = useMemo(() => computeTingkatPendidikan(rows), [rows]);
  const kompetensiDataComputed = useMemo(() => computeKompetensiData(rows), [rows]);
  const metodePembelajaran = useMemo(() => computeMetodePembelajaran(rows), [rows]);
  const timelinePencarian = useMemo(() => computeTimelinePencarian(rows), [rows]);
  const statusPencarian = useMemo(() => computeStatusPencarian(rows), [rows]);
  const strategiPencarian = useMemo(() => computeStrategiPencarian(rows), [rows]);
  const alasanPekerjaan = useMemo(() => computeAlasanPekerjaan(rows), [rows]);
  const sumberDana = useMemo(() => computeSumberDana(rows), [rows]);

  useEffect(() => {
    if (tsSeries.length === 0) return;
    const values = tsSeries.map((s) => s.value);
    const rawForecast = arForecast(values, arOrder, diff, horizon);

    // jumlah lulusan tidak boleh minus
    const safeForecast = rawForecast.map((v) => Math.max(0, v));

    setForecastResult(safeForecast);
  }, [tsSeries, arOrder, diff, horizon]);

  const getClusterColors = _getClusterColors;
  const assignPalette = _assignPalette;

  const statusAlumniColored = useMemo(
    () => assignPalette(statusAlumni, "status"),
    [statusAlumni]
  );
  const pekerjaanCepatColored = useMemo(
    () => assignPalette(pekerjaanCepat, "status"),
    [pekerjaanCepat]
  );
  const waktuTungguColored = useMemo(
    () => assignPalette(waktuTunggu, "bulan"),
    [waktuTunggu]
  );
  const pendapatanDataColored = useMemo(
    () => assignPalette(pendapatanDataComputed, "range"),
    [pendapatanDataComputed]
  );
  const jenisInstitusiColored = useMemo(
    () => assignPalette(jenisInstitusi, "institusi"),
    [jenisInstitusi]
  );
  const tingkatKerjaColored = useMemo(
    () => assignPalette(tingkatKerja, "level"),
    [tingkatKerja]
  );
  const relevansiBidangColored = useMemo(
    () => assignPalette(relevansiBidang, "kategori"),
    [relevansiBidang]
  );
  const tingkatPendidikanColored = useMemo(
    () => assignPalette(tingkatPendidikan, "tingkat"),
    [tingkatPendidikan]
  );
  const kompetensiDataColored = useMemo(
    () => assignPalette(kompetensiDataComputed, "kompetensi"),
    [kompetensiDataComputed]
  );
  const metodePembelajaranColored = useMemo(
    () => assignPalette(metodePembelajaran, "metode"),
    [metodePembelajaran]
  );
  const timelinePencarianColored = useMemo(
    () => assignPalette(timelinePencarian, "kategori"),
    [timelinePencarian]
  );
  const statusPencarianColored = useMemo(
    () => assignPalette(statusPencarian, "status"),
    [statusPencarian]
  );
  const strategiPencarianColored = useMemo(
    () => assignPalette(strategiPencarian, "strategi"),
    [strategiPencarian]
  );
  const alasanPekerjaanColored = useMemo(
    () => assignPalette(alasanPekerjaan, "alasan"),
    [alasanPekerjaan]
  );
  const sumberDanaColored = useMemo(
    () => assignPalette(sumberDana, "sumber"),
    [sumberDana]
  );

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
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>

            <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Dashboard Tracer Study
                </h1>
                <p className="text-muted-foreground">
                  Analisis komprehensif data alumni dan insersi lulusan
                </p>
              </div>
              {/* KPI Cards */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {computedStats.map((stat) => (
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
                <h2 className="text-2xl font-bold">
                  Status dan Kondisi Kerja Alumni
                </h2>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {/* Status Alumni */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Status Alumni</CardTitle>
                      <CardDescription className="text-xs">
                        Distribusi status pekerjaan alumni saat ini
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[200px]"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={statusAlumniColored}
                            dataKey="alumni"
                            nameKey="status"
                          />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Pekerjaan ≤6 Bulan */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Pekerjaan ≤6 Bulan
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Alumni dapat pekerjaan dalam 6 bulan
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[200px]"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={pekerjaanCepatColored}
                            dataKey="alumni"
                            nameKey="status"
                          />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Waktu Tunggu Kerja */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Waktu Tunggu Kerja
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Distribusi waktu tunggu (bulan)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart accessibilityLayer data={waktuTungguColored}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="bulan"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar
                            dataKey="jumlah"
                            fill="var(--color-jumlah)"
                            radius={8}
                          />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Distribusi Pendapatan */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Distribusi Pendapatan
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Rentang take home pay per bulan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart
                          accessibilityLayer
                          data={pendapatanDataColored}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="range"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 5)}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar
                            dataKey="jumlah"
                            fill="var(--color-pendapatan)"
                            radius={8}
                          />
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
                  {/* Jenis Institusi */}
                  <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Jenis Institusi Tempat Kerja
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Distribusi jenis tempat alumni bekerja
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto w-full h-[340px]"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                          />
                          <Pie
                            data={jenisInstitusiColored}
                            dataKey="jumlah"
                            nameKey="institusi"
                            innerRadius={80}
                            outerRadius={130}
                            paddingAngle={2}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="plainline"
                          />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Tingkat Tempat Kerja */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Tingkat Tempat Kerja
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Level organisasi tempat alumni bekerja
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart accessibilityLayer data={tingkatKerjaColored}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="level"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar
                            dataKey="jumlah"
                            fill="var(--color-tingkat)"
                            radius={8}
                          />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Section 3: Relevansi Pendidikan */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Relevansi Pendidikan</h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  {/* Relevansi Bidang Studi */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Relevansi Bidang Studi
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Keeratan hubungan bidang studi dengan pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={chartConfig}
                        className="h-[200px] w-full overflow-hidden"
                      >
                        <BarChart
                          width={260}
                          height={200}
                          accessibilityLayer
                          data={relevansiBidangColored}
                          layout="vertical"
                          margin={{ top: 8, right: 15, left: 0, bottom: 8 }}
                        >
                          <CartesianGrid horizontal={false} />
                          <YAxis
                            dataKey="kategori"
                            type="category"
                            tickLine={false}
                            tickMargin={4}
                            axisLine={false}
                          />
                          <XAxis
                            dataKey="persentase"
                            type="number"
                            domain={[0, 100]}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                          />
                          <Bar
                            dataKey="persentase"
                            fill="var(--color-relevansi)"
                            radius={4}
                            barSize={16}
                          >
                            <LabelList
                              dataKey="persentase"
                              position="right"
                              offset={4}
                              className="fill-foreground"
                              formatter={(v: number) => `${v}%`}
                              fontSize={12}
                            />
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Kesesuaian Tingkat Pendidikan */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Kesesuaian Tingkat Pendidikan
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Kesesuaian tingkat pendidikan dengan pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto max-h-[200px] w-full"
                      >
                        <PieChart
                          margin={{ top: 8, right: 80, left: 8, bottom: 8 }}
                        >
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={tingkatPendidikanColored}
                            dataKey="jumlah"
                            nameKey="tingkat"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={2}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="plainline"
                          />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Gap Kompetensi Alumni */}
                  <Card>
                    <CardHeader className="pb-2 items-center">
                      <CardTitle className="text-base">
                        Gap Kompetensi Alumni
                      </CardTitle>
                      <CardDescription className="text-xs text-left">
                        Perbandingan kompetensi saat lulus vs kebutuhan kerja
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto h-[320px] w-full"
                      >
                        <RadarChart
                          data={kompetensiDataColored}
                          outerRadius={140}
                          margin={{ top: 20, right: 40, bottom: -10, left: 40 }}
                        >
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                          />
                          <PolarAngleAxis
                            dataKey="kompetensi"
                            tick={{ fontSize: 11 }}
                          />
                          <PolarGrid />
                          <Radar
                            name="Saat Lulus"
                            dataKey="saatLulus"
                            stroke="var(--color-saatLulus)"
                            fill="var(--color-saatLulus)"
                            fillOpacity={0.25}
                          />
                          <Radar
                            name="Kebutuhan Kerja"
                            dataKey="kebutuhanKerja"
                            stroke="var(--color-kebutuhanKerja)"
                            fill="var(--color-kebutuhanKerja)"
                            fillOpacity={0.25}
                          />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="plainline"
                          />
                        </RadarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Efektivitas Metode Pembelajaran */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Efektivitas Metode Pembelajaran
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Kontribusi metode pembelajaran terhadap pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={chartConfig}
                        className="h-[320px] w-full"
                      >
                        <BarChart
                          accessibilityLayer
                          data={metodePembelajaranColored}
                          layout="vertical"
                          margin={{ top: 8, right: 24, left: 24, bottom: 16 }}
                        >
                          <CartesianGrid horizontal={false} />
                          <YAxis
                            dataKey="metode"
                            type="category"
                            tickLine={false}
                            tickMargin={6}
                            axisLine={false}
                          />
                          <XAxis dataKey="efektivitas" type="number" hide />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                          />
                          <Bar
                            dataKey="efektivitas"
                            fill="var(--color-metode)"
                            radius={4}
                            barSize={24}
                          >
                            <LabelList
                              dataKey="metode"
                              position="insideLeft"
                              offset={10}
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

                <div className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
                  {/* Timeline Pencarian Kerja */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Timeline Pencarian Kerja
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Kapan alumni mulai mencari pekerjaan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={chartConfig}
                        className="h-[220px] w-full"
                      >
                        <BarChart
                          accessibilityLayer
                          data={timelinePencarianColored}
                          margin={{ top: 8, right: 16, left: 8, bottom: 32 }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="kategori"
                            tickLine={false}
                            tickMargin={8}
                            axisLine={false}
                            tickFormatter={(value) => value}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar
                            dataKey="jumlah"
                            fill="var(--color-timeline)"
                            radius={8}
                            barSize={100}
                          />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Status Aktif Pencarian */}
                  <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Status Pencarian Kerja
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Kondisi pencarian kerja alumni saat ini
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto h-[240px] w-full"
                      >
                        <PieChart
                          margin={{ top: 8, right: 110, left: 16, bottom: 8 }}
                        >
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={statusPencarianColored}
                            dataKey="jumlah"
                            nameKey="status"
                            innerRadius={60}
                            outerRadius={110}
                            paddingAngle={2}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="plainline"
                          />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Strategi Pencarian Kerja */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Strategi Pencarian Kerja
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Top 10 metode yang digunakan alumni
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart
                          accessibilityLayer
                          data={strategiPencarianColored.slice(0, 10)}
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
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                          />
                          <Bar
                            dataKey="jumlah"
                            fill="var(--color-strategi)"
                            radius={4}
                          >
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

                  {/* Alasan Mengambil Pekerjaan Tidak Sesuai Bidang */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Alasan Mengambil Pekerjaan Tidak Sesuai Bidang
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Top 10 faktor yang mempengaruhi keputusan alumni
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig}>
                        <BarChart
                          accessibilityLayer
                          data={alasanPekerjaanColored.slice(0, 10)}
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
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                          />
                          <Bar
                            dataKey="jumlah"
                            fill="var(--color-alasan)"
                            radius={4}
                          >
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

              {/* Section 5: Clustering & Forecasting */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Clustering & Forecasting</h2>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Pola Kelompok Profil Karir Alumni
                    </CardTitle>
                    <CardDescription>
                      Setiap titik adalah alumni, dikelompokkan berdasarkan kemiripan profil karirnya
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-3 items-center">
                      <label className="text-sm font-medium">
                        Jumlah kelompok:
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={10}
                        value={kClusters}
                        onChange={(e) => setKClusters(Number(e.target.value))}
                        className="input w-20"
                      />
                    </div>

                    <ResponsiveContainer width="100%" height={450}>
                      <ScatterChart
                        margin={{ top: 10, right: 30, bottom: 30, left: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          dataKey="x"
                          name="PC1"
                          label={{
                            value: `PC1 (${pcaVariance[0]?.toFixed(
                              1
                            )}% variance)`,
                            position: "insideBottom",
                            offset: -10,
                          }}
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          name="PC2"
                          label={{
                            value: `PC2 (${pcaVariance[1]?.toFixed(
                              1
                            )}% variance)`,
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />

                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          iconType="plainline"
                          wrapperStyle={{
                            paddingTop: 30, 
                          }}
                        />

                        {Array.from({ length: kClusters }).map(
                          (_, clusterIdx) => {
                            const clusterData = clusterResult.filter(
                              (d) => d.cluster === clusterIdx
                            );
                            const colors = getClusterColors(kClusters);

                            return (
                              <Scatter
                                key={`cluster-${clusterIdx}`}
                                name={`Cluster ${clusterIdx + 1}`}
                                data={clusterData}
                                fill={colors[clusterIdx]}
                              />
                            );
                          }
                        )}
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interpretasi Profil Cluster</CardTitle>
                    <CardDescription>
                      Gambaran singkat tiap kelompok alumni berdasarkan rata-rata indikator karir.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ClusterInterpretation
                        clusterResult={clusterResult}
                        rows={rows}
                        kClusters={kClusters}
                        getClusterColors={getClusterColors}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Forecasting (AR approx.)
                    </CardTitle>
                    <CardDescription>
                      Perkiraan jumlah lulusan per tahun berdasarkan tren data beberapa tahun terakhir.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-3 items-center">
                      {/* <label className="text-sm">Riwayat (p):</label>
                      <input
                        type="number"
                        min={0}
                        value={arOrder}
                        onChange={(e) =>
                          setArOrder(Number(e.target.value) || 0)
                        }
                        className="input w-20"
                      />
                      <label className="text-sm">Mode tren (d):</label>
                      <input
                        type="number"
                        min={0}
                        value={diff}
                        onChange={(e) => setDiff(Number(e.target.value) || 0)}
                        className="input w-20"
                      /> */}
                      <label className="text-sm">Tahun yang diprediksi:</label>
                      <input
                        type="number"
                        min={1}
                        value={horizon}
                        onChange={(e) =>
                          setHorizon(Number(e.target.value) || 1)
                        }
                        className="input w-20"
                      />
                      <div className="ml-auto text-sm text-muted-foreground">
                        Series points: {tsSeries.length}
                      </div>
                    </div>

                    <div style={{ width: "100%", height: 360 }}>
                      <ResponsiveContainer>
                        <LineChart
                          data={tsSeries
                            .map((s) => ({ t: s.t, value: s.value }))
                            .concat(
                              forecastResult.map((v, i) => ({
                                t: `F+${i + 1}`,
                                value: v,
                              }))
                            )}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="t" />
                          <YAxis />
                          <Tooltip />
                          <Legend verticalAlign="bottom" iconType="plainline" />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#007FCB"
                            dot={true}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}