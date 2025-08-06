import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Quiz } from "@shared/schema";
import LoginModal from "@/components/auth/login-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Download, Trash2, Filter, ArrowUpDown, FileQuestion } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: ['/api/my-quizzes', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const response = await apiRequest("GET", `/api/my-quizzes?userId=${user.uid}`);
      return response.json();
    },
    enabled: !!user,
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      await apiRequest("DELETE", `/api/quiz/${quizId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-quizzes', user?.uid] });
      toast({
        title: "Quiz Deleted",
        description: "The quiz has been removed from your library.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete quiz",
        variant: "destructive",
      });
    },
  });

  const downloadPDFMutation = useMutation({
    mutationFn: async (quiz: Quiz) => {
      const response = await fetch("/api/download-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quiz.title,
          sourceFile: quiz.sourceFile,
          questions: quiz.questions,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quiz.title}.pdf`;
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      deleteQuizMutation.mutate(quizId);
    }
  };

  const handleDownloadQuiz = (quiz: Quiz) => {
    downloadPDFMutation.mutate(quiz);
  };

  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileQuestion className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Sign in required</h3>
              <p className="text-slate-600 mb-6">
                Please sign in to view your saved quiz library
              </p>
              <Button onClick={() => setShowLoginModal(true)} className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <LoginModal 
          open={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Quiz Library</h2>
        <div className="flex space-x-3">
          <Button variant="outline" className="text-slate-600 hover:text-slate-900">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="text-slate-600 hover:text-slate-900">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sort
          </Button>
        </div>
      </div>

      {!quizzes || quizzes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileQuestion className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No quizzes yet</h3>
            <p className="text-slate-600 mb-6">
              Upload your first PowerPoint presentation to generate a quiz
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                Upload Presentation
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz Title</TableHead>
                    <TableHead>Source File</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-900">{quiz.title}</div>
                          <div className="text-sm text-slate-500">
                            AI-generated quiz questions
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {quiz.sourceFile}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {quiz.questionCount} questions
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {formatDate(quiz.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/quiz/${quiz.id}`}>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadQuiz(quiz)}
                            disabled={downloadPDFMutation.isPending}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            disabled={deleteQuizMutation.isPending}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
