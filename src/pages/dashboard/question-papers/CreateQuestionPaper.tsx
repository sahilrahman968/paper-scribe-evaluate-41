import React, { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuestionForm from "@/components/forms/QuestionForm";

// Local utility function for generating random IDs
const getRandomId = () => Math.random().toString(36).substr(2, 9);

interface Question {
  id: string;
  question: string;
  questionType: string;
  marks: number;
  difficulty: string;
  answer: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  rubrics: { id: string; criteria: string; weight: number }[];
  childQuestions?: Question[];
}

interface Section {
  id: string;
  name: string;
  instructions: string;
  questions: Question[];
}

const CreateQuestionPaper = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState<Section[]>([
    {
      id: getRandomId(),
      name: "Section 1",
      instructions: "",
      questions: [],
    },
  ]);
  const [activeTab, setActiveTab] = useState("manual");
  const [paperDetails, setPaperDetails] = useState(null);

  useEffect(() => {
    // Load paper details from local storage on component mount
    const storedPaperDetails = localStorage.getItem("paperDetails");
    if (storedPaperDetails) {
      setPaperDetails(JSON.parse(storedPaperDetails));
    }
  }, []);

  useEffect(() => {
    // Update local storage when paperDetails change
    localStorage.setItem("paperDetails", JSON.stringify(paperDetails));
  }, [paperDetails]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If the item was dropped in the same list, reorder the questions
    if (source.droppableId === destination.droppableId) {
      const sectionIndex = sections.findIndex((section) => section.id === source.droppableId);
      const questions = Array.from(sections[sectionIndex].questions);
      const [reorderedQuestion] = questions.splice(source.index, 1);
      questions.splice(destination.index, 0, reorderedQuestion);

      const updatedSections = [...sections];
      updatedSections[sectionIndex].questions = questions;

      setSections(updatedSections);
    } else {
      // If the item was dropped in a different list, move the question to the new list
      const sourceSectionIndex = sections.findIndex((section) => section.id === source.droppableId);
      const destinationSectionIndex = sections.findIndex((section) => section.id === destination.droppableId);
      const sourceQuestions = Array.from(sections[sourceSectionIndex].questions);
      const destinationQuestions = Array.from(sections[destinationSectionIndex].questions);
      const [movedQuestion] = sourceQuestions.splice(source.index, 1);
      destinationQuestions.splice(destination.index, 0, movedQuestion);

      const updatedSections = [...sections];
      updatedSections[sourceSectionIndex].questions = sourceQuestions;
      updatedSections[destinationSectionIndex].questions = destinationQuestions;

      setSections(updatedSections);
    }
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: getRandomId(),
        name: `Section ${sections.length + 1}`,
        instructions: "",
        questions: [],
      },
    ]);
  };

  const removeSection = (sectionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections.splice(sectionIndex, 1);
    setSections(updatedSections);
  };

  const updateSectionName = (sectionIndex: number, name: string) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].name = name;
    setSections(updatedSections);
  };

  const updateSectionInstructions = (sectionIndex: number, instructions: string) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].instructions = instructions;
    setSections(updatedSections);
  };

  // Modified addQuestion function to restrict question types for manual tab
  const addQuestion = (sectionIndex: number) => {
    const newQuestion = {
      id: getRandomId(),
      question: "",
      questionType: "subjective", // Default to subjective
      marks: 1,
      difficulty: "Easy",
      answer: "",
      options: [],
      rubrics: [],
      childQuestions: []
    };

    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.push(newQuestion);
    setSections(updatedSections);
  };

  // Modified updateQuestion function to handle question type restrictions
  const updateQuestion = (sectionIndex: number, questionIndex: number, field: string, value: any) => {
    const updatedSections = [...sections];
    const question = updatedSections[sectionIndex].questions[questionIndex];
    
    // Restrict question types for manual tab
    if (field === "questionType" && activeTab === "manual") {
      const allowedTypes = ["subjective", "single-correct", "multiple-correct", "nested"];
      if (!allowedTypes.includes(value)) {
        return; // Don't update if type is not allowed
      }
      
      // If changing to nested, ensure child questions have allowed types
      if (value === "nested") {
        question.childQuestions = question.childQuestions?.map(child => ({
          ...child,
          questionType: ["subjective", "single-correct", "multiple-correct"].includes(child.questionType) 
            ? child.questionType 
            : "subjective"
        })) || [];
      }
    }
    
    question[field] = value;
    setSections(updatedSections);
  };

  // Modified addChildQuestion function to restrict child question types
  const addChildQuestion = (sectionIndex: number, questionIndex: number) => {
    const newChildQuestion = {
      id: getRandomId(),
      question: "",
      questionType: "subjective", // Default to subjective for child questions
      marks: 1,
      answer: "",
      options: []
    };

    const updatedSections = [...sections];
    if (!updatedSections[sectionIndex].questions[questionIndex].childQuestions) {
      updatedSections[sectionIndex].questions[questionIndex].childQuestions = [];
    }
    updatedSections[sectionIndex].questions[questionIndex].childQuestions.push(newChildQuestion);
    setSections(updatedSections);
  };

  // Modified updateChildQuestion function to restrict child question types
  const updateChildQuestion = (sectionIndex: number, questionIndex: number, childIndex: number, field: string, value: any) => {
    const updatedSections = [...sections];
    const childQuestion = updatedSections[sectionIndex].questions[questionIndex].childQuestions[childIndex];
    
    // Restrict child question types for manual tab
    if (field === "questionType" && activeTab === "manual") {
      const allowedChildTypes = ["subjective", "single-correct", "multiple-correct"];
      if (!allowedChildTypes.includes(value)) {
        return; // Don't update if type is not allowed for child questions
      }
    }
    
    childQuestion[field] = value;
    setSections(updatedSections);
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.splice(questionIndex, 1);
    setSections(updatedSections);
  };

  const removeChildQuestion = (sectionIndex: number, questionIndex: number, childIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions[questionIndex].childQuestions.splice(childIndex, 1);
    setSections(updatedSections);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create Question Paper</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              placeholder="Question Paper Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Question Paper Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Tabs defaultValue="manual" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="ai">AI Assisted</TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="space-y-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                {sections.map((section, sectionIndex) => (
                  <Card key={section.id} className="space-y-4">
                    <CardHeader>
                      <CardTitle>
                        <Input
                          type="text"
                          placeholder={`Section ${sectionIndex + 1} Name`}
                          value={section.name}
                          onChange={(e) => updateSectionName(sectionIndex, e.target.value)}
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Instructions</Label>
                        <Textarea
                          placeholder="Section Instructions"
                          value={section.instructions}
                          onChange={(e) => updateSectionInstructions(sectionIndex, e.target.value)}
                        />
                      </div>
                      <Droppable droppableId={section.id}>
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {section.questions.map((question, questionIndex) => (
                              <Draggable key={question.id} draggableId={question.id} index={questionIndex}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-gray-100 p-4 rounded-md shadow-sm border border-gray-200"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <GripVertical className="h-4 w-4 text-gray-500 cursor-move" />
                                        <span>Question {questionIndex + 1}</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeQuestion(sectionIndex, questionIndex)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                      <div>
                                        <Label htmlFor={`question-${sectionIndex}-${questionIndex}`}>Question</Label>
                                        <Input
                                          type="text"
                                          id={`question-${sectionIndex}-${questionIndex}`}
                                          placeholder="Enter question"
                                          value={question.question}
                                          onChange={(e) =>
                                            updateQuestion(sectionIndex, questionIndex, "question", e.target.value)
                                          }
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`questionType-${sectionIndex}-${questionIndex}`}>
                                          Question Type
                                        </Label>
                                        <Select
                                          value={question.questionType}
                                          onValueChange={(value) =>
                                            updateQuestion(sectionIndex, questionIndex, "questionType", value)
                                          }
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a question type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="subjective">Subjective</SelectItem>
                                            <SelectItem value="single-correct">Single Correct</SelectItem>
                                            <SelectItem value="multiple-correct">Multiple Correct</SelectItem>
                                            <SelectItem value="nested">Nested</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label htmlFor={`marks-${sectionIndex}-${questionIndex}`}>Marks</Label>
                                        <Input
                                          type="number"
                                          id={`marks-${sectionIndex}-${questionIndex}`}
                                          placeholder="Enter marks"
                                          value={question.marks}
                                          onChange={(e) =>
                                            updateQuestion(sectionIndex, questionIndex, "marks", parseInt(e.target.value))
                                          }
                                        />
                                      </div>
                                      {question.questionType === "nested" && (
                                        <div className="col-span-2">
                                          <Card className="space-y-4">
                                            <CardHeader>
                                              <CardTitle>Child Questions</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                              {question.childQuestions && question.childQuestions.map((childQuestion, childIndex) => (
                                                <div key={childQuestion.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                                  <div className="flex items-center justify-between">
                                                    <span>Child Question {childIndex + 1}</span>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => removeChildQuestion(sectionIndex, questionIndex, childIndex)}
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                    <div>
                                                      <Label htmlFor={`child-question-${sectionIndex}-${questionIndex}-${childIndex}`}>
                                                        Question
                                                      </Label>
                                                      <Input
                                                        type="text"
                                                        id={`child-question-${sectionIndex}-${questionIndex}-${childIndex}`}
                                                        placeholder="Enter child question"
                                                        value={childQuestion.question}
                                                        onChange={(e) =>
                                                          updateChildQuestion(sectionIndex, questionIndex, childIndex, "question", e.target.value)
                                                        }
                                                      />
                                                    </div>
                                                    <div>
                                                      <Label htmlFor={`child-questionType-${sectionIndex}-${questionIndex}-${childIndex}`}>
                                                        Question Type
                                                      </Label>
                                                      <Select
                                                        value={childQuestion.questionType}
                                                        onValueChange={(value) =>
                                                          updateChildQuestion(sectionIndex, questionIndex, childIndex, "questionType", value)
                                                        }
                                                      >
                                                        <SelectTrigger className="w-full">
                                                          <SelectValue placeholder="Select a question type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="subjective">Subjective</SelectItem>
                                                          <SelectItem value="single-correct">Single Correct</SelectItem>
                                                          <SelectItem value="multiple-correct">Multiple Correct</SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                    </div>
                                                    <div>
                                                      <Label htmlFor={`child-marks-${sectionIndex}-${questionIndex}-${childIndex}`}>
                                                        Marks
                                                      </Label>
                                                      <Input
                                                        type="number"
                                                        id={`child-marks-${sectionIndex}-${questionIndex}-${childIndex}`}
                                                        placeholder="Enter marks"
                                                        value={childQuestion.marks}
                                                        onChange={(e) =>
                                                          updateChildQuestion(sectionIndex, questionIndex, childIndex, "marks", parseInt(e.target.value))
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addChildQuestion(sectionIndex, questionIndex)}
                                              >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Child Question
                                              </Button>
                                            </CardContent>
                                          </Card>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <Button variant="outline" onClick={() => addQuestion(sectionIndex)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </DragDropContext>
              <Button variant="outline" onClick={addSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </TabsContent>
            <TabsContent value="ai">
              <QuestionForm type="ai" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateQuestionPaper;
