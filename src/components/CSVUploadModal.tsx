"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/portfolio/upload-csv", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setUploadStatus("success")
        setTimeout(() => {
          onUploadComplete()
          onClose()
          resetModal()
        }, 2000)
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      setUploadStatus("error")
      setErrorMessage("Failed to upload CSV file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const resetModal = () => {
    setFile(null)
    setUploadStatus("idle")
    setErrorMessage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Portfolio from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your stock holdings. The file should include columns for Symbol, Quantity, and
            Average Price.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* CSV Format Info */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Required columns:</strong> Symbol, Quantity, AvgPrice
              <br />
              <strong>Optional:</strong> Notes, PurchaseDate
            </AlertDescription>
          </Alert>

          {/* File Upload Area */}
          <Card>
            <CardContent className="p-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />

                {file ? (
                  <div className="space-y-2">
                    <FileText className="h-12 w-12 text-green-600 mx-auto" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-gray-600">Drop your CSV file here or click to browse</p>
                    <p className="text-sm text-gray-500">Maximum file size: 5MB</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Messages */}
          {uploadStatus === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                CSV file uploaded successfully! Your portfolio has been updated.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === "error" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isUploading}>
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
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
