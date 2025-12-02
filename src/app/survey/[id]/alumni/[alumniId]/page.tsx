"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ResponseAnswerCard, type ResponseAnswer } from "@/components/response_answer_card";
import { Button } from "@/components/ui/button";
import { 
  getSurvey, 
  getSections, 
  getQuestions, 
  submitBulkAnswers,
  type Survey, 
  type Section, 
  type Question,
  type CreateAnswerData
} from "@/lib/api";

function mapQuestionType(backendType: string): ResponseAnswer['type'] {
  const typeMap: Record<string, ResponseAnswer['type']> = {
    'radio': 'multiple_choice',
    'checkbox': 'checkbox',
    'text': 'short_answer',
    'number': 'short_answer',
    'paragraph': 'paragraph',
    'scale': 'linear_scale',
    'dropdown': 'dropdown',
  };
  
  return typeMap[backendType] || 'short_answer';
}

interface SectionWithQuestions extends Section {
  questions: ResponseAnswer[];
}

export default function AlumniAnswerPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = Number(params.id);
  const [submitting, setSubmitting] = useState(false); 
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [sectionsWithQuestions, setSectionsWithQuestions] = useState<SectionWithQuestions[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ResponseAnswer>>({});
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("=== START FETCHING ===");
        console.log("Survey ID:", surveyId);
        
        // Fetch survey
        const survey = await getSurvey(String(surveyId));
        console.log(" Survey:", survey);
        setSurveyData(survey);
        
        // fetch section
        const sectionsData = await getSections(surveyId);
        console.log(" Sections:", sectionsData);
        
        if (sectionsData.length === 0) {
          throw new Error("Survey tidak memiliki section");
        }
        
        // Fetch questions per section dan group by section
        const sectionsWithQuestionsData: SectionWithQuestions[] = [];
        
        for (const section of sectionsData) {
          const questionsData = await getQuestions(surveyId, section.id);
          console.log(` Questions for section ${section.id}:`, questionsData);
          
          // Transform questions ke format ResponseAnswer
          const transformedQuestions: ResponseAnswer[] = questionsData.map(q => {
            let options = q.options;
            
            if (typeof options === 'string') {
              try {
                options = JSON.parse(options);
              } catch (e) {
                console.error(`Failed to parse options for question ${q.id}:`, e);
                options = [];
              }
            }
            
            // Transform options format ke {id, label}
            let formattedOptions: Array<{ id: string; label: string }> = [];
            if (Array.isArray(options)) {
              formattedOptions = options.map((opt, idx) => {
                if (typeof opt === 'string') {
                  return { id: String(idx + 1), label: opt };
                }
                if (opt && typeof opt === 'object' && opt.label) {
                  return { id: opt.id || String(idx + 1), label: opt.label };
                }
                return { id: String(idx + 1), label: String(opt) };
              });
            }
            
            return {
              id: String(q.id),
              type: mapQuestionType(q.question_type),
              title: q.text,
              description: q.description || "",
              required: q.is_required,
              options: formattedOptions,
              minValue: 1,
              maxValue: 5,
              minLabel: "Min",
              maxLabel: "Max"
            };
          });
          
          sectionsWithQuestionsData.push({
            ...section,
            questions: transformedQuestions
          });
        }
        
        console.log(" Sections with questions:", sectionsWithQuestionsData);
        setSectionsWithQuestions(sectionsWithQuestionsData);
        
        console.log("=== FETCHING COMPLETE ===");
        
      } catch (err) {
        console.error(" ERROR:", err);
        setError(err instanceof Error ? err.message : "Failed to load survey");
      } finally {
        setLoading(false);
      }
    };

    if (surveyId && !isNaN(surveyId)) {
      fetchSurveyData();
    } else {
      setError("Invalid survey ID");
      setLoading(false);
    }
  }, [surveyId]);

  const handleUpdateAnswer = (updatedAnswer: ResponseAnswer) => {
    console.log(" Answer updated:", updatedAnswer);
    setAnswers(prev => ({
      ...prev,
      [updatedAnswer.id]: updatedAnswer
    }));
  };

  const handleNext = () => {
    // Validasi required questions di section ini
    const currentSection = sectionsWithQuestions[currentSectionIndex];
    const requiredQuestions = currentSection.questions.filter(q => q.required);
    
    const unansweredRequired = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      if (!answer) return true;
      
      // Cek berdasarkan type
      if (answer.type === 'multiple_choice') {
        return !answer.selectedOption;
      }
      if (answer.type === 'checkbox') {
        return !answer.selectedOptions || answer.selectedOptions.length === 0;
      }
      if (answer.type === 'short_answer' || answer.type === 'paragraph') {
        return !answer.textAnswer || answer.textAnswer.trim() === '';
      }
      if (answer.type === 'linear_scale') {
        return !answer.selectedValue;
      }
      if (answer.type === 'dropdown') {
        return !answer.selectedOption;
      }
      
      return false;
    });
    
    if (unansweredRequired.length > 0) {
      alert(`Mohon jawab semua pertanyaan yang wajib diisi (${unansweredRequired.length} pertanyaan belum dijawab)`);
      return;
    }
    
    // Pindah ke section berikutnya atau submit
    if (currentSectionIndex < sectionsWithQuestions.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      console.log(" Submitting answers:", answers);
    
    // kirim jawban ke backend
      const formattedAnswers: CreateAnswerData[] = Object.values(answers).map(answer => {
        let answerValue: any;
        
        if (answer.type === 'multiple_choice' || answer.type === 'dropdown') {
          answerValue = answer.selectedOption || "";
        } else if (answer.type === 'checkbox') {
          answerValue = answer.selectedOptions || [];
        } else if (answer.type === 'short_answer' || answer.type === 'paragraph') {
          answerValue = answer.textAnswer || "";
        } else if (answer.type === 'linear_scale') {
          answerValue = answer.selectedValue || 0;
        } else {
          answerValue = "";
        }
        
        return {
          survey: surveyId,
          question: Number(answer.id),
          answer_value: answerValue,
          program_specific_question: null
        };
      });
    
    console.log(" Formatted answers for API:", formattedAnswers);

    const result = await submitBulkAnswers(surveyId, formattedAnswers);
    
    console.log(" Submit successful:", result);
      
      alert("Survey berhasil disubmit! Terima kasih atas partisipasi Anda.");
      
      router.push('/'); 
      
    } catch (err) {
      console.error(" Submit error:", err);
      alert(err instanceof Error ? err.message : "Gagal mengirim jawaban. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-gray-50 min-h-screen py-8 px-4">
        <div className="text-center py-8">Loading survey...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto bg-gray-50 min-h-screen py-8 px-4">
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 font-semibold">Error</p>
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSection = sectionsWithQuestions[currentSectionIndex];

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 py-8 px-4">
      {/* Header Survey */}
      <Card className="border-t-8 border-t-primary shadow-sm mb-6">
        <CardContent className="pt-6 pb-4 space-y-2">
          <h1 className="text-3xl font-normal text-gray-900">
            {surveyData?.title || "Survey"}
          </h1>
          <p className="text-sm text-gray-600">
            {surveyData?.description || ""}
          </p>
        </CardContent>
      </Card>

      {/* Questions in Current Section */}
      <div className="space-y-6">
        {currentSection?.questions.map((question) => (
          <ResponseAnswerCard
            key={question.id}
            answer={answers[question.id] || question}
            isReadOnly={false}
            onUpdate={handleUpdateAnswer}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 pb-8 flex justify-between">
        <Button 
          size="lg"
          variant="outline"
          onClick={handleBack}
          disabled={currentSectionIndex === 0}
        >
          Back
        </Button>
        
        <Button 
          size="lg"
          onClick={handleNext}
          className="bg-primary hover:bg-primary/90"
        >
          {currentSectionIndex < sectionsWithQuestions.length - 1 ? "Next" : "Submit"}
        </Button>
      </div>
    </div>
  );
}
