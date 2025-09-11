"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadToCloudinary, type CloudinaryUploadResult } from "@/lib/cloudinary"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onUpload: (result: CloudinaryUploadResult) => void
  onRemove?: () => void
  currentImage?: string
  folder?: string
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

export function ImageUpload({
  onUpload,
  onRemove,
  currentImage,
  folder = "healthconnect",
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`Please select a valid image file (${acceptedTypes.join(", ")})`)
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const result = await uploadToCloudinary(file, folder)
      onUpload(result)
    } catch (error) {
      setError("Failed to upload image. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Label htmlFor="image-upload" className="text-sm font-medium">
          Upload Image
        </Label>
        {currentImage && onRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 bg-transparent"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {currentImage ? (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
          <Image src={currentImage || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover" />
        </div>
      ) : (
        <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          id="image-upload"
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Choose Image"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-gray-500">
        Max size: {maxSize}MB. Supported formats: {acceptedTypes.map((type) => type.split("/")[1]).join(", ")}
      </p>
    </div>
  )
}
