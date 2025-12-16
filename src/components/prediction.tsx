"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  Loader2,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

const F14_OPTIONS = [
  "Sangat Erat",
  "Erat",
  "Cukup Erat",
  "Kurang Erat",
  "Tidak Sama Sekali",
];

const F1101_OPTIONS = [
  "Instansi pemerintah",
  "Organisasi non-profit/Lembaga Swadaya Masyarakat",
  "Perusahaan swasta",
  "Wiraswasta/perusahaan sendiri",
  "Lainnya",
  "BUMN/BUMD",
];

const COMPETENCY_LEVELS = ["1", "2", "3", "4", "5"];

interface CompetencyPair {
  saat_lulus: string;
  diperlukan: string;
}

interface FormData {
  F502: string; // Waktu tunggu kerja (bulan)
  F14: string; // Hubungan studi dengan pekerjaan
  F5d: string; // Tingkat tempat kerja
  F1101: string; // Jenis perusahaan
  tahun_lulus: string; // Tahun kelulusan
  // Competency pairs (saat lulus vs diperlukan pekerjaan)
  etika: CompetencyPair;
  keahlian: CompetencyPair;
  english: CompetencyPair;
  it: CompetencyPair;
  komunikasi: CompetencyPair;
  teamwork: CompetencyPair;
  development: CompetencyPair;
}

interface PredictionResult {
  prediction: number;
  predicted_label: string;
  confidence: number;
}

// Helper function untuk interpretasi hasil
const getPredictionInterpretation = (label: string, formData: FormData) => {
  const waitTime = parseFloat(formData.F502);
  const workLevel = parseFloat(formData.F5d);

  // Parse label untuk mendapatkan range gaji (hanya 2 kategori)
  const isHighSalary =
    label.includes(">") ||
    label.toLowerCase().includes("tinggi") ||
    label.toLowerCase().includes("high");

  let salaryRange = "";
  let salaryIcon = "";
  let salaryColor = "";
  let salaryDescription = "";

  if (isHighSalary) {
    salaryRange = "Di atas Rp 5.000.000";
    salaryIcon = "💰";
    salaryColor = "text-green-700";
    salaryDescription =
      "Kategori High Earner - Gaji bulanan di atas 5 juta rupiah";
  } else {
    salaryRange = "Di bawah Rp 5.000.000";
    salaryIcon = "💵";
    salaryColor = "text-blue-700";
    salaryDescription =
      "Kategori Low Earner - Gaji bulanan di bawah 5 juta rupiah";
  }

  // Interpretasi waktu tunggu
  let waitInterpretation = "";
  if (waitTime < 3) {
    waitInterpretation = "Sangat cepat mendapat pekerjaan";
  } else if (waitTime < 6) {
    waitInterpretation = "Cukup cepat mendapat pekerjaan";
  } else if (waitTime < 12) {
    waitInterpretation = "Waktu tunggu normal";
  } else {
    waitInterpretation = "Membutuhkan waktu lebih lama";
  }

  // Interpretasi tingkat pekerjaan (skala operasi)
  let levelInterpretation = "";
  let levelDetail = "";
  if (workLevel == 1) {
    levelInterpretation = "Lokal/Wilayah";
    levelDetail = "Beroperasi di tingkat lokal atau wilayah tertentu";
  } else if (workLevel == 2) {
    levelInterpretation = "Regional";
    levelDetail = "Beroperasi di beberapa wilayah/provinsi";
  } else if (workLevel == 3) {
    levelInterpretation = "Nasional";
    levelDetail = "Beroperasi di seluruh Indonesia";
  } else if (workLevel == 4) {
    levelInterpretation = "Multinasional";
    levelDetail = "Perusahaan asing yang beroperasi di beberapa negara";
  } else {
    levelInterpretation = "Internasional";
    levelDetail = "Beroperasi di tingkat global/internasional";
  }

  return {
    salaryRange,
    salaryIcon,
    salaryColor,
    salaryDescription,
    waitInterpretation,
    levelInterpretation,
    levelDetail,
  };
};

// Helper function untuk generate rekomendasi dinamis
const generateDynamicRecommendations = (label: string, formData: FormData) => {
  const recommendations: string[] = [];
  const isHighSalary =
    label.includes(">") ||
    label.toLowerCase().includes("tinggi") ||
    label.toLowerCase().includes("high");

  // Hitung gap untuk setiap kompetensi
  const gaps = {
    etika:
      parseFloat(formData.etika.diperlukan) -
      parseFloat(formData.etika.saat_lulus),
    keahlian:
      parseFloat(formData.keahlian.diperlukan) -
      parseFloat(formData.keahlian.saat_lulus),
    english:
      parseFloat(formData.english.diperlukan) -
      parseFloat(formData.english.saat_lulus),
    it: parseFloat(formData.it.diperlukan) - parseFloat(formData.it.saat_lulus),
    komunikasi:
      parseFloat(formData.komunikasi.diperlukan) -
      parseFloat(formData.komunikasi.saat_lulus),
    teamwork:
      parseFloat(formData.teamwork.diperlukan) -
      parseFloat(formData.teamwork.saat_lulus),
    development:
      parseFloat(formData.development.diperlukan) -
      parseFloat(formData.development.saat_lulus),
  };

  // Temukan kompetensi dengan gap terbesar (perlu ditingkatkan)
  const gapEntries = Object.entries(gaps).sort((a, b) => b[1] - a[1]);
  const biggestGaps = gapEntries.filter(([_, gap]) => gap > 0).slice(0, 3);

  const competencyNames: Record<string, string> = {
    etika: "Etika",
    keahlian: "Keahlian Bidang Ilmu",
    english: "Bahasa Inggris",
    it: "Teknologi Informasi",
    komunikasi: "Komunikasi",
    teamwork: "Kerja Sama Tim",
    development: "Pengembangan Diri",
  };

  // Rekomendasi berdasarkan kategori gaji
  if (isHighSalary) {
    recommendations.push(
      "🎉 Profil Anda menunjukkan potensi sebagai High Earner. Pertahankan performa Anda!"
    );

    // Jika ada gap, berikan saran untuk menjaga posisi
    if (biggestGaps.length > 0) {
      const [topGap] = biggestGaps;
      recommendations.push(
        `💪 Tingkatkan ${
          competencyNames[topGap[0]]
        } untuk mempertahankan atau meningkatkan posisi Anda.`
      );
    }

    // Rekomendasi berdasarkan waktu tunggu
    const waitTime = parseFloat(formData.F502);
    if (waitTime < 6) {
      recommendations.push(
        "⚡ Dengan waktu tunggu yang cepat, Anda memiliki daya saing tinggi di pasar kerja."
      );
    }

    // Rekomendasi pengembangan karir
    recommendations.push(
      "🎯 Fokus pada pengembangan leadership dan networking untuk mencapai posisi yang lebih tinggi."
    );
  } else {
    // Low Earner - berikan rekomendasi improvement
    // Rekomendasi berdasarkan gap kompetensi terbesar
    if (biggestGaps.length > 0) {
      // Group by priority level
      const highPriority = biggestGaps.filter(([_, gap]) => gap > 1.5);
      const mediumPriority = biggestGaps.filter(
        ([_, gap]) => gap > 0.5 && gap <= 1.5
      );

      // High priority competencies
      if (highPriority.length > 0) {
        const compList = highPriority
          .map(([comp]) => competencyNames[comp])
          .join(", ");
        recommendations.push(
          `🔴 Prioritas Tinggi: Tingkatkan kompetensi ${compList} melalui pelatihan atau kursus profesional.`
        );
      }

      // Medium priority competencies
      if (mediumPriority.length > 0) {
        const compList = mediumPriority
          .map(([comp]) => competencyNames[comp])
          .join(", ");
        recommendations.push(
          `🟡 Perlu Ditingkatkan: ${compList}. Cari mentor atau ikut workshop terkait.`
        );
      }
    }

    // Rekomendasi berdasarkan waktu tunggu
    const waitTime = parseFloat(formData.F502);
    if (waitTime > 12) {
      recommendations.push(
        "⏰ Waktu tunggu Anda cukup lama. Tingkatkan strategi pencarian kerja: perluas networking, perbaiki CV, dan aktif di job portal."
      );
    } else if (waitTime > 6) {
      recommendations.push(
        "🔍 Pertimbangkan untuk memperluas area pencarian kerja atau mengikuti job fair untuk mempercepat proses."
      );
    }

    // Rekomendasi berdasarkan kesesuaian bidang
    if (
      formData.F14 === "Kurang Erat" ||
      formData.F14 === "Tidak Sama Sekali"
    ) {
      recommendations.push(
        "🎓 Kesesuaian bidang studi dengan pekerjaan masih rendah. Pertimbangkan untuk mencari posisi yang lebih sesuai dengan background pendidikan Anda."
      );
    }

    // Rekomendasi berdasarkan skala perusahaan
    const workLevel = parseFloat(formData.F5d);
    if (workLevel <= 2) {
      recommendations.push(
        "🏢 Pertimbangkan untuk melamar ke perusahaan dengan skala lebih besar (nasional/multinasional) untuk peluang gaji yang lebih baik."
      );
    }

    // Rekomendasi umum
    recommendations.push(
      "📚 Ikuti program sertifikasi profesional yang relevan dengan bidang Anda untuk meningkatkan kredibilitas."
    );
    recommendations.push(
      "🤝 Bangun portfolio project dan aktif di komunitas profesional untuk meningkatkan visibility Anda."
    );
  }

  return recommendations;
};

interface CompetencyInputProps {
  label: string;
  name: keyof Omit<FormData, "F502" | "F14" | "F5d" | "F1101" | "tahun_lulus">;
  value: CompetencyPair;
  onChange: (
    name: string,
    field: "saat_lulus" | "diperlukan",
    value: string
  ) => void;
  disabled?: boolean;
}

const CompetencyInput = ({
  label,
  name,
  value,
  onChange,
  disabled,
}: CompetencyInputProps) => {
  // Calculate gap for visual feedback
  const gap =
    value.saat_lulus && value.diperlukan
      ? parseFloat(value.diperlukan) - parseFloat(value.saat_lulus)
      : null;

  const getGapColor = (gap: number | null) => {
    if (gap === null) return "text-gray-400";
    if (gap < 0) return "text-green-600";
    if (gap === 0) return "text-blue-600";
    if (gap <= 1) return "text-yellow-600";
    return "text-orange-600";
  };

  const getGapLabel = (gap: number | null) => {
    if (gap === null) return "";
    if (gap < 0) return `Melebihi ${Math.abs(gap)} level`;
    if (gap === 0) return "Sudah sesuai";
    return `Gap ${gap} level`;
  };

  return (
    <div className="space-y-3 md:space-y-4 p-3 md:p-5 border-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:border-blue-300 transition-all">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-sm md:text-base text-gray-800">{label}</h4>
        {gap !== null && (
          <span
            className={`text-xs md:text-sm font-medium ${getGapColor(
              gap
            )} flex items-center gap-1 whitespace-nowrap`}
          >
            {getGapLabel(gap)}
          </span>
        )}
      </div>

      {/* Saat Lulus */}
      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs md:text-sm font-medium text-gray-700">
            Saat Lulus <span className="text-red-500">*</span>
          </Label>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
            {value.saat_lulus ? `Level ${value.saat_lulus}` : "Pilih level"}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center px-1 sm:px-2 md:px-4">
            <div className="flex items-center justify-between gap-0.5 sm:gap-1 md:gap-3 w-full max-w-md">
              {COMPETENCY_LEVELS.map((level) => (
                <label
                  key={`${name}_lulus_${level}`}
                  className={`relative flex flex-col items-center cursor-pointer group ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`${name}_saat_lulus`}
                    value={level}
                    checked={value.saat_lulus === level}
                    onChange={(e) =>
                      !disabled && onChange(name, "saat_lulus", e.target.value)
                    }
                    disabled={disabled}
                    className="sr-only"
                  />
                  <div
                    className={`
                  w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 rounded-full border-2 transition-all duration-200
                  flex items-center justify-center font-semibold text-[10px] sm:text-xs md:text-sm
                  ${
                    value.saat_lulus === level
                      ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-lg"
                      : "bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:scale-105"
                  }
                `}
                  >
                    {level}
                  </div>
                  <span className="hidden sm:inline text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">{level}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-1 sm:px-2 md:px-4 text-[9px] sm:text-[10px] md:text-xs text-gray-600">
            <span>Sangat Kurang</span>
            <span>Sangat Baik</span>
          </div>
        </div>
      </div>

      {/* Diperlukan Pekerjaan */}
      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs md:text-sm font-medium text-gray-700">
            Diperlukan Pekerjaan <span className="text-red-500">*</span>
          </Label>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
            {value.diperlukan ? `Level ${value.diperlukan}` : "Pilih level"}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center px-1 sm:px-2 md:px-4">
            <div className="flex items-center justify-between gap-0.5 sm:gap-1 md:gap-3 w-full max-w-md">
              {COMPETENCY_LEVELS.map((level) => (
                <label
                  key={`${name}_diperlukan_${level}`}
                  className={`relative flex flex-col items-center cursor-pointer group flex-shrink-0 ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`${name}_diperlukan`}
                    value={level}
                    checked={value.diperlukan === level}
                    onChange={(e) =>
                      !disabled && onChange(name, "diperlukan", e.target.value)
                    }
                    disabled={disabled}
                    className="sr-only"
                  />
                  <div
                    className={`
                  w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 rounded-full border-2 transition-all duration-200
                  flex items-center justify-center font-semibold text-[10px] sm:text-xs md:text-sm
                  ${
                    value.diperlukan === level
                      ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg"
                      : "bg-white border-gray-300 text-gray-600 hover:border-indigo-400 hover:scale-105"
                  }
                `}
                  >
                    {level}
                  </div>
                  <span className="hidden sm:inline text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">{level}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-1 sm:px-2 md:px-4 text-[9px] sm:text-[10px] md:text-xs text-gray-600">
            <span>Sangat Kurang</span>
            <span>Sangat Baik</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export function PredictionSection() {
  const [formData, setFormData] = useState<FormData>({
    F502: "",
    F14: "",
    F5d: "",
    F1101: "",
    tahun_lulus: "",
    etika: { saat_lulus: "", diperlukan: "" },
    keahlian: { saat_lulus: "", diperlukan: "" },
    english: { saat_lulus: "", diperlukan: "" },
    it: { saat_lulus: "", diperlukan: "" },
    komunikasi: { saat_lulus: "", diperlukan: "" },
    teamwork: { saat_lulus: "", diperlukan: "" },
    development: { saat_lulus: "", diperlukan: "" },
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompetencyChange = (
    name: string,
    field: "saat_lulus" | "diperlukan",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: {
        ...(prev[name as keyof typeof prev] as CompetencyPair),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate basic fields
      if (
        !formData.F502 ||
        !formData.F14 ||
        !formData.F5d ||
        !formData.F1101 ||
        !formData.tahun_lulus
      ) {
        throw new Error("Semua field dasar harus diisi");
      }

      // Validate competency fields
      const competencies = [
        "etika",
        "keahlian",
        "english",
        "it",
        "komunikasi",
        "teamwork",
        "development",
      ] as const;
      for (const comp of competencies) {
        if (!formData[comp].saat_lulus || !formData[comp].diperlukan) {
          throw new Error(`Kompetensi ${comp} harus diisi lengkap`);
        }
      }

      // Calculate gaps
      const gaps = {
        Gap_Etika:
          parseFloat(formData.etika.diperlukan) -
          parseFloat(formData.etika.saat_lulus),
        Gap_Keahlian:
          parseFloat(formData.keahlian.diperlukan) -
          parseFloat(formData.keahlian.saat_lulus),
        Gap_English:
          parseFloat(formData.english.diperlukan) -
          parseFloat(formData.english.saat_lulus),
        Gap_IT:
          parseFloat(formData.it.diperlukan) -
          parseFloat(formData.it.saat_lulus),
        Gap_Komunikasi:
          parseFloat(formData.komunikasi.diperlukan) -
          parseFloat(formData.komunikasi.saat_lulus),
        Gap_Teamwork:
          parseFloat(formData.teamwork.diperlukan) -
          parseFloat(formData.teamwork.saat_lulus),
        Gap_Development:
          parseFloat(formData.development.diperlukan) -
          parseFloat(formData.development.saat_lulus),
      };

      // Calculate Years_Since_Graduation
      const currentYear = new Date().getFullYear();
      const years_since_grad = currentYear - parseInt(formData.tahun_lulus);

      const response = await fetch(
        "http://localhost:8000/api/ml/classification/predict/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            F502: parseFloat(formData.F502),
            F14: formData.F14,
            F5d: parseFloat(formData.F5d),
            F1101: formData.F1101,
            Years_Since_Graduation: years_since_grad,
            ...gaps,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.details ||
            `Prediction failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat prediksi"
      );
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      F502: "",
      F14: "",
      F5d: "",
      F1101: "",
      tahun_lulus: "",
      etika: { saat_lulus: "", diperlukan: "" },
      keahlian: { saat_lulus: "", diperlukan: "" },
      english: { saat_lulus: "", diperlukan: "" },
      it: { saat_lulus: "", diperlukan: "" },
      komunikasi: { saat_lulus: "", diperlukan: "" },
      teamwork: { saat_lulus: "", diperlukan: "" },
      development: { saat_lulus: "", diperlukan: "" },
    });
    setResult(null);
    setError(null);
  };

  return (
    <section
      id="prediction"
      className="w-full py-8 md:py-12 lg:py-24 bg-gradient-to-b from-blue-50 to-white"
    >
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4 text-center mb-8 md:mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
              <TrendingUp className="inline-block w-4 h-4 mr-2" />
              Prediksi Karir
            </div>
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
              Prediksi Kesuksesan Karir Alumni
            </h2>
            <p className="max-w-[900px] text-sm sm:text-base text-gray-500 md:text-lg lg:text-xl px-4">
              Prediksi apakah Anda termasuk kategori{" "}
              <strong>High Earner (Gaji {">"} 5 juta)</strong> berdasarkan
              profil kompetensi dan pekerjaan Anda
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Form Prediksi Karir</CardTitle>
              <CardDescription>
                Isi data profil pekerjaan dan kompetensi Anda. Model akan
                memprediksi apakah Anda termasuk kategori{" "}
                <strong>High Earner</strong> (gaji &gt; 5 juta/bulan).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Info Notice */}
              <div className="mb-4 md:mb-6 flex items-start gap-2 md:gap-3 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">
                    Petunjuk Pengisian
                  </h3>
                  <p className="text-sm text-blue-700 mt-2">
                    Form ini akan memakan waktu sekitar{" "}
                    <strong>5-7 menit</strong>. Mohon isi semua pertanyaan
                    dengan format yang sesuai untuk hasil prediksi yang akurat.
                  </p>
                  <div className="mt-3 p-3 bg-white rounded-md">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Skala Penilaian Kompetensi:
                    </p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-xs">
                          1
                        </span>
                        <span className="hidden sm:inline">= Sangat Kurang</span>
                        <span className="sm:hidden">SK</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-xs">
                          2
                        </span>
                        <span className="hidden sm:inline">= Kurang</span>
                        <span className="sm:hidden">K</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-400 flex items-center justify-center font-semibold text-white text-xs">
                          3
                        </span>
                        <span className="hidden sm:inline">= Cukup</span>
                        <span className="sm:hidden">C</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 flex items-center justify-center font-semibold text-white text-xs">
                          4
                        </span>
                        <span className="hidden sm:inline">= Baik</span>
                        <span className="sm:hidden">B</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-white text-xs">
                          5
                        </span>
                        <span className="hidden sm:inline">= Sangat Baik</span>
                        <span className="sm:hidden">SB</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Section 1: Basic Info */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold border-b pb-2">
                    Informasi Dasar
                  </h3>
                  <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
                    {/* Tahun Lulus */}
                    <div className="space-y-2">
                      <Label htmlFor="tahun_lulus">
                        Tahun Lulus <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="tahun_lulus"
                        type="number"
                        min="2016"
                        max={new Date().getFullYear()}
                        placeholder="Contoh: 2023"
                        value={formData.tahun_lulus}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tahun_lulus: e.target.value,
                          }))
                        }
                        disabled={loading}
                        required
                      />
                    </div>

                    {/* F502 - Waktu Tunggu Kerja */}
                    <div className="space-y-2">
                      <Label htmlFor="F502">
                        Waktu Tunggu Dapat Kerja (bulan){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="F502"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Contoh: 3"
                        value={formData.F502}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            F502: e.target.value,
                          }))
                        }
                        disabled={loading}
                        required
                      />
                    </div>

                    {/* F14 - Hubungan Studi dengan Pekerjaan */}
                    <div className="space-y-2">
                      <Label htmlFor="F14">
                        Hubungan Bidang Studi dengan Pekerjaan{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.F14}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, F14: value }))
                        }
                        disabled={loading}
                      >
                        <SelectTrigger id="F14">
                          <SelectValue placeholder="Pilih tingkat keeratan" />
                        </SelectTrigger>
                        <SelectContent>
                          {F14_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* F5d - Tingkat Tempat Kerja */}
                    <div className="space-y-2">
                      <Label htmlFor="F5d">
                        Tingkat Tempat Kerja{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.F5d}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, F5d: value }))
                        }
                        disabled={loading}
                      >
                        <SelectTrigger id="F5d">
                          <SelectValue placeholder="Pilih tingkat tempat kerja" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Lokal/Wilayah</SelectItem>
                          <SelectItem value="2">2 - Regional</SelectItem>
                          <SelectItem value="3">3 - Nasional</SelectItem>
                          <SelectItem value="4">4 - Multinasional</SelectItem>
                          <SelectItem value="5">5 - Internasional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* F1101 - Jenis Perusahaan */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="F1101">
                        Jenis Perusahaan/Instansi{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.F1101}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, F1101: value }))
                        }
                        disabled={loading}
                      >
                        <SelectTrigger id="F1101">
                          <SelectValue placeholder="Pilih jenis instansi" />
                        </SelectTrigger>
                        <SelectContent>
                          {F1101_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Competency Assessment */}
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">
                        Penilaian Kompetensi
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        Untuk setiap kompetensi, pilih level kemampuan Anda dan
                        level yang diperlukan di pekerjaan. Klik pada angka yang
                        sesuai.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:gap-4">
                    <CompetencyInput
                      label="1. Etika"
                      name="etika"
                      value={formData.etika}
                      onChange={handleCompetencyChange}
                      disabled={loading}
                    />
                    <CompetencyInput
                      label="2. Keahlian Bidang Ilmu"
                      name="keahlian"
                      value={formData.keahlian}
                      onChange={handleCompetencyChange}
                      disabled={loading}
                    />
                    <CompetencyInput
                      label="3. Bahasa Inggris"
                      name="english"
                      value={formData.english}
                      onChange={handleCompetencyChange}
                      disabled={loading}
                    />
                    <CompetencyInput
                      label="4. Teknologi Informasi"
                      name="it"
                      value={formData.it}
                      onChange={handleCompetencyChange}
                      disabled={loading}
                    />
                    <CompetencyInput
                      label="5. Komunikasi"
                      name="komunikasi"
                      value={formData.komunikasi}
                      onChange={handleCompetencyChange}
                      disabled={loading}
                    />
                    <CompetencyInput
                      label="6. Kerja Sama Tim"
                      name="teamwork"
                      value={formData.teamwork}
                      onChange={handleCompetencyChange}
                      disabled={loading}
                    />
                    <CompetencyInput
                      label="7. Pengembangan Diri"
                      name="development"
                      value={formData.development}
                      onChange={handleCompetencyChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900">Error</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Success Result */}
                {result && (
                  <div className="space-y-3 md:space-y-4">
                    {/* Main Result Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 md:p-6 shadow-lg">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-green-100 rounded-full">
                          <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base md:text-xl font-bold text-green-900 mb-2">
                            🎯 Hasil Prediksi Gaji
                          </h3>
                          <p className="text-xl md:text-3xl font-bold text-green-700 mb-1">
                            {
                              getPredictionInterpretation(
                                result.predicted_label,
                                formData
                              ).salaryIcon
                            }{" "}
                            {
                              getPredictionInterpretation(
                                result.predicted_label,
                                formData
                              ).salaryRange
                            }
                          </p>
                          <p className="text-sm text-green-600 mt-2">
                            ✨ Tingkat Kepercayaan:{" "}
                            <span className="font-semibold">
                              {(result.confidence * 100).toFixed(1)}%
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Analysis Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {/* Salary Breakdown */}
                      <Card>
                        <CardHeader className="pb-2 md:pb-3">
                          <CardTitle className="text-xs md:text-sm flex items-center gap-2">
                            <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                            Kategori Gaji
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm md:text-base">
                          <div className="space-y-2">
                            <p
                              className={`text-base md:text-lg font-semibold ${
                                getPredictionInterpretation(
                                  result.predicted_label,
                                  formData
                                ).salaryColor
                              }`}
                            >
                              {result.predicted_label}
                            </p>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                                style={{ width: `${result.confidence * 100}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {
                                getPredictionInterpretation(
                                  result.predicted_label,
                                  formData
                                ).salaryDescription
                              }
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Job Search Duration */}
                      <Card>
                        <CardHeader className="pb-2 md:pb-3">
                          <CardTitle className="text-xs md:text-sm flex items-center gap-2">
                            <Briefcase className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                            Waktu Tunggu Kerja
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm md:text-base">
                          <div className="space-y-2">
                            <p className="text-xl md:text-2xl font-bold text-blue-700">
                              {formData.F502} bulan
                            </p>
                            <p className="text-sm text-blue-600">
                              {
                                getPredictionInterpretation(
                                  result.predicted_label,
                                  formData
                                ).waitInterpretation
                              }
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {parseFloat(formData.F502) < 6 ? (
                                <>
                                  <TrendingUp className="h-3 w-3 text-green-500" />{" "}
                                  Lebih cepat dari rata-rata
                                </>
                              ) : parseFloat(formData.F502) < 12 ? (
                                <>
                                  <Minus className="h-3 w-3 text-yellow-500" />{" "}
                                  Sesuai rata-rata
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-3 w-3 text-orange-500" />{" "}
                                  Lebih lama dari rata-rata
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Job Relevance */}
                      <Card>
                        <CardHeader className="pb-2 md:pb-3">
                          <CardTitle className="text-xs md:text-sm flex items-center gap-2">
                            <GraduationCap className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                            Kesesuaian Bidang
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-purple-700">
                              {formData.F14}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Hubungan antara bidang studi dengan pekerjaan
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Work Level/Scale */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-orange-600" />
                            Skala Tempat Kerja
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-orange-700">
                              {
                                getPredictionInterpretation(
                                  result.predicted_label,
                                  formData
                                ).levelInterpretation
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {
                                getPredictionInterpretation(
                                  result.predicted_label,
                                  formData
                                ).levelDetail
                              }
                            </p>
                            <div className="pt-2 border-t">
                              <p className="text-xs font-medium text-gray-600">
                                Jenis Instansi:
                              </p>
                              <p className="text-xs text-gray-500">
                                {formData.F1101}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recommendations - Dynamic */}
                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          💡 Rekomendasi Personal
                        </CardTitle>
                        <CardDescription>
                          Saran pengembangan berdasarkan profil Anda
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 text-sm text-gray-700">
                          {generateDynamicRecommendations(
                            result.predicted_label,
                            formData
                          ).map((recommendation, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-3 leading-relaxed"
                            >
                              <span className="flex-shrink-0 mt-0.5">•</span>
                              <span className="flex-1">{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <Button type="submit" disabled={loading} className="flex-1 h-11">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm md:text-base">Memproses...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span className="text-sm md:text-base">Prediksi Sekarang</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                    className="h-11 sm:w-auto w-full"
                  >
                    <span className="text-sm md:text-base">Reset</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
