import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PredictionSection } from "@/components/prediction";

export default function PredictionPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="w-full px-3 md:px-4 py-4 md:py-8 mt-8">
        <PredictionSection />
      </div>
      <Footer />
    </main>
  );
}
