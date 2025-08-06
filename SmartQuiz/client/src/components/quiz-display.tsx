import { QuizQuestion } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Save, Download, Check } from "lucide-react";

interface QuizDisplayProps {
  title: string;
  sourceFile: string;
  questions: QuizQuestion[];
  createdAt?: Date;
  onSave: () => void;
  onDownload: () => void;
  isSaving?: boolean;
  isDownloading?: boolean;
}

export default function QuizDisplay({
  title,
  sourceFile,
  questions,
  createdAt,
  onSave,
  onDownload,
  isSaving,
  isDownloading
}: QuizDisplayProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-600">
            Generated from: <span className="font-medium">{sourceFile}</span>
          </p>
          {createdAt && (
            <p className="text-sm text-slate-500 mt-1">
              Created on {formatDate(createdAt)}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Quiz</>
            )}
          </Button>
          <Button
            onClick={onDownload}
            disabled={isDownloading}
            variant="secondary"
            className="bg-slate-600 hover:bg-slate-700 text-white"
          >
            {isDownloading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Generating...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Download PDF</>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={index} className="border border-slate-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {question.question}
                </h3>
                <div className="grid gap-3">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = option === question.answer;
                    const letter = String.fromCharCode(65 + optionIndex);
                    
                    return (
                      <div
                        key={optionIndex}
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                          isCorrect
                            ? "bg-emerald-50 border-emerald-200"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isCorrect ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                          }`}>
                            {isCorrect && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-slate-600">{letter}.</span>
                        </div>
                        <span className="text-slate-700 flex-1">{option}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
