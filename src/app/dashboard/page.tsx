"use client";
import {
    assignPalette as _assignPalette,
    getClusterColors as _getClusterColors,
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
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    clusteringPredict,
    getCustomForecast,
    getForecastData,
    type ClusteringInput,
} from "@/lib/ml-api";
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
import { kmeans2D } from "../../../utils/clustering";
import { parseCSV } from "../../../utils/csv";

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
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [pcaVariance, setPcaVariance] = useState<number[]>([0, 0]);

  const [clusterResult, setClusterResult] = useState<
    Array<{
      x: number;
      y: number;
      cluster: number;
      rowData?: Record<string, string>;
    }>
  >([]);
  const [pcaData, setPcaData] = useState<
    Array<{ x: number; y: number; rowData: Record<string, string> }>
  >([]);

  // Period filter for clustering
  const [yearStart, setYearStart] = useState<number>(2016);
  const [yearEnd, setYearEnd] = useState<number>(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [kClusters, setKClusters] = useState<number>(4);

  // Forecast settings
  const [forecastYears, setForecastYears] = useState<number>(5);

  // API state
  const [clusteringLoading, setClusteringLoading] = useState<boolean>(false);
  const [forecastLoading, setForecastLoading] = useState<boolean>(false);
  const [clusteringError, setClusteringError] = useState<string | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [apiForecastData, setApiForecastData] = useState<any>(null);

  useEffect(() => {
    fetch("/data.csv")
      .then((r) => r.text())
      .then((txt) => {
        const parsed = parseCSV(txt);
        if (parsed.length > 0) {
          setRows(parsed);
          setCsvLoaded(true);

          // Extract available years from "Tahun Lulus" column
          const years = parsed
            .map((row) => parseInt(row["Tahun Lulus"], 10))
            .filter((year) => !isNaN(year))
            .sort((a, b) => a - b);

          const uniqueYears = Array.from(new Set(years));
          setAvailableYears(uniqueYears);

          // Set default range to all available years
          if (uniqueYears.length > 0) {
            setYearStart(uniqueYears[0]);
            setYearEnd(uniqueYears[uniqueYears.length - 1]);
          }
        }
      })
      .catch((err) => console.error("csv load", err));
  }, []);

  // Filter rows by year range for clustering
  const filteredRows = useMemo(() => {
    if (!yearStart || !yearEnd) return rows;
    return rows.filter((row) => {
      const tahunLulus = row["Tahun Lulus"];
      if (!tahunLulus) return false; // Exclude rows without graduation year
      const year =
        typeof tahunLulus === "number" ? tahunLulus : parseInt(tahunLulus);
      return !isNaN(year) && year >= yearStart && year <= yearEnd;
    });
  }, [rows, yearStart, yearEnd]);

  // Count valid rows that have all required clustering columns
  const validClusteringRows = useMemo(() => {
    const requiredColumns = ["F502", "F505", "F14_enc", "F5d_enc", "F1101_enc"];
    return filteredRows.filter((row) => {
      return requiredColumns.every(
        (col) => row[col] !== undefined && row[col] !== null && row[col] !== ""
      );
    });
  }, [filteredRows]);

  // Clustering: Fetch from API with period filter
  useEffect(() => {
    if (!csvLoaded || rows.length === 0) return;

    const fetchClustering = async () => {
      setClusteringLoading(true);
      setClusteringError(null);

      try {
        // Use the memoized valid clustering rows
        const dataToCluster = validClusteringRows;

        if (dataToCluster.length === 0) {
          setClusteringError(
            `Tidak ada data valid untuk periode ${yearStart}-${yearEnd}`
          );
          setClusterResult([]);
          setClusteringLoading(false);
          return;
        }

        // Prepare batch data for clustering API - validate each row
        const batchData: ClusteringInput[] = dataToCluster.map((row, idx) => {
          const data = {
            F502: parseFloat(row["F502"]) || 0,
            F505: parseFloat(row["F505"]) || 0,
            F14_enc: parseFloat(row["F14_enc"]) || 0,
            F5d_enc: parseFloat(row["F5d_enc"]) || 0,
            F1101_enc: parseFloat(row["F1101_enc"]) || 0,
          };

          return data;
        });

        const result = await clusteringPredict(batchData);

        if (result && "results" in result) {
          // Store PCA data without cluster assignment
          const pcaPoints = result.results.map((r, i) => ({
            x: r.pca_coordinates?.pc1 || batchData[i].F502,
            y: r.pca_coordinates?.pc2 || batchData[i].F505,
            rowData: dataToCluster[i],
          }));
          setPcaData(pcaPoints);

          // Transform API result to scatter plot format using PCA coordinates
          // Include original row data for ClusterInterpretation
          const clusterPlot = result.results.map((r, i) => ({
            x: r.pca_coordinates?.pc1 || batchData[i].F502,
            y: r.pca_coordinates?.pc2 || batchData[i].F505,
            cluster: r.cluster,
            rowData: dataToCluster[i], // Store original row data
          }));

          setClusterResult(clusterPlot);

          // Set PCA variance if available
          if (result.pca_variance) {
            setPcaVariance([
              result.pca_variance[0] * 100,
              result.pca_variance[1] * 100,
            ]);
          }
        }
      } catch (error) {
        console.error("Clustering API error:", error);
        setClusteringError(
          error instanceof Error ? error.message : "Clustering failed"
        );
      } finally {
        setClusteringLoading(false);
      }
    };

    fetchClustering();
  }, [csvLoaded, validClusteringRows, yearStart, yearEnd]);

  // Re-cluster when k changes (using local k-means on PCA data)
  useEffect(() => {
    if (pcaData.length === 0) return;

    // Perform k-means clustering on PCA coordinates
    const clusterAssignments = kmeans2D(pcaData, kClusters);

    // Update cluster result with new assignments
    const updatedClusterResult = pcaData.map((point, i) => ({
      x: point.x,
      y: point.y,
      cluster: clusterAssignments[i],
      rowData: point.rowData,
    }));

    setClusterResult(updatedClusterResult);
  }, [kClusters, pcaData]);

  const computedStats = useMemo(() => computeComputedStats(rows), [rows]);
  const statusAlumni = useMemo(() => computeStatusAlumni(rows), [rows]);
  const pekerjaanCepat = useMemo(() => computePekerjaanCepat(rows), [rows]);
  const waktuTunggu = useMemo(() => computeWaktuTunggu(rows), [rows]);
  const pendapatanDataComputed = useMemo(
    () => computePendapatanData(rows),
    [rows]
  );
  const jenisInstitusi = useMemo(() => computeJenisInstitusi(rows), [rows]);
  const tingkatKerja = useMemo(() => computeTingkatKerja(rows), [rows]);
  const relevansiBidang = useMemo(() => computeRelevansiBidang(rows), [rows]);
  const tingkatPendidikan = useMemo(
    () => computeTingkatPendidikan(rows),
    [rows]
  );
  const kompetensiDataComputed = useMemo(
    () => computeKompetensiData(rows),
    [rows]
  );
  const metodePembelajaran = useMemo(
    () => computeMetodePembelajaran(rows),
    [rows]
  );
  const timelinePencarian = useMemo(
    () => computeTimelinePencarian(rows),
    [rows]
  );
  const statusPencarian = useMemo(() => computeStatusPencarian(rows), [rows]);
  const strategiPencarian = useMemo(
    () => computeStrategiPencarian(rows),
    [rows]
  );
  const alasanPekerjaan = useMemo(() => computeAlasanPekerjaan(rows), [rows]);
  const sumberDana = useMemo(() => computeSumberDana(rows), [rows]);

  // Forecasting: Fetch from API
  useEffect(() => {
    const fetchForecast = async () => {
      setForecastLoading(true);
      setForecastError(null);

      try {
        // Get historical data first
        const historicalResult = await getForecastData();

        // Get custom forecast with user-defined steps
        const customResult = await getCustomForecast(forecastYears);

        if (historicalResult && customResult) {
          // Combine historical and custom forecast
          const combinedData = {
            ...historicalResult,
            forecast_data: customResult.forecast_years.map((year, idx) => ({
              year,
              lulusan: Math.round(customResult.forecast_values[idx]),
            })),
            forecast_years: customResult.forecast_years,
            forecast_values: customResult.forecast_values,
            model_info: {
              ...historicalResult.model_info,
              ...customResult.model_info,
            },
          };

          setApiForecastData(combinedData);
        }
      } catch (error) {
        console.error("Forecast API error:", error);
        setForecastError(
          error instanceof Error ? error.message : "Forecast failed"
        );
      } finally {
        setForecastLoading(false);
      }
    };

    fetchForecast();
  }, [forecastYears]);

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
                      <div className="overflow-x-auto">
                        <div className="min-w-[500px]">
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
                        </div>
                      </div>
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
                      <div className="overflow-x-auto">
                        <div className="min-w-[500px]">
                          <ChartContainer config={chartConfig}>
                            <BarChart
                              accessibilityLayer
                              data={tingkatKerjaColored}
                            >
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
                        </div>
                      </div>
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
                      <div className="overflow-x-auto">
                        <div className="min-w-[500px]">
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
                        </div>
                      </div>
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
                      <div className="overflow-x-auto">
                        <div className="min-w-[550px]">
                          <ChartContainer
                            config={chartConfig}
                            className="mx-auto h-[240px] w-full"
                          >
                            <PieChart
                              margin={{
                                top: 8,
                                right: 110,
                                left: 16,
                                bottom: 8,
                              }}
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
                        </div>
                      </div>
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
                    <CardTitle className="flex items-center justify-between">
                      <span>Pola Kelompok Profil Karir Alumni</span>
                      {clusteringLoading && (
                        <span className="text-sm font-normal text-muted-foreground">
                          Loading...
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Setiap titik adalah alumni, dikelompokkan berdasarkan
                      kemiripan profil karirnya
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Year Range Validation Warning */}
                    {yearStart > yearEnd && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                        <strong>Peringatan:</strong> Tahun awal tidak boleh
                        lebih besar dari tahun akhir. Silakan perbaiki range
                        tahun.
                      </div>
                    )}

                    {/* Period Range & Cluster Filter - Single Row */}
                    <div className="mb-6 flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Dari Tahun
                        </label>
                        <select
                          value={yearStart}
                          onChange={(e) => {
                            const newStart = Number(e.target.value);
                            setYearStart(newStart);
                            // Auto-adjust yearEnd if needed
                            if (newStart > yearEnd) {
                              setYearEnd(newStart);
                            }
                          }}
                          className={`w-full mt-1 px-3 py-2 border rounded-md bg-white ${
                            yearStart > yearEnd ? "border-amber-500" : ""
                          }`}
                        >
                          {availableYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Sampai Tahun
                        </label>
                        <select
                          value={yearEnd}
                          onChange={(e) => setYearEnd(Number(e.target.value))}
                          className={`w-full mt-1 px-3 py-2 border rounded-md bg-white ${
                            yearStart > yearEnd ? "border-amber-500" : ""
                          }`}
                        >
                          {availableYears
                            .filter((year) => year >= yearStart)
                            .map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          Jumlah Cluster (K)
                        </label>
                        <input
                          type="number"
                          min="2"
                          max="10"
                          value={kClusters}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 2 && val <= 10) {
                              setKClusters(val);
                            }
                          }}
                          className="w-full mt-1 px-3 py-2 border rounded-md bg-white"
                        />
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <div className="font-medium">
                          {validClusteringRows.length} alumni
                        </div>
                        <div className="text-xs">
                          Periode {yearStart}-{yearEnd}
                        </div>
                        {validClusteringRows.length < filteredRows.length && (
                          <div className="text-xs text-amber-600 mt-1">
                            ({filteredRows.length - validClusteringRows.length}{" "}
                            data tidak lengkap)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="min-w-[600px]">
                        <ResponsiveContainer width="100%" height={450}>
                          <ScatterChart
                            margin={{
                              top: 10,
                              right: 30,
                              bottom: 30,
                              left: 30,
                            }}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interpretasi Profil Cluster</CardTitle>
                    <CardDescription>
                      Gambaran singkat tiap kelompok alumni berdasarkan
                      rata-rata indikator karir.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ClusterInterpretation
                        clusterResult={clusterResult}
                        rows={filteredRows}
                        kClusters={kClusters}
                        getClusterColors={getClusterColors}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Forecasting Jumlah Lulusan</span>
                      {forecastLoading && (
                        <span className="text-sm font-normal text-muted-foreground">
                          Loading...
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Perkiraan jumlah lulusan per tahun berdasarkan tren data
                      beberapa tahun terakhir.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Forecast Years Input */}
                    <div className="mb-6 flex gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Tahun yang diprediksi (1-10):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={forecastYears}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= 1 && val <= 10) {
                            setForecastYears(val);
                          }
                        }}
                        className="w-20 px-3 py-2 border rounded-md bg-white"
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <div className="min-w-[1000px]">
                        <div style={{ width: "100%", height: 360 }}>
                          <ResponsiveContainer>
                            <LineChart
                              data={
                                apiForecastData
                                  ? [
                                      // Historical data from API
                                      ...apiForecastData.historical_data.map(
                                        (d: any) => ({
                                          t: String(d.year),
                                          value: d.lulusan,
                                          type: "historical",
                                        })
                                      ),
                                      // Forecast data from API
                                      ...apiForecastData.forecast_data.map(
                                        (d: any) => ({
                                          t: String(d.year),
                                          value: d.lulusan,
                                          type: "forecast",
                                        })
                                      ),
                                    ]
                                  : []
                              }
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
                                strokeWidth={2}
                                dot={(props) => {
                                  const { cx, cy, payload, index } = props;
                                  return (
                                    <circle
                                      key={`dot-${index}`}
                                      cx={cx}
                                      cy={cy}
                                      r={payload.type === "forecast" ? 5 : 3}
                                      fill={
                                        payload.type === "forecast"
                                          ? "#FF8042"
                                          : "#007FCB"
                                      }
                                      stroke="#fff"
                                      strokeWidth={2}
                                    />
                                  );
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
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
