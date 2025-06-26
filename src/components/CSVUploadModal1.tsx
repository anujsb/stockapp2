"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface CSVUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: () => void
}

export default function CSVUploadModal({ isOpen, onClose, onUploadComplete }: CSVUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setUploadStatus("idle")
      setErrorMessage("")
    } else {
      setErrorMessage("Please select a valid CSV file")
      setUploadStatus("error")
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile)
      setUploadStatus("idle")
      setErrorMessage("")
    } else {
      setErrorMessage("Please drop a valid CSV file")
      setUploadStatus("error")
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)

    // Simulate upload
    setTimeout(() => {
      setUploadStatus("success")
      setIsUploading(false)
      setTimeout(() => {
        onUploadComplete()
        onClose()
        resetModal()
      }, 1500)
    }, 2000)
  }

  const resetModal = () => {
    setFile(null)
    setUploadStatus("idle")
    setErrorMessage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Import Portfolio</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">CSV Format Required</p>
                <p className="text-sm text-blue-700">Include columns: Symbol, Quantity, AvgPrice</p>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
            <CardContent className="p-8">
              <div
                className="text-center cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />

                {file ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Drop your CSV file here</p>
                      <p className="text-sm text-gray-600">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Messages */}
          {uploadStatus === "success" && (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">Upload successful!</p>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{errorMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading || uploadStatus === "success"}
              className="flex-1"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </div>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
