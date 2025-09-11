"use client"

import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { ImageUpload } from "@/components/ui/image-upload"
import type { CloudinaryUploadResult } from "@/lib/cloudinary"
import { toast } from "@/hooks/use-toast"

interface ProfileImageUploadProps {
  currentImageUrl?: string
  onImageUpdate?: (imageUrl: string) => void
}

export function ProfileImageUpload({ currentImageUrl, onImageUpdate }: ProfileImageUploadProps) {
  const { user } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleImageUpload = async (result: CloudinaryUploadResult) => {
    if (!user) return

    setIsUpdating(true)
    try {
      // Update user profile in Firestore with new image URL
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        profileImage: result.secure_url,
        profileImagePublicId: result.public_id,
        updatedAt: new Date(),
      })

      // Call callback if provided
      if (onImageUpdate) {
        onImageUpdate(result.secure_url)
      }

      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile image:", error)
      toast({
        title: "Error",
        description: "Failed to update profile image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleImageRemove = async () => {
    if (!user) return

    setIsUpdating(true)
    try {
      // Remove image URL from user profile
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        profileImage: null,
        profileImagePublicId: null,
        updatedAt: new Date(),
      })

      // Call callback if provided
      if (onImageUpdate) {
        onImageUpdate("")
      }

      toast({
        title: "Profile image removed",
        description: "Your profile image has been removed.",
      })
    } catch (error) {
      console.error("Error removing profile image:", error)
      toast({
        title: "Error",
        description: "Failed to remove profile image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Profile Image</h3>
      <ImageUpload
        onUpload={handleImageUpload}
        onRemove={handleImageRemove}
        currentImage={currentImageUrl}
        folder="healthconnect/profiles"
        maxSize={2}
        className={isUpdating ? "opacity-50 pointer-events-none" : ""}
      />
    </div>
  )
}
