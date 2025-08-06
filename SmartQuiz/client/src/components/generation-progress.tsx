import { Loader2 } from "lucide-react";

interface GenerationProgressProps {
  isVisible: boolean;
  progress: number;
  stage: string;
}

export default function GenerationProgress({ isVisible, progress, stage }: GenerationProgressProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="text-primary w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Generating Quiz</h3>
        <p className="text-slate-600 mb-6">
          AI is analyzing your presentation and creating quiz questions...
        </p>
        <div className="max-w-md mx-auto">
          <div className="bg-slate-200 rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500">{stage}</p>
        </div>
      </div>
    </div>
  );
}
