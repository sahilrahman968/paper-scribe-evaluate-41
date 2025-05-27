import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Image } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface QuestionFormProps {
  type: "manual" | "ai";
  initialData?: {
    id?: number;
    question: string;
    answer?: string;
    board: string;
    class: string;
    subject: string;
    chapter: string;
    topic: string;
    marks: string;
    difficulty: string;
    questionType?: string;
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
      chapter?: string;
      topic?: string;
      options?: { text: string; isCorrect: boolean; image?: string }[];
    }[];
    questionImage?: string;
  };
  isEdit?: boolean;
  isView?: boolean;
}

type RubricItem = {
  criteria: string;
  weight: number;
};

type OptionItem = {
  text: string;
  isCorrect: boolean;
  image?: string;
};

type ChildQuestionItem = {
  question: string;
  questionImage?: string;
  answer?: string;
  marks: number;
  questionType?: string;
  chapter?: string;
  topic?: string;
  options?: OptionItem[];
};

const QuestionForm = ({ type, initialData, isEdit = false, isView = false }: QuestionFormProps) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: initialData?.id,
    question: initialData?.question || "",
    answer: initialData?.answer || "",
    board: initialData?.board || "",
    class: initialData?.class || "",
    subject: initialData?.subject || "",
    chapter: initialData?.chapter || "",
    topic: initialData?.topic || "",
    marks: initialData?.marks || "",
    difficulty: initialData?.difficulty || "",
    questionType: initialData?.questionType || "subjective",
    parentQuestion: initialData?.parentQuestion || "",
    parentQuestionImage: initialData?.parentQuestionImage || "",
    questionImage: initialData?.questionImage || ""
  });
  
  const [options, setOptions] = useState<OptionItem[]>(
    initialData?.options || [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false }
    ]
  );
  
  const [rubrics, setRubrics] = useState<RubricItem[]>(
    initialData?.rubrics || [
      { criteria: "Accuracy of content", weight: 40 },
      { criteria: "Presentation and clarity", weight: 30 },
      { criteria: "Use of examples", weight: 30 }
    ]
  );
  
  const [childQuestions, setChildQuestions] = useState<ChildQuestionItem[]>(
    initialData?.childQuestions || []
  );
  
  const boards = ["CBSE", "ICSE", "State Board"];
  const classes = ["8", "9", "10", "11", "12"];
  const subjects = ["Physics", "Chemistry", "Biology", "Mathematics", "English", "History"];
  const difficulties = ["Easy", "Medium", "Hard"];
  
  // Define available question types with "nested" removed for child questions
  const questionTypes = [
    { value: "subjective", label: "Subjective" },
    { value: "single-correct", label: "Single Correct" },
    { value: "multiple-correct", label: "Multiple Correct" },
    { value: "true-false", label: "True/False" },
    { value: "fill-in-the-blank", label: "Fill in the Blank" }
  ];

  // Include nested for parent question type options
  const parentQuestionTypes = [
    ...questionTypes,
    { value: "nested", label: "Nested" }
  ];
  
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleImageUpload = (field: string) => {
    // Mock image upload - in a real implementation this would open a file picker
    // and upload the image to a storage service
    const mockImageUrl = `https://source.unsplash.com/random/800x600?${Math.random()}`;
    
    setFormData({
      ...formData,
      [field]: mockImageUrl
    });
    toast.success("Image uploaded successfully!");
  };
  
  const handleOptionImageUpload = (index: number) => {
    // Mock image upload for options
    const mockImageUrl = `https://source.unsplash.com/random/400x300?${Math.random()}`;
    
    const newOptions = [...options];
    newOptions[index] = { 
      ...newOptions[index], 
      image: mockImageUrl 
    };
    setOptions(newOptions);
    toast.success("Option image uploaded successfully!");
  };
  
  const handleChildQuestionImageUpload = (index: number) => {
    // Mock image upload for child questions
    const mockImageUrl = `https://source.unsplash.com/random/800x600?${Math.random()}`;
    
    const newChildQuestions = [...childQuestions];
    newChildQuestions[index] = { 
      ...newChildQuestions[index], 
      questionImage: mockImageUrl 
    };
    setChildQuestions(newChildQuestions);
    toast.success("Child question image uploaded successfully!");
  };
  
  const handleOptionChange = (index: number, field: "text" | "isCorrect", value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { 
      ...newOptions[index], 
      [field]: value 
    };
    setOptions(newOptions);
  };
  
  const handleRubricChange = (index: number, field: "criteria" | "weight", value: string | number) => {
    const newRubrics = [...rubrics];
    newRubrics[index] = { 
      ...newRubrics[index], 
      [field]: value 
    };
    setRubrics(newRubrics);
  };
  
  const handleChildQuestionChange = (index: number, field: string, value: any) => {
    const newChildQuestions = [...childQuestions];
    newChildQuestions[index] = { 
      ...newChildQuestions[index], 
      [field]: value 
    };

    // Initialize options if changing question type to single-correct or multiple-correct
    if (field === "questionType") {
      if (value === "single-correct" || value === "multiple-correct") {
        if (!newChildQuestions[index].options || newChildQuestions[index].options.length < 2) {
          newChildQuestions[index].options = [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false }
          ];
        }
      } else if (value === "true-false") {
        newChildQuestions[index].options = [
          { text: "True", isCorrect: false },
          { text: "False", isCorrect: false }
        ];
      }
    }
    
    setChildQuestions(newChildQuestions);
  };
  
  const handleChildOptionChange = (questionIndex: number, optionIndex: number, field: "text" | "isCorrect", value: string | boolean) => {
    const newChildQuestions = [...childQuestions];
    if (!newChildQuestions[questionIndex].options) {
      newChildQuestions[questionIndex].options = [];
    }
    
    if (!newChildQuestions[questionIndex].options![optionIndex]) {
      newChildQuestions[questionIndex].options![optionIndex] = { text: "", isCorrect: false };
    }
    
    newChildQuestions[questionIndex].options![optionIndex] = {
      ...newChildQuestions[questionIndex].options![optionIndex],
      [field]: value
    };
    
    setChildQuestions(newChildQuestions);
  };
  
  const handleChildOptionImageUpload = (questionIndex: number, optionIndex: number) => {
    // Mock image upload for child question options
    const mockImageUrl = `https://source.unsplash.com/random/400x300?${Math.random()}`;
    
    const newChildQuestions = [...childQuestions];
    if (!newChildQuestions[questionIndex].options) {
      newChildQuestions[questionIndex].options = [];
    }
    
    if (!newChildQuestions[questionIndex].options![optionIndex]) {
      newChildQuestions[questionIndex].options![optionIndex] = { text: "", isCorrect: false };
    }
    
    newChildQuestions[questionIndex].options![optionIndex] = {
      ...newChildQuestions[questionIndex].options![optionIndex],
      image: mockImageUrl
    };
    
    setChildQuestions(newChildQuestions);
    toast.success("Option image uploaded successfully!");
  };
  
  const addRubric = () => {
    setRubrics([...rubrics, { criteria: "", weight: 0 }]);
  };
  
  const removeRubric = (index: number) => {
    const newRubrics = [...rubrics];
    newRubrics.splice(index, 1);
    setRubrics(newRubrics);
  };
  
  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };
  
  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  
  const addChildQuestion = () => {
    setChildQuestions([
      ...childQuestions, 
      { 
        question: "", 
        answer: "", 
        marks: 1,
        questionType: "subjective", // Default to subjective
        chapter: "", // Add chapter field for child questions
        topic: "", // Add topic field for child questions
      }
    ]);
  };
  
  const removeChildQuestion = (index: number) => {
    const newChildQuestions = [...childQuestions];
    newChildQuestions.splice(index, 1);
    setChildQuestions(newChildQuestions);
  };
  
  const addChildOption = (questionIndex: number) => {
    const newChildQuestions = [...childQuestions];
    if (!newChildQuestions[questionIndex].options) {
      newChildQuestions[questionIndex].options = [];
    }
    
    newChildQuestions[questionIndex].options!.push({ text: "", isCorrect: false });
    setChildQuestions(newChildQuestions);
  };
  
  const removeChildOption = (questionIndex: number, optionIndex: number) => {
    const newChildQuestions = [...childQuestions];
    if (newChildQuestions[questionIndex].options && newChildQuestions[questionIndex].options!.length > 2) {
      newChildQuestions[questionIndex].options!.splice(optionIndex, 1);
      setChildQuestions(newChildQuestions);
    }
  };
  
  const validateFormData = () => {
    // Validate required fields
    if (!formData.board || !formData.class || !formData.subject || !formData.difficulty || !formData.marks) {
      toast.error("Please fill all required fields");
      return false;
    }
    
    // Validate question text
    if (!formData.question && !formData.parentQuestion && formData.questionType !== "nested") {
      toast.error("Question text is required");
      return false;
    }
    
    // For nested questions, validate parent question and child questions
    if (formData.questionType === "nested") {
      if (!formData.parentQuestion) {
        toast.error("Parent question text is required for nested questions");
        return false;
      }
      
      if (childQuestions.length === 0) {
        toast.error("At least one child question is required for nested questions");
        return false;
      }
      
      // Validate each child question
      for (let i = 0; i < childQuestions.length; i++) {
        const childQuestion = childQuestions[i];
        
        if (!childQuestion.question) {
          toast.error(`Child question ${i + 1} text is required`);
          return false;
        }
        
        if (childQuestion.marks <= 0) {
          toast.error(`Child question ${i + 1} marks must be greater than 0`);
          return false;
        }
        
        if (!childQuestion.chapter) {
          toast.error(`Child question ${i + 1} chapter is required`);
          return false;
        }
      }
    }
    
    // Validate question type specific fields
    if (formData.questionType === "single-correct" || formData.questionType === "multiple-correct") {
      // Check if at least two options exist
      if (options.length < 2) {
        toast.error("At least two options are required");
        return false;
      }
      
      // Check if options have text
      const emptyOptions = options.some(option => !option.text.trim());
      if (emptyOptions) {
        toast.error("All options must have text");
        return false;
      }
      
      // For single correct, exactly one option should be marked correct
      if (formData.questionType === "single-correct") {
        const correctCount = options.filter(option => option.isCorrect).length;
        if (correctCount !== 1) {
          toast.error("Single correct question must have exactly one correct answer");
          return false;
        }
      }
      
      // For multiple correct, at least one option should be marked correct
      if (formData.questionType === "multiple-correct") {
        const correctCount = options.filter(option => option.isCorrect).length;
        if (correctCount < 1) {
          toast.error("Multiple correct question must have at least one correct answer");
          return false;
        }
      }
    }
    
    // Validate rubrics for subjective questions
    if (formData.questionType === "subjective") {
      if (rubrics.length === 0) {
        toast.error("At least one evaluation rubric is required for subjective questions");
        return false;
      }
      
      // Check if rubrics have criteria and weight
      const invalidRubrics = rubrics.some(rubric => 
        !rubric.criteria.trim() || typeof rubric.weight !== 'number' || rubric.weight <= 0
      );
      if (invalidRubrics) {
        toast.error("All rubrics must have criteria and a valid weight");
        return false;
      }
      
      // Check if weights sum up to 100
      const totalWeight = rubrics.reduce((sum, rubric) => sum + rubric.weight, 0);
      if (totalWeight !== 100) {
        toast.error("Rubric weights must sum up to 100%");
        return false;
      }
    }
    
    return true;
  };
  
  const generateQuestion = async () => {
    // Validate required fields for AI generation
    if (!formData.board || !formData.class || !formData.subject || !formData.questionType || !formData.difficulty || !formData.marks) {
      toast.error("Please fill syllabus details, question type, difficulty and marks first");
      return;
    }
    
    setIsGenerating(true);
    
    // Mock AI generation - in a real implementation this would call an AI service
    setTimeout(() => {
      // Generate a question based on the form data and question type
      let generatedQuestion = "";
      let generatedAnswer = "";
      let generatedOptions: OptionItem[] = [];
      let generatedRubrics: RubricItem[] = [];
      let generatedParentQuestion = "";
      let generatedChildQuestions: ChildQuestionItem[] = [];
      
      // Generate content based on question type and subject
      if (formData.questionType === "nested") {
        generatedParentQuestion = formData.subject === "Physics" 
          ? "Answer the following questions about Newton's Laws of Motion:" 
          : `Answer the following questions about ${formData.topic || "this topic"}:`;
          
        if (formData.subject === "Physics") {
          generatedChildQuestions = [
            {
              question: "State Newton's First Law of Motion and give an example from daily life.",
              marks: 3,
              answer: "Newton's First Law states that an object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an external force.",
              questionType: "subjective",
              chapter: "Laws of Motion",
              topic: "Newton's First Law"
            },
            {
              question: "Explain the concept of momentum and its conservation.",
              marks: 3,
              answer: "Momentum is the product of mass and velocity. The conservation of momentum states that in a closed system, the total momentum remains constant.",
              questionType: "subjective",
              chapter: "Laws of Motion",
              topic: "Momentum"
            },
            {
              question: "A 2kg object moving at 5 m/s collides with a stationary 3kg object. If they stick together after collision, what will be their final velocity?",
              marks: 4,
              answer: "Using conservation of momentum: m1v1 + m2v2 = (m1 + m2)v_final\n2kg × 5m/s + 3kg × 0m/s = (2kg + 3kg) × v_final\n10kg·m/s = 5kg × v_final\nv_final = 2 m/s",
              questionType: "subjective",
              chapter: "Laws of Motion",
              topic: "Collision and Momentum"
            }
          ];
        } else if (formData.subject === "Mathematics") {
          generatedChildQuestions = [
            {
              question: "Solve the quadratic equation: x² - 5x + 6 = 0",
              marks: 2,
              answer: "Factoring: x² - 5x + 6 = 0\n(x - 3)(x - 2) = 0\nx = 3 or x = 2",
              questionType: "subjective",
              chapter: "Algebra",
              topic: "Quadratic Equations"
            },
            {
              question: "Calculate the derivative of f(x) = x³ - 4x² + 5x - 7",
              marks: 3,
              answer: "f'(x) = 3x² - 8x + 5",
              questionType: "subjective",
              chapter: "Calculus",
              topic: "Derivatives"
            },
            {
              question: "Find the area of a circle with radius 7 cm.",
              marks: 2,
              answer: "A = πr² = π × 7² = 49π cm²",
              questionType: "subjective",
              chapter: "Geometry",
              topic: "Circle"
            }
          ];
        } else {
          generatedChildQuestions = [
            {
              question: `Explain the key concepts related to ${formData.topic || "this topic"}.`,
              marks: 3,
              answer: "The key concepts include...",
              questionType: "subjective",
              chapter: "Chapter 1",
              topic: "Key Concepts"
            },
            {
              question: `Describe the importance of ${formData.topic || "this topic"} in modern applications.`,
              marks: 3,
              answer: "The importance can be seen in various applications...",
              questionType: "subjective",
              chapter: "Chapter 2",
              topic: "Applications"
            },
            {
              question: `Analyze the challenges faced in implementing ${formData.topic || "this topic"}.`,
              marks: 4,
              answer: "The challenges include...",
              questionType: "subjective",
              chapter: "Chapter 3",
              topic: "Challenges"
            }
          ];
        }
      } else if (formData.questionType === "subjective") {
        if (formData.subject === "Physics") {
          generatedQuestion = "Elaborate on the working principle of a nuclear reactor and discuss the safety mechanisms employed to prevent nuclear accidents.";
          generatedAnswer = "A nuclear reactor operates on the principle of controlled nuclear fission...";
          generatedRubrics = [
            { criteria: "Understanding of nuclear fission", weight: 25 },
            { criteria: "Description of reactor components", weight: 25 },
            { criteria: "Explanation of safety mechanisms", weight: 30 },
            { criteria: "Discussion of potential risks", weight: 20 }
          ];
        } else if (formData.subject === "Mathematics") {
          generatedQuestion = "Prove that the sum of interior angles in a polygon with n sides is (n-2) × 180°.";
          generatedAnswer = "To prove this theorem, we can use the triangulation of polygons...";
          generatedRubrics = [
            { criteria: "Correct approach to proof", weight: 40 },
            { criteria: "Mathematical reasoning", weight: 30 },
            { criteria: "Clarity of explanation", weight: 30 }
          ];
        } else {
          generatedQuestion = `Explain the significance of ${formData.topic || "this topic"} in the context of ${formData.subject}.`;
          generatedAnswer = "The significance of this topic can be understood through...";
          generatedRubrics = [
            { criteria: "Content accuracy", weight: 40 },
            { criteria: "Critical analysis", weight: 30 },
            { criteria: "Examples and application", weight: 30 }
          ];
        }
      } else if (formData.questionType === "single-correct" || formData.questionType === "multiple-correct") {
        if (formData.subject === "Physics") {
          if (formData.questionType === "single-correct") {
            generatedQuestion = "Which of the following is a unit of force?";
            generatedOptions = [
              { text: "Newton", isCorrect: true },
              { text: "Joule", isCorrect: false },
              { text: "Watt", isCorrect: false },
              { text: "Coulomb", isCorrect: false }
            ];
          } else {
            generatedQuestion = "Which of the following are vector quantities?";
            generatedOptions = [
              { text: "Force", isCorrect: true },
              { text: "Velocity", isCorrect: true },
              { text: "Mass", isCorrect: false },
              { text: "Temperature", isCorrect: false }
            ];
          }
        } else if (formData.subject === "Mathematics") {
          if (formData.questionType === "single-correct") {
            generatedQuestion = "What is the derivative of sin(x) with respect to x?";
            generatedOptions = [
              { text: "cos(x)", isCorrect: true },
              { text: "-sin(x)", isCorrect: false },
              { text: "tan(x)", isCorrect: false },
              { text: "-cos(x)", isCorrect: false }
            ];
          } else {
            generatedQuestion = "Which of the following are prime numbers?";
            generatedOptions = [
              { text: "2", isCorrect: true },
              { text: "3", isCorrect: true },
              { text: "4", isCorrect: false },
              { text: "5", isCorrect: true }
            ];
          }
        }
      } else if (formData.questionType === "true-false") {
        generatedQuestion = formData.subject === "Physics" ? 
          "Light travels faster than sound. State whether true or false." : 
          "Every prime number greater than 2 is odd. State whether true or false.";
        generatedOptions = [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false }
        ];
      } else if (formData.questionType === "fill-in-the-blank") {
        generatedQuestion = formData.subject === "Physics" ? 
          "The SI unit of electric current is __________." :
          "The value of π (pi) up to 2 decimal places is __________.";
        generatedAnswer = formData.subject === "Physics" ? "ampere" : "3.14";
      }
      
      // Update the form with generated content
      if (formData.questionType === "nested") {
        setFormData({
          ...formData,
          parentQuestion: generatedParentQuestion
        });
        setChildQuestions(generatedChildQuestions);
      } else {
        setFormData({
          ...formData,
          question: generatedQuestion,
          answer: generatedAnswer
        });
        
        if (generatedOptions.length > 0) {
          setOptions(generatedOptions);
        }
        
        if (generatedRubrics.length > 0 && formData.questionType === "subjective") {
          setRubrics(generatedRubrics);
        }
      }
      
      setIsGenerating(false);
      toast.success("Question generated successfully!");
    }, 1500);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare data for submission
    const questionData = {
      ...formData,
      options: formData.questionType === "single-correct" || formData.questionType === "multiple-correct" || formData.questionType === "true-false" ? options : undefined,
      rubrics: formData.questionType === "subjective" ? rubrics : undefined,
      childQuestions: formData.questionType === "nested" ? childQuestions : undefined
    };
    
    // Mock submission - in a real implementation this would be an API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(isEdit ? "Question updated successfully!" : "Question created successfully!");
      navigate("/dashboard/question-bank");
    }, 1000);
  };
  
  const canGenerateWithAI = () => {
    return formData.board && formData.class && formData.subject && formData.questionType && formData.difficulty && formData.marks;
  };
  
  // Handle question type change
  useEffect(() => {
    if (formData.questionType === "true-false") {
      setOptions([
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false }
      ]);
    } else if (formData.questionType === "single-correct" || formData.questionType === "multiple-correct") {
      if (options.length < 2) {
        setOptions([
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false }
        ]);
      }
    }
  }, [formData.questionType]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="board">Examination Board *</Label>
          <Select 
            value={formData.board} 
            onValueChange={(value) => handleInputChange("board", value)}
            disabled={isView || isEdit}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select board" />
            </SelectTrigger>
            <SelectContent>
              {boards.map((board) => (
                <SelectItem key={board} value={board}>
                  {board}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="class">Class *</Label>
          <Select 
            value={formData.class} 
            onValueChange={(value) => handleInputChange("class", value)}
            disabled={isView || isEdit}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Select 
            value={formData.subject} 
            onValueChange={(value) => handleInputChange("subject", value)}
            disabled={isView || isEdit}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Show chapter and topic fields only when not creating a nested question */}
        {formData.questionType !== "nested" && (
          <>
            <div>
              <Label htmlFor="chapter">Chapter</Label>
              <Input
                id="chapter"
                placeholder="Enter chapter name"
                value={formData.chapter}
                onChange={(e) => handleInputChange("chapter", e.target.value)}
                disabled={isView || isEdit}
              />
            </div>
            
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="Enter topic name"
                value={formData.topic}
                onChange={(e) => handleInputChange("topic", e.target.value)}
                disabled={isView || isEdit}
              />
            </div>
          </>
        )}
        
        <div>
          <Label htmlFor="marks">Marks *</Label>
          <Select 
            value={formData.marks} 
            onValueChange={(value) => handleInputChange("marks", value)}
            disabled={isView}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select marks" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 8, 10].map((mark) => (
                <SelectItem key={mark} value={mark.toString()}>
                  {mark}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="difficulty">Difficulty Level *</Label>
          <Select 
            value={formData.difficulty} 
            onValueChange={(value) => handleInputChange("difficulty", value)}
            disabled={isView}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="questionType">Question Type *</Label>
          <Select 
            value={formData.questionType} 
            onValueChange={(value) => handleInputChange("questionType", value)}
            disabled={isView}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              {parentQuestionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {formData.questionType !== "nested" ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="question">Question *</Label>
              <Button 
                type="button" 
                size="sm"
                variant="outline"
                onClick={() => handleImageUpload("questionImage")}
                disabled={isView}
              >
                <Image className="h-4 w-4 mr-1" /> Add Image
              </Button>
            </div>
            <Button 
              type="button" 
              size="sm" 
              disabled={isGenerating || !canGenerateWithAI() || isView}
              onClick={generateQuestion}
            >
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
          </div>
          
          {formData.questionImage && (
            <div className="relative w-full h-60 rounded-md overflow-hidden mb-2">
              <img 
                src={formData.questionImage} 
                alt="Question" 
                className="w-full h-full object-cover" 
              />
              {!isView && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleInputChange("questionImage", "")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          <Textarea
            id="question"
            placeholder="Enter question text here"
            value={formData.question}
            onChange={(e) => handleInputChange("question", e.target.value)}
            rows={5}
            disabled={isView}
            required
            className="mt-1"
          />
        </div>
      ) : (
        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="parentQuestion">Parent Question *</Label>
              <Button 
                type="button" 
                size="sm"
                variant="outline"
                onClick={() => handleImageUpload("parentQuestionImage")}
                disabled={isView}
              >
                <Image className="h-4 w-4 mr-1" /> Add Image
              </Button>
            </div>
            <Button 
              type="button" 
              size="sm" 
              disabled={isGenerating || !canGenerateWithAI() || isView}
              onClick={generateQuestion}
            >
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
          </div>
          
          {formData.parentQuestionImage && (
            <div className="relative w-full h-60 rounded-md overflow-hidden mb-2">
              <img 
                src={formData.parentQuestionImage} 
                alt="Parent Question" 
                className="w-full h-full object-cover" 
              />
              {!isView && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleInputChange("parentQuestionImage", "")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          <Textarea
            id="parentQuestion"
            placeholder="Enter parent question text here (e.g., 'Answer the following questions:')"
            value={formData.parentQuestion}
            onChange={(e) => handleInputChange("parentQuestion", e.target.value)}
            rows={3}
            disabled={isView}
            required
            className="mt-1"
          />
          
          <div className="flex justify-between items-center mt-4">
            <h3 className="text-lg font-medium">Child Questions</h3>
            {!isView && (
              <Button type="button" size="sm" variant="outline" onClick={addChildQuestion}>
                <Plus className="h-4 w-4 mr-1" /> Add Child Question
              </Button>
            )}
          </div>
          
          {childQuestions.map((childQuestion, index) => (
            <div key={index} className="border p-4 rounded-md bg-white">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Question {index + 1}</h4>
                {!isView && childQuestions.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeChildQuestion(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Add Chapter and Topic fields for each child question */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label htmlFor={`childChapter-${index}`}>Chapter *</Label>
                    <Input
                      id={`childChapter-${index}`}
                      placeholder="Enter chapter name"
                      value={childQuestion.chapter || ""}
                      onChange={(e) => handleChildQuestionChange(index, "chapter", e.target.value)}
                      disabled={isView}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`childTopic-${index}`}>Topic</Label>
                    <Input
                      id={`childTopic-${index}`}
                      placeholder="Enter topic name"
                      value={childQuestion.topic || ""}
                      onChange={(e) => handleChildQuestionChange(index, "topic", e.target.value)}
                      disabled={isView}
                    />
                  </div>
                </div>
              
                <div className="flex items-center gap-2">
                  <Label htmlFor={`childQuestion-${index}`}>Question Text *</Label>
                  {!isView && (
                    <Button 
                      type="button" 
                      size="sm"
                      variant="outline"
                      onClick={() => handleChildQuestionImageUpload(index)}
                    >
                      <Image className="h-4 w-4 mr-1" /> Add Image
                    </Button>
                  )}
                </div>
                
                {childQuestion.questionImage && (
                  <div className="relative w-full h-40 rounded-md overflow-hidden mb-2">
                    <img 
                      src={childQuestion.questionImage} 
                      alt={`Child Question ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    {!isView && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleChildQuestionChange(index, "questionImage", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                
                <Textarea
                  id={`childQuestion-${index}`}
                  placeholder="Enter child question text here"
                  value={childQuestion.question}
                  onChange={(e) => handleChildQuestionChange(index, "question", e.target.value)}
                  rows={3}
                  disabled={isView}
                  required
                  className="mt-1"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`childMarks-${index}`}>Marks *</Label>
                    <Input
                      id={`childMarks-${index}`}
                      type="number"
                      min="1"
                      placeholder="Marks"
                      value={childQuestion.marks}
                      onChange={(e) => handleChildQuestionChange(index, "marks", parseInt(e.target.value) || 0)}
                      disabled={isView}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`childQuestionType-${index}`}>Question Type *</Label>
                    <Select
                      value={childQuestion.questionType || "subjective"}
                      onValueChange={(value) => handleChildQuestionChange(index, "questionType", value)}
                      disabled={isView}
                    >
                      <SelectTrigger id={`childQuestionType-${index}`}>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Display options for child questions based on selected type */}
                {childQuestion.questionType === "single-correct" || childQuestion.questionType === "multiple-correct" ? (
                  <div className="space-y-3 mt-2">
                    <div className="flex justify-between items-center">
                      <Label>Options *</Label>
                      {!isView && (
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          onClick={() => addChildOption(index)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Option
                        </Button>
                      )}
                    </div>
                    
                    {(childQuestion.options || []).map((option, optionIndex) => (
                      <div key={optionIndex} className="space-y-2 border p-3 rounded-md">
                        <div className="flex items-center gap-3">
                          {childQuestion.questionType === "single-correct" ? (
                            <RadioGroup 
                              value={option.isCorrect ? optionIndex.toString() : ""} 
                              onValueChange={(value) => {
                                if (!isView) {
                                  const newChildQuestions = [...childQuestions];
                                  if (newChildQuestions[index].options) {
                                    newChildQuestions[index].options = newChildQuestions[index].options!.map((opt, idx) => ({
                                      ...opt,
                                      isCorrect: idx.toString() === value
                                    }));
                                  }
                                  setChildQuestions(newChildQuestions);
                                }
                              }}
                            >
                              <RadioGroupItem value={optionIndex.toString()} id={`child-${index}-option-${optionIndex}`} disabled={isView} />
                            </RadioGroup>
                          ) : (
                            <Checkbox 
                              checked={option.isCorrect}
                              onCheckedChange={(checked) => {
                                if (!isView) {
                                  handleChildOptionChange(index, optionIndex, "isCorrect", checked === true)
                                }
                              }}
                              id={`child-${index}-option-${optionIndex}`}
                              disabled={isView}
                            />
                          )}
                          <Input
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option.text}
                            onChange={(e) => handleChildOptionChange(index, optionIndex, "text", e.target.value)}
                            className="flex-1"
                            disabled={isView}
                          />
                          {!isView && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleChildOptionImageUpload(index, optionIndex)}
                            >
                              <Image className="h-4 w-4" />
                            </Button>
                          )}
                          {!isView && (childQuestion.options || []).length > 2 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeChildOption(index, optionIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {option.image && (
                          <div className="relative h-24 w-full rounded-md overflow-hidden">
                            <img 
                              src={option.image} 
                              alt={`Option ${optionIndex + 1}`} 
                              className="h-full w-full object-cover" 
                            />
                            {!isView && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  const newChildQuestions = [...childQuestions];
                                  if (newChildQuestions[index].options) {
                                    newChildQuestions[index].options![optionIndex] = { 
                                      ...newChildQuestions[index].options![optionIndex], 
                                      image: undefined 
                                    };
                                  }
                                  setChildQuestions(newChildQuestions);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : childQuestion.questionType === "true-false" ? (
                  <div className="space-y-2 mt-2">
                    <Label>Correct Answer *</Label>
                    <RadioGroup 
                      value={childQuestion.options?.findIndex(opt => opt.isCorrect) === 0 ? "true" : "false"}
                      onValueChange={(value) => {
                        if (!isView) {
                          const newChildQuestions = [...childQuestions];
                          newChildQuestions[index].options = [
                            { text: "True", isCorrect: value === "true" },
                            { text: "False", isCorrect: value === "false" }
                          ];
                          setChildQuestions(newChildQuestions);
                        }
                      }}
                      disabled={isView}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`child-${index}-true`} disabled={isView} />
                        <Label htmlFor={`child-${index}-true`}>True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`child-${index}-false`} disabled={isView} />
                        <Label htmlFor={`child-${index}-false`}>False</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ) : (
                  <div className="mt-2">
                    <Label htmlFor={`childAnswer-${index}`}>{childQuestion.questionType === "fill-in-the-blank" ? "Answer *" : "Model Answer"}</Label>
                    <Textarea
                      id={`childAnswer-${index}`}
                      placeholder={
                        childQuestion.questionType === "fill-in-the-blank" 
                          ? "Enter the correct answer" 
                          : "Enter model answer (optional)"
                      }
                      value={childQuestion.answer || ""}
                      onChange={(e) => handleChildQuestionChange(index, "answer", e.target.value)}
                      rows={2}
                      required={childQuestion.questionType === "fill-in-the-blank"}
                      disabled={isView}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {(formData.questionType === "single-correct" || formData.questionType === "multiple-correct") && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Options *</Label>
            {!isView && (
              <Button type="button" size="sm" variant="outline" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" /> Add Option
              </Button>
            )}
          </div>
          
          {options.map((option, index) => (
            <div key={index} className="space-y-2 border p-3 rounded-md">
              <div className="flex items-center gap-3">
                {formData.questionType === "single-correct" ? (
                  <RadioGroup value={option.isCorrect ? index.toString() : ""} onValueChange={(value) => {
                    if (!isView) {
                      const newOptions = options.map((opt, idx) => ({
                        ...opt,
                        isCorrect: idx.toString() === value
                      }));
                      setOptions(newOptions);
                    }
                  }}>
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={isView} />
                  </RadioGroup>
                ) : (
                  <Checkbox 
                    checked={option.isCorrect}
                    onCheckedChange={(checked) => {
                      if (!isView) {
                        handleOptionChange(index, "isCorrect", checked === true)
                      }
                    }}
                    id={`option-${index}`}
                    disabled={isView}
                  />
                )}
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                  className="flex-1"
                  disabled={isView}
                />
                {!isView && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOptionImageUpload(index)}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                )}
                {!isView && options.length > 2 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {option.image && (
                <div className="relative h-24 w-full rounded-md overflow-hidden">
                  <img 
                    src={option.image} 
                    alt={`Option ${index + 1}`} 
                    className="h-full w-full object-cover" 
                  />
                  {!isView && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        const newOptions = [...options];
                        newOptions[index] = { ...newOptions[index], image: undefined };
                        setOptions(newOptions);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {formData.questionType === "true-false" && (
        <div className="space-y-2">
          <Label>Correct Answer *</Label>
          <RadioGroup 
            defaultValue={options.findIndex(opt => opt.isCorrect) === 0 ? "true" : "false"}
            onValueChange={(value) => {
              if (!isView) {
                setOptions([
                  { text: "True", isCorrect: value === "true" },
                  { text: "False", isCorrect: value === "false" }
                ]);
              }
            }}
            disabled={isView}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" disabled={isView} />
              <Label htmlFor="true">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" disabled={isView} />
              <Label htmlFor="false">False</Label>
            </div>
          </RadioGroup>
        </div>
      )}
      
      {(formData.questionType === "fill-in-the-blank" || formData.questionType === "subjective") && (
        <div>
          <Label htmlFor="answer">Model Answer {formData.questionType === "fill-in-the-blank" ? "*" : ""}</Label>
          <Textarea
            id="answer"
            placeholder={
              formData.questionType === "fill-in-the-blank" 
                ? "Enter the correct answer" 
                : "Enter model answer (optional)"
            }
            value={formData.answer}
            onChange={(e) => handleInputChange("answer", e.target.value)}
            rows={formData.questionType === "fill-in-the-blank" ? 2 : 5}
            required={formData.questionType === "fill-in-the-blank"}
            disabled={isView}
            className="mt-1"
          />
        </div>
      )}
      
      {formData.questionType === "subjective" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Evaluation Rubric *</Label>
            {!isView && (
              <Button type="button" size="sm" variant="outline" onClick={addRubric}>
                <Plus className="h-4 w-4 mr-1" /> Add Criteria
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">Total weight must sum to 100%</p>
          
          {rubrics.map((rubric, index) => (
            <div key={index} className="flex items-center gap-3 border p-3 rounded-md">
              <Input
                placeholder="Evaluation criteria"
                value={rubric.criteria}
                onChange={(e) => handleRubricChange(index, "criteria", e.target.value)}
                className="flex-1"
                disabled={isView}
              />
              <div className="flex items-center gap-2 min-w-[100px]">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={rubric.weight}
                  onChange={(e) => handleRubricChange(index, "weight", parseInt(e.target.value) || 0)}
                  className="w-20"
                  disabled={isView}
                />
                <span>%</span>
              </div>
              {!isView && rubrics.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeRubric(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <div className="text-sm font-medium">
            Total: {rubrics.reduce((sum, rubric) => sum + rubric.weight, 0)}%
          </div>
        </div>
      )}
      
      {!isView && (
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/question-bank")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Question" : "Save Question"}
          </Button>
        </div>
      )}
      
      {isView && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => navigate("/dashboard/question-bank")}
          >
            Back to Question Bank
          </Button>
        </div>
      )}
    </form>
  );
};

export default QuestionForm;
