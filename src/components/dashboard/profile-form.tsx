"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { profileSchema, type ProfileInput } from "@/lib/validations/profile"
import { updateProfileAction, updateProfileImagesAction } from "@/actions/profile"
import { ImageUpload } from "@/components/dashboard/image-upload"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  AtSign,
  Building2,
  Briefcase,
  Eye,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  Users,
} from "lucide-react"
import type { Profile } from "@/lib/auth"

interface ProfileFormProps {
  user: {
    id: string
    email?: string | null
  }
  profile: Profile
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Parse visibility object from jsonb safely
  const rawVis = (profile.visibility as Record<string, boolean>) || {}
  const initialVisibility = {
    job_title: rawVis.job_title ?? true,
    organization: rawVis.organization ?? true,
    bio: rawVis.bio ?? true,
    phone: rawVis.phone ?? true,
    email: rawVis.email ?? true,
    address: rawVis.address ?? true,
    lead_form: rawVis.lead_form ?? true,
  }

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.full_name || "",
      username: profile.username || "",
      jobTitle: profile.job_title || "",
      organization: profile.organization || "",
      bio: profile.bio || "",
      phone: profile.phone || "",
      emailPublic: profile.email_public || "",
      address: profile.address || "",
      isPublic: profile.is_public ?? true,
      visibility: initialVisibility,
    },
  })

  async function onSubmit(values: ProfileInput) {
    try {
      setIsSubmitting(true)
      const res = await updateProfileAction(values)

      if (res?.error) {
        toast.error(res.error)
        return
      }

      toast.success("Hồ sơ đã được lưu thành công!")
    } catch {
      toast.error("Đã xảy ra lỗi khi cập nhật hồ sơ.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAvatarUploaded(url: string) {
    await updateProfileImagesAction({ avatarUrl: url })
  }

  async function handleAvatarRemoved() {
    await updateProfileImagesAction({ avatarUrl: null })
  }

  async function handleCoverUploaded(url: string) {
    await updateProfileImagesAction({ coverUrl: url })
  }

  async function handleCoverRemoved() {
    await updateProfileImagesAction({ coverUrl: null })
  }

  const origin = typeof window !== "undefined" ? window.location.host : "trangcanhan.vn"
  const currentUsername = form.watch("username")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* 1. Images Card (Cover + Avatar) */}
        <Card className="border-border/60 overflow-hidden shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Hình ảnh đại diện & Ảnh bìa</CardTitle>
            <CardDescription>
              Tải lên hình ảnh thương hiệu cá nhân của bạn để tạo ấn tượng khi đối tác quét thẻ.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold mb-2">Ảnh bìa hồ sơ</p>
              <ImageUpload
                userId={user.id}
                bucket="covers"
                currentUrl={profile.cover_url}
                aspectRatio="cover"
                onUploaded={handleCoverUploaded}
                onRemoved={handleCoverRemoved}
              />
            </div>

            <div className="pt-2">
              <p className="text-sm font-semibold mb-2">Ảnh đại diện (Avatar)</p>
              <ImageUpload
                userId={user.id}
                bucket="avatars"
                currentUrl={profile.avatar_url}
                aspectRatio="square"
                onUploaded={handleAvatarUploaded}
                onRemoved={handleAvatarRemoved}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Basic Info Card */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Thông tin định danh & Giới thiệu</CardTitle>
            <CardDescription>
              Thông tin chức vụ, công tác và bio tóm tắt cá nhân.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên hiển thị *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Nguyễn Văn A" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username đường dẫn *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="nguyenvana"
                          className="pl-9 font-mono lowercase text-sm"
                          {...field}
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "")
                            field.onChange(val)
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      {origin}/u/{currentUsername || "username"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Chức danh / Nghề nghiệp</FormLabel>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <Switch
                          checked={form.watch("visibility.job_title")}
                          onCheckedChange={(checked) =>
                            form.setValue("visibility.job_title", checked)
                          }
                          title="Bật/Tắt hiển thị chức danh trên trang"
                        />
                      </div>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="VD: Giám đốc Kinh doanh / Freelancer"
                          className="pl-9"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Cơ quan / Đơn vị / Trường học</FormLabel>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <Switch
                          checked={form.watch("visibility.organization")}
                          onCheckedChange={(checked) =>
                            form.setValue("visibility.organization", checked)
                          }
                          title="Bật/Tắt hiển thị đơn vị trên trang"
                        />
                      </div>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="VD: Công ty Công Nghệ NFC / ĐH Bách Khoa"
                          className="pl-9"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Tiểu sử / Lời chào ngắn</FormLabel>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      <Switch
                        checked={form.watch("visibility.bio")}
                        onCheckedChange={(checked) =>
                          form.setValue("visibility.bio", checked)
                        }
                        title="Bật/Tắt hiển thị tiểu sử trên trang"
                      />
                    </div>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Một vài dòng giới thiệu bản thân, mục tiêu kết nối hoặc phương châm làm việc..."
                      rows={3}
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 3. Contact Info Card */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Thông tin liên hệ</CardTitle>
            <CardDescription>
              Số điện thoại, email công khai và địa chỉ để đối tác có thể liên hệ nhanh hoặc lưu danh bạ vCard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Số điện thoại</FormLabel>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <Switch
                          checked={form.watch("visibility.phone")}
                          onCheckedChange={(checked) =>
                            form.setValue("visibility.phone", checked)
                          }
                          title="Bật/Tắt hiển thị SĐT trên trang"
                        />
                      </div>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="0912 345 678"
                          className="pl-9"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Dùng cho nút Gọi điện, SMS & xuất danh bạ vCard
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailPublic"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Email công khai</FormLabel>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <Switch
                          checked={form.watch("visibility.email")}
                          onCheckedChange={(checked) =>
                            form.setValue("visibility.email", checked)
                          }
                          title="Bật/Tắt hiển thị email trên trang"
                        />
                      </div>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="lienhe@domain.com"
                          type="email"
                          className="pl-9"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Có thể khác với email đăng nhập của tài khoản
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Địa chỉ / Khu vực làm việc</FormLabel>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      <Switch
                        checked={form.watch("visibility.address")}
                        onCheckedChange={(checked) =>
                          form.setValue("visibility.address", checked)
                        }
                        title="Bật/Tắt hiển thị địa chỉ trên trang"
                      />
                    </div>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="VD: Hà Nội, Việt Nam"
                        className="pl-9"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 4. Privacy & Public Setting */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Quyền riêng tư trang cá nhân</CardTitle>
            <CardDescription>
              Kiểm soát trạng thái xuất bản trang của bạn với công chúng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border/80 p-4 bg-muted/20">
                  <div className="space-y-0.5 pr-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <FormLabel className="font-semibold text-sm">
                        Chế độ trang Công khai
                      </FormLabel>
                    </div>
                    <FormDescription className="text-xs">
                      {field.value
                        ? "Bất kỳ ai quét thẻ NFC hoặc có liên kết đều có thể xem trang hồ sơ của bạn."
                        : "Trang cá nhân tạm thời bị ẩn. Khách quét thẻ sẽ thấy thông báo trang tạm ngưng."}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility.lead_form"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border/80 p-4 bg-muted/20">
                  <div className="space-y-0.5 pr-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <FormLabel className="font-semibold text-sm">
                        Thu thập thông tin khách (Lead Capture)
                      </FormLabel>
                    </div>
                    <FormDescription className="text-xs">
                      Cho phép người quét thẻ gửi họ tên, số điện thoại hoặc email liên hệ cho bạn trên trang cá nhân.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Floating / Sticky Save Bar */}
        <div className="flex items-center justify-end gap-3 sticky bottom-18 md:bottom-4 z-20 bg-background/90 backdrop-blur p-4 rounded-xl border border-border/60 shadow-lg">
          <Button
            type="submit"
            size="lg"
            className="font-semibold px-6 shadow-xs"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi hồ sơ
          </Button>
        </div>
      </form>
    </Form>
  )
}
