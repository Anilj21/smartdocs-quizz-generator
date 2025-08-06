import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import FileUpload from "@/components/file-upload";
import GenerationProgress from "@/components/generation-progress";
import QuizDisplay from "@/components/quiz-display";
import QuizSettings from "@/components/quiz-settings";
import LoginModal from "@/components/auth/login-modal";
import { QuizQuestion } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface GeneratedQuiz {
  title: string;
  sourceFile: string;
  questions: QuizQuestion[];
  questionCount: number;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const generateQuizMutation = useMutation({
    mutationFn: async ({ file, questionCount }: { file: File; questionCount: number }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('questionCount', questionCount.toString());
      
      setProgress(25);
      setStage("Uploading file...");
      
      const response = await apiRequest("POST", "/api/generate-quiz", formData);
      
      setProgress(50);
      setStage("Extracting content from document...");
      
      // Simulate progress updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(75);
      setStage(`Generating ${questionCount} quiz questions...`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(100);
      setStage("Finalizing quiz...");
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedQuiz(data);
      toast({
        title: "Quiz Generated Successfully",
        description: `Created ${data.questionCount} questions from your document.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quiz",
        variant: "destructive",
      });
      setProgress(0);
      setStage("");
    },
  });

  const saveQuizMutation = useMutation({
    mutationFn: async (quizData: GeneratedQuiz) => {
      if (!user) {
        throw new Error("You must be signed in to save quizzes");
      }
      
      const response = await apiRequest("POST", "/api/save-quiz", {
        userId: user.uid,
        title: quizData.title,
        sourceFile: quizData.sourceFile,
        questions: quizData.questions,
        questionCount: quizData.questionCount,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz Saved",
        description: "Your quiz has been saved to your library.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save quiz",
        variant: "destructive",
      });
    },
  });

  const downloadPDFMutation = useMutation({
    mutationFn: async (quizData: GeneratedQuiz) => {
      const response = await fetch("/api/download-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quizData.title,
          sourceFile: quizData.sourceFile,
          questions: quizData.questions,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quizData.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "PDF Downloaded",
        description: "Your quiz PDF has been downloaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download PDF",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleGenerateQuiz = () => {
    if (selectedFile) {
      generateQuizMutation.mutate({ file: selectedFile, questionCount });
    }
  };

  const handleSaveQuiz = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (generatedQuiz) {
      saveQuizMutation.mutate(generatedQuiz);
    }
  };

  const handleDownloadPDF = () => {
    if (generatedQuiz) {
      downloadPDFMutation.mutate(generatedQuiz);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Quiz Generator</h1>
          <p className="text-lg text-slate-600">
            Transform your documents into interactive quizzes using AI - supports PowerPoint, Word, and PDF files
          </p>
        </div>

        {!user && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Sign in to save your quizzes and access them from anywhere. You can still generate and download quizzes without signing in.
            </AlertDescription>
          </Alert>
        )}

        {!generatedQuiz && (
          <>
            <FileUpload
              onFileSelect={handleFileSelect}
              isUploading={generateQuizMutation.isPending}
            />
            
            {selectedFile && (
              <QuizSettings
                questionCount={questionCount}
                onQuestionCountChange={setQuestionCount}
                onGenerate={handleGenerateQuiz}
                isGenerating={generateQuizMutation.isPending}
                disabled={generateQuizMutation.isPending}
              />
            )}
          </>
        )}

        <GenerationProgress
          isVisible={generateQuizMutation.isPending}
          progress={progress}
          stage={stage}
        />

        {generatedQuiz && (
          <QuizDisplay
            title={generatedQuiz.title}
            sourceFile={generatedQuiz.sourceFile}
            questions={generatedQuiz.questions}
            onSave={handleSaveQuiz}
            onDownload={handleDownloadPDF}
            isSaving={saveQuizMutation.isPending}
            isDownloading={downloadPDFMutation.isPending}
          />
        )}
      </div>
      
      <LoginModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}
