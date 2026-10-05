"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Camera, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  userId: string
  bucket: "avatars" | "covers"
  currentUrl?: string | null
  onUploaded: (url: string) => void
  onRemoved?: () => void
  className?: string
  aspectRatio?: "square" | "cover"
}

// Client-side helper to convert & compress any image into WebP format using canvas
async function compressToWebP(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Không thể khởi tạo canvas"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Lỗi khi nén ảnh sang WebP"))
          }
        },
        "image/webp",
        quality
      )
    }
    img.onerror = (err) => reject(err)
  })
}

export function ImageUpload({
  userId,
  bucket,
  currentUrl,
  onUploaded,
  onRemoved,
  className,
  aspectRatio = "square",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(currentUrl || null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setPreview(currentUrl || null)
  }, [currentUrl])

  // Extract storage path from a full public Supabase URL
  function extractPathFromUrl(url: string, bucketName: string): string | null {
    try {
      const marker = `/storage/v1/object/public/${bucketName}/`
      const index = url.indexOf(marker)
      if (index !== -1) {
        return url.substring(index + marker.length)
      }
      return null
    } catch {
      return null
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Check raw file size limit before processing (10MB maximum input)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File tải lên vượt quá giới hạn 10MB.")
      return
    }

    try {
      setIsUploading(true)
      const isAvatar = bucket === "avatars"
      const maxW = isAvatar ? 600 : 1600
      const maxH = isAvatar ? 600 : 800

      // Compress client-side to WebP
      const webpBlob = await compressToWebP(file, maxW, maxH, 0.88)

      const supabase = createClient()
      const prefix = isAvatar ? "avatar" : "cover"
      const filePath = `${userId}/${prefix}-${Date.now()}.webp`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, webpBlob, {
          contentType: "image/webp",
          upsert: true,
        })

      if (uploadError) {
        toast.error("Không thể tải ảnh lên: " + uploadError.message)
        return
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      const newUrl = publicUrlData.publicUrl

      // If there was an old image uploaded by this user, delete it to save space
      if (currentUrl) {
        const oldPath = extractPathFromUrl(currentUrl, bucket)
        if (oldPath && oldPath.startsWith(`${userId}/`)) {
          await supabase.storage.from(bucket).remove([oldPath])
        }
      }

      setPreview(newUrl)
      onUploaded(newUrl)
      toast.success(
        isAvatar
          ? "Cập nhật ảnh đại diện thành công!"
          : "Cập nhật ảnh bìa thành công!"
      )
    } catch (err) {
      console.error(err)
      toast.error("Đã xảy ra lỗi khi xử lý ảnh. Vui lòng thử lại.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  async function handleRemove() {
    if (!currentUrl) return

    try {
      setIsUploading(true)
      const supabase = createClient()
      const oldPath = extractPathFromUrl(currentUrl, bucket)
      if (oldPath && oldPath.startsWith(`${userId}/`)) {
        await supabase.storage.from(bucket).remove([oldPath])
      }

      setPreview(null)
      onRemoved?.()
      toast.success("Đã gỡ ảnh thành công.")
    } catch (err) {
      console.error(err)
      toast.error("Lỗi khi gỡ ảnh.")
    } finally {
      setIsUploading(false)
    }
  }

  if (aspectRatio === "cover") {
    return (
      <div className={cn("space-y-3", className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <div className="relative aspect-[3/1] sm:aspect-[3.5/1] w-full overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-xs">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Ảnh bìa"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground p-4 text-center">
              <ImageIcon className="h-8 w-8 stroke-[1.5]" />
              <p className="text-xs">Chưa có ảnh bìa (Kích thước gợi ý: 1200 x 400px)</p>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xs">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {preview ? "Thay đổi ảnh bìa" : "Tải ảnh bìa lên"}
          </Button>

          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Gỡ ảnh bìa
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Square (Avatar)
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-muted shadow-xs">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Ảnh đại diện"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Camera className="h-8 w-8 stroke-[1.5]" />
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xs">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {preview ? "Đổi ảnh đại diện" : "Tải ảnh đại diện"}
          </Button>

          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Định dạng JPG, PNG hoặc WebP. Tự động cắt & nén tối ưu.
        </p>
      </div>
    </div>
  )
}
