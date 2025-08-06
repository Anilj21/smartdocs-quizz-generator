import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import QuizDisplay from "@/components/quiz-display";
import { Quiz } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizViewer() {
  const params = useParams();
  const { toast } = useToast();
  const quizId = params.id;

  const { data: quiz, isLoading, error } = useQuery<Quiz>({
    queryKey: ['/api/quiz', quizId],
    enabled: !!quizId,
  });

  const downloadPDFMutation = useMutation({
    mutationFn: async (quizData: Quiz) => {
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="mt-8 space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Quiz Not Found</h2>
          <p className="text-slate-600">
            The quiz you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    toast({
      title: "Already Saved",
      description: "This quiz is already in your library.",
    });
  };

  const handleDownload = () => {
    downloadPDFMutation.mutate(quiz);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <QuizDisplay
        title={quiz.title}
        sourceFile={quiz.sourceFile}
        questions={quiz.questions as any}
        createdAt={quiz.createdAt}
        onSave={handleSave}
        onDownload={handleDownload}
        isDownloading={downloadPDFMutation.isPending}
      />
    </div>
  );
}
