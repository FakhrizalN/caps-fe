import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ClusterData {
  x: number;
  y: number;
  cluster: number;
  rowData?: Record<string, string>;
}

interface Props {
  clusterResult: ClusterData[];
  rows: Array<Record<string, string>>;
  kClusters: number;
  getClusterColors: (n: number) => string[];
}

export function ClusterInterpretation({
  clusterResult,
  rows,
  kClusters,
  getClusterColors,
}: Props) {
  const getKesesuaianLabel = (val: number) => {
    if (val <= 1.5) return "⭐⭐⭐ Sangat Erat";
    if (val <= 2.5) return "⭐⭐ Erat";
    if (val <= 3.5) return "⭐ Cukup Erat";
    return "❌ Kurang Erat";
  };

  const getInstitusiLabel = (val: number) => {
    if (val <= 1.5) return "🏛️ Pemerintah";
    if (val <= 2.5) return "🤝 Non-Profit";
    if (val <= 3.5) return "🏢 Swasta";
    if (val <= 4.5) return "💼 Wiraswasta";
    if (val <= 6) return "🏭 BUMN";
    return "🌐 Multilateral";
  };

  const generateInterpretation = (
    waktu: number,
    gaji: number,
    kesesuaian: number,
    lamaStudi: number,
    institusi: number
  ) => {
    const traits = [];

    if (waktu < 3) traits.push("✅ Cepat dapat kerja");
    else if (waktu > 6) traits.push("⚠️ Waktu tunggu lama");

    if (gaji > 6000000) traits.push("💰 Gaji tinggi");
    else if (gaji >= 4500000) traits.push("💵 Gaji menengah-atas");
    else if (gaji >= 3500000) traits.push("💵 Gaji menengah");
    else if (gaji >= 2500000) traits.push("💸 Gaji standar");
    else traits.push("💵 Gaji entry-level");

    if (kesesuaian <= 2) traits.push("🎯 Kerja sesuai bidang");
    else if (kesesuaian >= 4) traits.push("🔄 Kerja kurang sesuai");

    if (lamaStudi > 4.5) traits.push("📚 Lulus lama");

    if (institusi <= 2) traits.push("🏛️ Dominan pemerintah/non-profit");
    else if (institusi <= 3.5) traits.push("🏢 Dominan swasta");
    else traits.push("💼 Banyak wirausaha");

    return traits.length > 0 ? traits.join(" • ") : "Profil standar";
  };

  const colors = getClusterColors(kClusters);

  return (
    <>
      {Array.from({ length: kClusters }).map((_, clusterIdx) => {
        const clusterData = clusterResult.filter(
          (d) => d.cluster === clusterIdx
        );
        if (clusterData.length === 0) return null;

        let sumF502 = 0,
          sumF505 = 0,
          sumF14 = 0,
          sumF5d = 0,
          sumF1101 = 0;

        clusterData.forEach((point) => {
          // Use rowData from point if available, otherwise fallback to rows array
          const row = point.rowData || rows[clusterResult.indexOf(point)];

          // Validate row exists before accessing properties
          if (!row) {
            console.warn(`Row data not found for cluster point`);
            return;
          }

          sumF502 += parseFloat(row.F502) || 0;
          sumF505 += parseFloat(row.F505) || 0;
          sumF14 += parseFloat(row.F14) || 3;
          sumF5d += parseFloat(row.F5d) || 0;
          sumF1101 += parseFloat(row.F1101) || 3;
        });

        const count = clusterData.length;
        const avgF502 = (sumF502 / count).toFixed(1);
        const avgF505 = Math.round(sumF505 / count);
        const avgF14 = (sumF14 / count).toFixed(1);
        const avgF5d = (sumF5d / count).toFixed(1);
        const avgF1101 = (sumF1101 / count).toFixed(1);

        return (
          <Card
            key={clusterIdx}
            style={{ borderLeft: `4px solid ${colors[clusterIdx]}` }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors[clusterIdx] }}
                />
                Cluster {clusterIdx + 1}
              </CardTitle>
              <CardDescription className="text-xs">
                {count} alumni ({((count / rows.length) * 100).toFixed(1)}%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waktu Tunggu:</span>
                <span className="font-medium">{avgF502} bulan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gaji Rata-rata:</span>
                <span className="font-medium">
                  Rp {Number(avgF505).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kesesuaian:</span>
                <span className="font-medium text-xs">
                  {getKesesuaianLabel(parseFloat(avgF14))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lama Studi:</span>
                <span className="font-medium">{avgF5d} tahun</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Institusi:</span>
                <span className="font-medium text-xs">
                  {getInstitusiLabel(parseFloat(avgF1101))}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t text-xs text-muted-foreground">
                {generateInterpretation(
                  parseFloat(avgF502),
                  avgF505,
                  parseFloat(avgF14),
                  parseFloat(avgF5d),
                  parseFloat(avgF1101)
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
