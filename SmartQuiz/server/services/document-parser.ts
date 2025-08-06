import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

export type SupportedFileType = 'pptx' | 'docx' | 'pdf';

export function getSupportedFileType(filename: string): SupportedFileType | null {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pptx':
      return 'pptx';
    case '.docx':
      return 'docx';
    case '.pdf':
      return 'pdf';
    default:
      return null;
  }
}

export function validateDocumentFile(filename: string): boolean {
  const supportedTypes = ['.pptx', '.docx', '.pdf'];
  const ext = path.extname(filename).toLowerCase();
  return supportedTypes.includes(ext);
}

export async function extractTextFromDocument(filePath: string, filename: string): Promise<string> {
  const fileType = getSupportedFileType(filename);
  
  if (!fileType) {
    throw new Error('Unsupported file type');
  }

  try {
    switch (fileType) {
      case 'pptx':
        return await extractTextFromPPTX(filePath);
      case 'docx':
        return await extractTextFromDOCX(filePath);
      case 'pdf':
        return await extractTextFromPDF(filePath);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileType}:`, error);
    throw new Error(`Failed to extract text from ${fileType} file`);
  }
}

async function extractTextFromPPTX(filePath: string): Promise<string> {
  // Import the existing PPTX parser
  const { extractTextFromPPTX: pptxExtractor } = await import('./pptx-parser');
  return pptxExtractor(filePath);
}

async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value.trim();
    
    if (!text || text.length < 10) {
      throw new Error('Could not extract sufficient text from DOCX file');
    }
    
    return text;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Use dynamic import to avoid build issues
    const pdfParse = await import('pdf-parse-new');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse.default(dataBuffer);
    const text = data.text.trim();
    
    if (!text || text.length < 10) {
      throw new Error('Could not extract sufficient text from PDF file');
    }
    
    return text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}