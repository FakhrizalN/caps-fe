type Row = Record<string, string>;

import { PCA } from "ml-pca";
import { kmeans5D } from "./clustering";

export const buildProcessedData = (rows: Row[], config: any) => {
  return rows.map((row) => {
    const f14_enc =
      config.mappings.f14_map[row.F14] || parseFloat(row.F14) || 3;
    const f1101_enc =
      config.mappings.f1101_map[row.F1101] || parseFloat(row.F1101) || 3;
    const f5d_enc = parseFloat(row.F5d) || 0;
    const f502 = parseFloat(row.F502) || 0;
    const f505 = parseFloat(row.F505) || 0;
    return [f502, f505, f14_enc, f5d_enc, f1101_enc];
  });
};

export const applyImputerWithConfig = (data: number[][], config: any) => {
  if (!config) return data;
  return data.map((row) =>
    row.map((val, j) => (isNaN(val) ? config.imputer.medians[j] : val))
  );
};

export const applyScalerWithConfig = (data: number[][], config: any) => {
  if (!config) return data;
  return data.map((row) =>
    row.map((val, j) => (val - config.scaler.mean[j]) / config.scaler.std[j])
  );
};

export const runPCAWithResult = (scaled: number[][], nComponents = 2) => {
  const pca = new PCA(scaled);
  const pcaResult = pca.predict(scaled, { nComponents });
  const explainedVariance = pca.getExplainedVariance();
  return { pcaResult, explainedVariance };
};

export const runKmeans5DWrapper = (scaled: number[][], kClusters: number) => {
  const scaledPts5D = scaled.map((row) => ({
    x: row[0],
    y: row[1],
    z1: row[2],
    z2: row[3],
    z3: row[4],
  }));
  return kmeans5D(scaledPts5D, kClusters);
};

export const computeClustering = (
  rows: Row[],
  config: any,
  kClusters: number
) => {
  if (!config) return { clusterPlot: [], explainedVariance: [0, 0] };
  const processed = buildProcessedData(rows, config);
  const imputed = applyImputerWithConfig(processed, config);
  const scaled = applyScalerWithConfig(imputed, config);
  const { pcaResult, explainedVariance } = runPCAWithResult(scaled, 2);
  const kmeansResult = runKmeans5DWrapper(scaled, kClusters);

  if (!kmeansResult.clusters) return { clusterPlot: [], explainedVariance };

  const pcaData = pcaResult.to2DArray();
  const clusterPlot = pcaData.map((coords: number[], i: number) => ({
    x: coords[0],
    y: coords[1],
    cluster: kmeansResult.clusters[i],
  }));
  return { clusterPlot, explainedVariance };
};

export const numberFormatter = (n: number) => n.toLocaleString("id-ID");

export const computeComputedStats = (rows: Row[]) => {
  const total = rows.length;
  const employed = rows.filter((r) => (r.F8 || "").trim() === "1").length;

  const avgF502Arr = rows
    .map((r) => parseFloat(r.F502))
    .filter((v) => !isNaN(v) && v >= 0);
  const avgF502 =
    avgF502Arr.length > 0
      ? avgF502Arr.reduce((a, b) => a + b, 0) / avgF502Arr.length
      : 0;

  const avgF505Arr = rows
    .map((r) => parseFloat(r.F505))
    .filter((v) => !isNaN(v) && v > 0);
  const avgF505 =
    avgF505Arr.length > 0
      ? avgF505Arr.reduce((a, b) => a + b, 0) / avgF505Arr.length
      : 0;

  const hasIsEmployed = rows.some((r) => r.Is_Employed !== undefined);
  const responseRate = hasIsEmployed
    ? (rows.filter((r) => Number(r.Is_Employed) === 1).length /
        Math.max(1, total)) *
      100
    : (employed / Math.max(1, total)) * 100;

  const relevanCount = rows.filter((r) => {
    const raw = (r.F14 || "").trim();
    const num = parseFloat(raw);
    if (isNaN(num)) return false;
    return num === 1 || num === 2 || num === 3;
  }).length;

  const relevansiPct = (relevanCount / Math.max(1, total)) * 100;

  return [
    {
      title: "Total Responden",
      value: numberFormatter(total),
      description: "Total alumni yang merespons",
    },
    {
      title: "Alumni Bekerja",
      value: `${((employed / Math.max(1, total)) * 100).toFixed(0)}%`,
      description: "Dari total responden",
    },
    {
      title: "Rata-rata Waktu Tunggu",
      value: `${avgF502.toFixed(1)} bulan`,
      description: "Mendapat pekerjaan pertama",
    },
    {
      title: "Relevansi Pendidikan",
      value: `${relevansiPct.toFixed(0)}%`,
      description: "Pekerjaan sesuai bidang studi",
    },
    {
      title: "Rata-rata Pendapatan",
      value:
        avgF505 > 0 ? `Rp ${((avgF505 || 0) / 1_000_000).toFixed(1)}jt` : "-",
      description: "Take home pay per bulan",
    },
    {
      title: "Response Rate",
      value: `${responseRate.toFixed(0)}%`,
      description: "Dari total alumni (berdasarkan data)",
    },
  ];
};

export const computeStatusAlumni = (rows: Row[]) => {
  const agg: Record<string, number> = {};
  rows.forEach((r) => {
    const code = (r.F8 || "").trim();
    let label = "Lainnya";
    if (code === "1") label = "Bekerja";
    else if (code === "2") label = "Belum Memungkinkan Bekerja";
    else if (code === "3") label = "Wiraswasta";
    else if (code === "4") label = "Melanjutkan Pendidikan";
    else if (code === "5") label = "Mencari Kerja";
    agg[label] = (agg[label] || 0) + 1;
  });
  return Object.keys(agg).map((k) => ({
    status: k,
    alumni: agg[k],
    fill: undefined,
  }));
};

export const computePekerjaanCepat = (rows: Row[]) => {
  let ya = 0;
  let tidak = 0;
  rows.forEach((r) => {
    const v = parseFloat(r.F502);
    if (!isNaN(v) && v <= 6 && v >= 0) ya += 1;
    else if (!isNaN(v) && v > 6) tidak += 1;
  });
  return [
    { status: "Ya", alumni: ya, fill: undefined },
    { status: "Tidak", alumni: tidak, fill: undefined },
  ];
};

export const computeWaktuTunggu = (rows: Row[]) => {
  const bins: Record<string, number> = {
    "0-3": 0,
    "4-6": 0,
    "7-9": 0,
    "10-12": 0,
    "13-18": 0,
    ">18": 0,
  };
  rows.forEach((r) => {
    const v = parseFloat(r.F502);
    if (isNaN(v)) return;
    if (v <= 3) bins["0-3"] += 1;
    else if (v <= 6) bins["4-6"] += 1;
    else if (v <= 9) bins["7-9"] += 1;
    else if (v <= 12) bins["10-12"] += 1;
    else if (v <= 18) bins["13-18"] += 1;
    else bins[">18"] += 1;
  });
  return Object.keys(bins).map((k) => ({
    bulan: k,
    jumlah: bins[k],
    fill: undefined,
  }));
};

export const computePendapatanData = (rows: Row[]) => {
  const ranges: { key: string; min?: number; max?: number }[] = [
    { key: "< 2jt", max: 2000000 },
    { key: "2-4jt", min: 2000000, max: 4000000 },
    { key: "4-6jt", min: 4000000, max: 6000000 },
    { key: "6-8jt", min: 6000000, max: 8000000 },
    { key: "8-10jt", min: 8000000, max: 10000000 },
    { key: "10-15jt", min: 10000000, max: 15000000 },
    { key: "> 15jt", min: 15000000 },
  ];
  const counts = ranges.map(() => 0);
  rows.forEach((r) => {
    const v = parseFloat(r.F505);
    if (isNaN(v)) return;
    for (let i = 0; i < ranges.length; i++) {
      const rg = ranges[i];
      if (
        (rg.min === undefined || v >= rg.min) &&
        (rg.max === undefined || v < rg.max)
      ) {
        counts[i] = counts[i] + 1;
        break;
      }
    }
  });
  return ranges.map((rg, i) => ({
    range: rg.key,
    jumlah: counts[i],
    fill: undefined,
  }));
};

export const computeJenisInstitusi = (rows: Row[]) => {
  const map: Record<number, string> = {
    1: "Instansi Pemerintah",
    2: "Organisasi Non-Profit",
    3: "Perusahaan Swasta",
    4: "Wiraswasta",
    5: "Lainnya",
    6: "BUMN/BUMD",
    7: "Institusi Multilateral",
  };
  const agg: Record<string, number> = {};
  rows.forEach((r) => {
    const raw = (r.F1101 || "").trim();
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const label = map[num] || "Lainnya";
    agg[label] = (agg[label] || 0) + 1;
  });
  return Object.keys(agg).map((k) => ({
    institusi: k,
    jumlah: agg[k],
    fill: undefined,
  }));
};

export const computeTingkatKerja = (rows: Row[]) => {
  const map: Record<string, string> = {
    "1": "Lokal/Wilayah",
    "2": "Nasional",
    "3": "Multinasional",
  };
  const agg: Record<string, number> = {};
  rows.forEach((r) => {
    const code = (r.F5d || "").trim();
    const label = map[code] || "Lainnya";
    agg[label] = (agg[label] || 0) + 1;
  });
  return Object.keys(agg).map((k) => ({
    level: k,
    jumlah: agg[k],
    fill: undefined,
  }));
};

export const computeRelevansiBidang = (rows: Row[]) => {
  const mapLabel: Record<string, string> = {
    "1": "Sangat Erat",
    "2": "Erat",
    "3": "Cukup Erat",
    "4": "Kurang Erat",
    "5": "Tidak Sama Sekali",
  };
  const agg: Record<string, number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  rows.forEach((r) => {
    const raw = (r.F14 || "").trim();
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const code = String(num);
    if (agg[code] !== undefined) agg[code] += 1;
  });
  const total = rows.length || 1;
  return Object.keys(agg).map((k) => ({
    kategori: mapLabel[k],
    persentase: Math.round((agg[k] / total) * 100),
    fill: undefined,
  }));
};

export const computeTingkatPendidikan = (rows: Row[]) => {
  const map: Record<number, string> = {
    2: "Setingkat",
    1: "Lebih Tinggi",
    3: "Lebih Rendah",
    4: "Tidak Perlu Pendidikan Tinggi",
  };
  const agg: Record<string, number> = {};
  rows.forEach((r) => {
    const raw = (r.F15 || "").trim();
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const label = map[num] || "Lainnya";
    agg[label] = (agg[label] || 0) + 1;
  });
  return Object.keys(agg).map((k) => ({
    tingkat: k,
    jumlah: agg[k],
    fill: undefined,
  }));
};

export const computeKompetensiData = (rows: Row[]) => {
  const pairs: { label: string; a: string; b: string }[] = [
    { label: "Etika", a: "F1761", b: "F1762" },
    { label: "Keahlian Bidang Ilmu", a: "F1763", b: "F1764" },
    { label: "Bahasa Inggris", a: "F1765", b: "F1766" },
    { label: "Penggunaan TI", a: "F1767", b: "F1768" },
    { label: "Komunikasi", a: "F1769", b: "F1770" },
    { label: "Kerja Sama Tim", a: "F1771", b: "F1772" },
    { label: "Pengembangan Diri", a: "F1773", b: "F1774" },
  ];
  return pairs.map((p) => {
    const aVals = rows.map((r) => parseFloat(r[p.a])).filter((v) => !isNaN(v));
    const bVals = rows.map((r) => parseFloat(r[p.b])).filter((v) => !isNaN(v));
    const aMean = aVals.length
      ? aVals.reduce((s, v) => s + v, 0) / aVals.length
      : 0;
    const bMean = bVals.length
      ? bVals.reduce((s, v) => s + v, 0) / bVals.length
      : 0;
    return {
      kompetensi: p.label,
      saatLulus: Math.round((aMean / 5) * 100),
      kebutuhanKerja: Math.round((bMean / 5) * 100),
    };
  });
};

export const computeMetodePembelajaran = (rows: Row[]) => {
  const cols = ["F21", "F27", "F23", "F24", "F25", "F26", "F22"];
  const labels = [
    "Perkuliahan",
    "Diskusi",
    "Partisipasi Proyek Riset",
    "Magang",
    "Praktikum",
    "Kerja Lapangan",
    "Demonstrasi",
  ];
  const arr = labels.map((lab, i) => {
    const col = cols[i];
    const vals = rows.map((r) => parseFloat(r[col])).filter((v) => !isNaN(v));
    const mean = vals.length
      ? vals.reduce((s, v) => s + v, 0) / vals.length
      : 0;
    return {
      metode: lab,
      efektivitas: Math.round((mean / 5) * 100),
      fill: undefined,
    };
  });
  return arr;
};

export const computeTimelinePencarian = (rows: Row[]) => {
  const map: Record<number, string> = {
    1: "Sebelum Lulus",
    2: "Sesudah Lulus",
    3: "Tidak Mencari",
  };
  const agg: Record<string, number> = {};
  rows.forEach((r) => {
    const raw = (r.F301 || "").trim();
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const label = map[num] || "Lainnya";
    agg[label] = (agg[label] || 0) + 1;
  });
  return Object.keys(agg).map((k) => ({
    kategori: k,
    jumlah: agg[k],
    fill: undefined,
  }));
};

export const computeStatusPencarian = (rows: Row[]) => {
  const map: Record<number, string> = {
    1: "Tidak Mencari",
    2: "Menunggu Hasil Lamaran",
    3: "Sudah Dapat Pekerjaan",
    4: "Aktif Mencari",
    5: "Lainnya",
  };
  const agg: Record<string, number> = {};
  rows.forEach((r) => {
    const raw = (r.F1001 || "").trim();
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const label = map[num] || "Lainnya";
    agg[label] = (agg[label] || 0) + 1;
  });
  return Object.keys(agg).map((k) => ({
    status: k,
    jumlah: agg[k],
    fill: undefined,
  }));
};

export const computeStrategiPencarian = (rows: Row[]) => {
  const cols: { key: string; label: string }[] = [
    { key: "F401", label: "Iklan koran/majalah/brosur" },
    { key: "F402", label: "Melamar tanpa mengetahui lowongan" },
    { key: "F403", label: "Bursa/pameran kerja" },
    { key: "F404", label: "Internet/iklan online/milis" },
    { key: "F405", label: "Dihubungi perusahaan" },
    { key: "F406", label: "Kemenakertrans" },
    { key: "F407", label: "Agen tenaga kerja swasta" },
    { key: "F408", label: "Pusat pengembangan karir kampus" },
    { key: "F409", label: "Kantor kemahasiswaan/alumni" },
    { key: "F410", label: "Membangun jejaring sejak kuliah" },
    { key: "F411", label: "Melalui relasi" },
    { key: "F412", label: "Membangun bisnis sendiri" },
    { key: "F413", label: "Penempatan kerja/magang" },
    { key: "F414", label: "Tempat kerja sama saat kuliah" },
    { key: "F415", label: "Lainnya" },
  ];
  const arr = cols.map((c) => ({
    strategi: c.label,
    jumlah: rows.filter((r) => Number(r[c.key]) === 1).length,
    fill: undefined,
  }));
  return arr.sort((a, b) => b.jumlah - a.jumlah);
};

export const computeAlasanPekerjaan = (rows: Row[]) => {
  const cols: { key: string; label: string }[] = [
    { key: "F1603", label: "Prospek Karir Baik" },
    { key: "F1606", label: "Pendapatan Lebih Tinggi" },
    { key: "F1602", label: "Belum Dapat yang Sesuai" },
    { key: "F1608", label: "Lebih Menarik" },
    { key: "F1607", label: "Lebih Aman/Terjamin" },
    { key: "F1612", label: "Awal Karir Harus Terima" },
    { key: "F1609", label: "Jadwal Fleksibel" },
    { key: "F1610", label: "Lokasi Dekat Rumah" },
    { key: "F1604", label: "Lebih Suka Area Berbeda" },
    { key: "F1611", label: "Menjamin Keluarga" },
  ];
  const arr = cols.map((c) => ({
    alasan: c.label,
    jumlah: rows.filter((r) => Number(r[c.key]) === 1).length,
    fill: undefined,
  }));
  return arr.sort((a, b) => b.jumlah - a.jumlah);
};

export const computeSumberDana = (rows: Row[]) => {
  const map: Record<string, string> = {
    "1": "Biaya Sendiri/Keluarga",
    "2": "Beasiswa ADIK",
    "3": "Beasiswa BIDIKMISI",
    "4": "Beasiswa PPA",
    "5": "Beasiswa AFIRMASI",
    "6": "Beasiswa Perusahaan",
    "7": "Lainnya",
  };
  const agg: Record<string, number> = {};
  rows.forEach((r) => {
    const code = (r.F1201 || "").trim();
    const label = map[code] || "Lainnya";
    agg[label] = (agg[label] || 0) + 1;
  });
  return Object.keys(agg).map((k) => ({
    sumber: k,
    jumlah: agg[k],
    fill: undefined,
  }));
};

export const getClusterColors = (numClusters: number) => {
  const colors = [
    "#007FCB",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
    "#a4de6c",
    "#d084d0",
  ];
  return colors.slice(0, numClusters);
};

export const assignPalette = (items: any[], keyField: string) => {
  const palette = [
    "#007FCB",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
    "#a4de6c",
    "#d084d0",
  ];
  const map: Record<string, string> = {};
  let idx = 0;
  items.forEach((it) => {
    const k = String(it[keyField]);
    if (!map[k]) {
      map[k] = palette[idx % palette.length];
      idx += 1;
    }
  });
  return items.map((it) => ({ ...it, fill: map[String(it[keyField])] }));
};

export default {
  numberFormatter,
  computeComputedStats,
  computeStatusAlumni,
  computePekerjaanCepat,
  computeWaktuTunggu,
  computePendapatanData,
  computeJenisInstitusi,
  computeTingkatKerja,
  computeRelevansiBidang,
  computeTingkatPendidikan,
  computeKompetensiData,
  computeMetodePembelajaran,
  computeTimelinePencarian,
  computeStatusPencarian,
  computeStrategiPencarian,
  computeAlasanPekerjaan,
  computeSumberDana,
  assignPalette,
  getClusterColors,
};
