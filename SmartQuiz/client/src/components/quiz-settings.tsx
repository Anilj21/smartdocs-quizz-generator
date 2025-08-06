import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuizSettingsProps {
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
}

export default function QuizSettings({
  questionCount,
  onQuestionCountChange,
  onGenerate,
  isGenerating,
  disabled
}: QuizSettingsProps) {
  const questionOptions = [
    { value: 3, label: "3 questions", description: "Quick quiz" },
    { value: 5, label: "5 questions", description: "Standard quiz" },
    { value: 10, label: "10 questions", description: "Comprehensive quiz" },
    { value: 15, label: "15 questions", description: "Detailed assessment" },
    { value: 20, label: "20 questions", description: "Full exam" },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings2 className="w-5 h-5" />
          <span>Quiz Settings</span>
        </CardTitle>
        <CardDescription>
          Customize your quiz before generating questions from your presentation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Label htmlFor="question-count">Number of Questions</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose how many quiz questions to generate from your presentation</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={questionCount.toString()}
            onValueChange={(value) => onQuestionCountChange(parseInt(value))}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select number of questions" />
            </SelectTrigger>
            <SelectContent>
              {questionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onGenerate}
          disabled={isGenerating || disabled}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating Quiz...
            </>
          ) : (
            "Generate Quiz"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}