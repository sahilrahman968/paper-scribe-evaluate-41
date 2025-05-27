
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import QuestionForm from "@/components/forms/QuestionForm";

interface Question {
  id: number;
  question: string;
  board: string;
  class: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  marks: string;
  questionType: string;
  answer?: string;
  options?: { text: string; isCorrect: boolean; image?: string }[];
  rubrics?: { criteria: string; weight: number }[];
  parentQuestion?: string;
  parentQuestionImage?: string;
  childQuestions?: {
    question: string;
    questionImage?: string;
    answer?: string;
    marks: number;
    questionType?: string;
    options?: { text: string; isCorrect: boolean; image?: string }[];
  }[];
  questionImage?: string;
}

const CreateQuestion = () => {
  const { id, mode } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [questionData, setQuestionData] = useState<Question | null>(null);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      // Mock API call to fetch question data
      setTimeout(() => {
        // This would be a real API call in production
        const mockQuestion: Question = {
          id: parseInt(id),
          question: "Explain Newton's Third Law of Motion with examples.",
          board: "CBSE",
          class: "10",
          subject: "Physics",
          chapter: "Laws of Motion",
          topic: "Newton's Laws",
          difficulty: "Medium",
          marks: "5",
          questionType: "subjective",
          answer: "Newton's Third Law states that for every action, there is an equal and opposite reaction. This means that when one body exerts a force on another body, the second body exerts a force of equal magnitude but opposite direction on the first body...",
          rubrics: [
            { criteria: "Understanding of the law", weight: 30 },
            { criteria: "Examples provided", weight: 40 },
            { criteria: "Clear explanation", weight: 30 }
          ]
        };

        setQuestionData(mockQuestion);
        setIsLoading(false);
      }, 500);
    }
  }, [id]);

  // Determine if we are creating, editing, or viewing a question
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = !mode && !id;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          {isCreate && "Create Question"}
          {isView && "View Question"}
          {isEdit && "Edit Question"}
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-lg">Loading question data...</div>
            </div>
          ) : (
            <QuestionForm 
              type="manual" 
              initialData={questionData || undefined} 
              isEdit={isEdit}
              isView={isView}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateQuestion;

