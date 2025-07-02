// src/components/CSVUploadModal.tsx
'use client';

import { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

interface UploadResult {
  successful: number;
  failed: number;
  errors: string[];
}

export default function CSVUploadModal({ isOpen, onClose, onUploadSuccess }: CSVUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const resetForm = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setIsDragOver(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileSelect = (file: File | null) => {
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadResult(null);
    } else if (file) {
      alert('Please select a CSV file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result.results);
        if (result.results.successful > 0) {
          onUploadSuccess();
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setUploadResult({
        successful: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Upload failed']
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Import Portfolio from CSV</h2>
          <Button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {!uploadResult ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className={`h-12 w-12 mx-auto mb-4 ${
                selectedFile ? 'text-green-500' : 'text-gray-400'
              }`} />
              
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">
                    File selected: {selectedFile.name}
                  </p>
                  <p className="text-xs text-green-600">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id="csv-upload"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Select File
                  </label>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-2">CSV Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>symbol</strong> - Stock symbol (required, e.g., AAPL, TCS)</li>
                <li><strong>quantity</strong> - Number of shares (required)</li>
                <li><strong>avgprice</strong> or <strong>avg_price</strong> - Average purchase price (required)</li>
                <li><strong>notes</strong> - Optional notes about the investment</li>
              </ul>
              <p className="mt-2 text-xs">
                Example: symbol,quantity,avgprice,notes<br/>
                AAPL,100,150.50,Tech investment
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isLoading ? 'Uploading...' : 'Import'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              {uploadResult.successful > 0 ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              ) : (
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              )}
              
              <h3 className="text-lg font-semibold mb-2">Upload Complete</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-green-600 font-medium">{uploadResult.successful}</span>
                    <p className="text-gray-600">Successfully imported</p>
                  </div>
                  <div>
                    <span className="text-red-600 font-medium">{uploadResult.failed}</span>
                    <p className="text-gray-600">Failed to import</p>
                  </div>
                </div>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
                <div className="max-h-32 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-700 mb-1">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setUploadResult(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Upload Another
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
