import { Navbar } from "@/components/navbar";
import { PredictionSection } from "@/components/prediction";
import { Footer } from "@/components/footer";

export default function PredictionPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PredictionSection />
      </div>
      <Footer />
    </main>
  );
}
