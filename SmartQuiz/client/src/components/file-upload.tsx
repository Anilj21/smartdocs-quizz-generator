import { useState, useRef } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}

export default function FileUpload({ onFileSelect, isUploading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',   // .docx
      'application/pdf'  // .pdf
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a .pptx, .docx, or .pdf file');
      return false;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert('File size must be less than 25MB');
      return false;
    }
    return true;
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="text-center">
        <div
          className={`border-2 border-dashed rounded-xl p-12 transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : dragActive
              ? "border-primary/40"
              : "border-slate-300"
          } ${!isUploading ? "hover:border-primary/40" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CloudUpload className="text-primary w-8 h-8" />
            </div>
            
            {selectedFile ? (
              <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-lg">
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {selectedFile.name}
                </span>
                <button
                  onClick={clearFile}
                  className="text-slate-400 hover:text-slate-600"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Upload Document
                </h3>
                <p className="text-slate-600 mb-4">
                  Drag and drop your document here, or click to browse
                </p>
                <Button
                  onClick={openFileDialog}
                  disabled={isUploading}
                  className="bg-primary hover:bg-primary/90"
                >
                  Choose File
                </Button>
              </div>
            )}
            
            <p className="text-sm text-slate-500">
              Supports .pptx, .docx, and .pdf files up to 25MB
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pptx,.docx,.pdf"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
}
