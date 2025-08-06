import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { LogIn } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Sign in successful",
        description: "Welcome to SmartDocs Quiz Generator!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "There was an error signing in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <LogIn className="w-5 h-5" />
            <span>Sign in to SmartDocs</span>
          </DialogTitle>
          <DialogDescription>
            Sign in to save your quizzes and access them from anywhere.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mr-2" />
            ) : (
              <FcGoogle className="w-5 h-5 mr-2" />
            )}
            Continue with Google
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}