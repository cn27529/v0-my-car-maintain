"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"

interface FileUploadProps {
  accept?: string
  maxSize?: number // MB
  onFileSelect: (file: File | null) => void
  currentFile?: string | null
  placeholder?: string
}

export function FileUpload({
  accept = "image/*",
  maxSize = 5,
  onFileSelect,
  currentFile,
  placeholder = "選擇文件",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file: File | null) => {
    if (file && file.size > maxSize * 1024 * 1024) {
      alert(`文件大小不能超過 ${maxSize}MB`)
      return
    }
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {currentFile ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">已選擇文件</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                更換
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleFileSelect(null)}>
                <X className="w-4 h-4 mr-2" />
                移除
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">{placeholder}</p>
            <p className="text-xs text-gray-400">拖拽文件到此處或點擊選擇</p>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              選擇文件
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          handleFileSelect(file)
        }}
      />
    </div>
  )
}
