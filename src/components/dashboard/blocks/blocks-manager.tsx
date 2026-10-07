'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Database } from '@/types/database.types';
import {
  createBlockAction,
  updateBlockAction,
  toggleBlockActiveAction,
  deleteBlockAction,
  reorderBlocksAction,
} from '@/actions/blocks';
import {
  extractYouTubeId,
  formatGoogleMapsEmbedUrl,
  BlockType,
} from '@/lib/validations/blocks';
import { toast } from 'sonner';
import { YoutubeIcon } from '@/components/platform-icon';
import {
  Plus,
  MapPin,
  FileText,
  ImageIcon,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type BlockRow = Database['public']['Tables']['blocks']['Row'];

interface BlocksManagerProps {
  initialBlocks: BlockRow[];
  username?: string | null;
}

export function BlocksManager({ initialBlocks, username }: BlocksManagerProps) {
  const [blocks, setBlocks] = useState<BlockRow[]>(initialBlocks);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockRow | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states cho Modal thêm/sửa
  const [activeTab, setActiveTab] = useState<BlockType>('youtube');
  const [title, setTitle] = useState('');
  // YouTube states
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeCaption, setYoutubeCaption] = useState('');
  // Map states
  const [mapAddress, setMapAddress] = useState('');
  const [mapPlaceName, setMapPlaceName] = useState('');
  // Text states
  const [textBody, setTextBody] = useState('');
  const [textStyle, setTextStyle] = useState<'card' | 'quote' | 'alert' | 'plain'>('card');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  // Image states
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageLinkUrl, setImageLinkUrl] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState<'auto' | '16/9' | '4/3' | '1/1'>('auto');

  // Mở modal thêm mới
  const handleOpenAdd = () => {
    setTitle('');
    setYoutubeUrl('');
    setYoutubeCaption('');
    setMapAddress('');
    setMapPlaceName('');
    setTextBody('');
    setTextStyle('card');
    setTextAlign('left');
    setImageUrl('');
    setImageCaption('');
    setImageLinkUrl('');
    setImageAspectRatio('auto');
    setActiveTab('youtube');
    setIsAddOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEdit = (block: BlockRow) => {
    setEditingBlock(block);
    setActiveTab(block.type as BlockType);
    setTitle(block.title || '');

    const content = (block.content as Record<string, unknown>) || {};
    if (block.type === 'youtube') {
      setYoutubeUrl(typeof content.url === 'string' ? content.url : '');
      setYoutubeCaption(typeof content.caption === 'string' ? content.caption : '');
    } else if (block.type === 'map') {
      setMapAddress(typeof content.address === 'string' ? content.address : '');
      setMapPlaceName(typeof content.placeName === 'string' ? content.placeName : '');
    } else if (block.type === 'text') {
      setTextBody(typeof content.body === 'string' ? content.body : '');
      setTextStyle((content.style as 'card' | 'quote' | 'alert' | 'plain') || 'card');
      setTextAlign((content.align as 'left' | 'center' | 'right') || 'left');
    } else if (block.type === 'image') {
      setImageUrl(typeof content.imageUrl === 'string' ? content.imageUrl : '');
      setImageCaption(typeof content.caption === 'string' ? content.caption : '');
      setImageLinkUrl(typeof content.linkUrl === 'string' ? content.linkUrl : '');
      setImageAspectRatio((content.aspectRatio as 'auto' | '16/9' | '4/3' | '1/1') || 'auto');
    }
  };

  // Lưu tạo mới hoặc cập nhật
  const handleSaveBlock = async () => {
    try {
      setLoading(true);

      let contentPayload: Record<string, unknown> = {};

      if (activeTab === 'youtube') {
        const videoId = extractYouTubeId(youtubeUrl);
        if (!videoId) {
          toast.error('Đường dẫn YouTube không hợp lệ hoặc không tìm thấy Video ID.');
          setLoading(false);
          return;
        }
        contentPayload = {
          url: youtubeUrl.trim(),
          videoId,
          caption: youtubeCaption.trim() || undefined,
        };
      } else if (activeTab === 'map') {
        if (!mapAddress.trim()) {
          toast.error('Vui lòng nhập địa chỉ bản đồ.');
          setLoading(false);
          return;
        }
        const embedUrl = formatGoogleMapsEmbedUrl(mapAddress);
        contentPayload = {
          address: mapAddress.trim(),
          embedUrl,
          placeName: mapPlaceName.trim() || undefined,
        };
      } else if (activeTab === 'text') {
        if (!textBody.trim()) {
          toast.error('Vui lòng nhập nội dung văn bản.');
          setLoading(false);
          return;
        }
        contentPayload = {
          body: textBody.trim(),
          style: textStyle,
          align: textAlign,
        };
      } else if (activeTab === 'image') {
        if (!imageUrl.trim()) {
          toast.error('Vui lòng nhập đường dẫn hình ảnh.');
          setLoading(false);
          return;
        }
        contentPayload = {
          imageUrl: imageUrl.trim(),
          caption: imageCaption.trim() || undefined,
          linkUrl: imageLinkUrl.trim() || undefined,
          aspectRatio: imageAspectRatio,
        };
      }

      if (editingBlock) {
        // Cập nhật
        const res = await updateBlockAction({
          id: editingBlock.id,
          title: title.trim() || null,
          content: contentPayload,
        });

        if (!res.success) {
          toast.error(res.error || 'Lỗi khi cập nhật khối nội dung.');
          return;
        }

        setBlocks((prev) =>
          prev.map((b) =>
            b.id === editingBlock.id
              ? {
                  ...b,
                  title: title.trim() || null,
                  content: contentPayload as Database['public']['Tables']['blocks']['Row']['content'],
                  updated_at: new Date().toISOString(),
                }
              : b
          )
        );
        toast.success('Đã cập nhật khối nội dung thành công!');
        setEditingBlock(null);
      } else {
        // Tạo mới
        const res = await createBlockAction({
          type: activeTab,
          title: title.trim() || null,
          content: contentPayload,
          is_active: true,
        });

        if (!res.success || !res.data) {
          toast.error(res.error || 'Lỗi khi tạo khối nội dung.');
          return;
        }

        setBlocks((prev) => [...prev, res.data as BlockRow]);
        toast.success('Đã thêm khối nội dung mới!');
        setIsAddOpen(false);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Bật/tắt hiển thị
  const handleToggleActive = async (id: string, currentState: boolean) => {
    const nextState = !currentState;
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_active: nextState } : b))
    );

    const res = await toggleBlockActiveAction(id, nextState);
    if (!res.success) {
      // Rollback
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, is_active: currentState } : b))
      );
      toast.error(res.error || 'Không thể thay đổi trạng thái.');
    } else {
      toast.success(nextState ? 'Đã bật hiển thị khối.' : 'Đã ẩn khối.');
    }
  };

  // Xóa khối
  const handleDeleteBlock = async (id: string) => {
    try {
      setLoading(true);
      const res = await deleteBlockAction(id);
      if (!res.success) {
        toast.error(res.error || 'Lỗi khi xóa khối nội dung.');
        return;
      }

      setBlocks((prev) => prev.filter((b) => b.id !== id));
      toast.success('Đã xóa khối nội dung thành công.');
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Di chuyển vị trí Lên/Xuống
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    // Cập nhật state trước
    setBlocks(newBlocks);

    const orderedIds = newBlocks.map((b) => b.id);
    const res = await reorderBlocksAction(orderedIds);
    if (!res.success) {
      // Rollback nếu lỗi
      setBlocks(blocks);
      toast.error('Lỗi khi sắp xếp lại vị trí.');
    } else {
      toast.success('Đã thay đổi thứ tự.');
    }
  };

  // Trích xuất preview ID youtube khi gõ
  const previewYouTubeId = extractYouTubeId(youtubeUrl);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-card border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Khối nội dung phong phú
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Làm nổi bật trang cá nhân của bạn với video YouTube, bản đồ địa chỉ, ghi chú văn bản và hình ảnh tương tác.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {username && (
            <Link
              href={`/u/${username}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-background hover:bg-muted text-foreground transition-colors shadow-xs"
            >
              <span>Xem trang công khai</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Thêm khối mới</span>
          </Button>
        </div>
      </div>

      {/* Danh sách các khối */}
      {blocks.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border bg-card/50 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Chưa có khối nội dung nào</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Hãy thêm video bài hát yêu thích, giới thiệu sản phẩm YouTube, bản đồ văn phòng hoặc một ghi chú ngắn để trang NFC của bạn trở nên ấn tượng hơn!
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Thêm khối đầu tiên</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => {
            const content = (block.content as Record<string, unknown>) || {};

            return (
              <div
                key={block.id}
                className={`p-4 rounded-xl border bg-card transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !block.is_active ? 'opacity-60 bg-muted/30' : 'hover:border-primary/40 hover:shadow-sm'
                }`}
              >
                {/* Thông tin khối */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Icon loại */}
                  <div className="pt-0.5">
                    {block.type === 'youtube' && (
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
                        <YoutubeIcon className="w-5 h-5" />
                      </div>
                    )}
                    {block.type === 'map' && (
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                    )}
                    {block.type === 'text' && (
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    {block.type === 'image' && (
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base truncate">
                        {block.title ||
                          (block.type === 'youtube'
                            ? 'Video YouTube'
                            : block.type === 'map'
                            ? 'Bản đồ vị trí'
                            : block.type === 'text'
                            ? 'Ghi chú văn bản'
                            : 'Hình ảnh / Banner')}
                      </span>
                      <Badge variant="secondary" className="text-[11px] font-normal uppercase">
                        {block.type}
                      </Badge>
                      {!block.is_active && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Đang ẩn
                        </Badge>
                      )}
                    </div>

                    {/* Chi tiết nội dung tóm tắt */}
                    <div className="text-xs text-muted-foreground truncate max-w-md">
                      {block.type === 'youtube' && (
                        <span>ID: {String(content.videoId || 'Chưa có ID')} • {String(content.caption || content.url || '')}</span>
                      )}
                      {block.type === 'map' && (
                        <span>{content.placeName ? `${String(content.placeName)}: ` : ''}{String(content.address || 'Chưa có địa chỉ')}</span>
                      )}
                      {block.type === 'text' && (
                        <span>{content.body ? String(content.body).slice(0, 80) : 'Chưa có văn bản'}</span>
                      )}
                      {block.type === 'image' && (
                        <span>{content.caption ? `${String(content.caption)} • ` : ''}{String(content.imageUrl || '')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Các nút thao tác */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Nút di chuyển vị trí */}
                  <div className="flex items-center border rounded-lg overflow-hidden bg-background">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      title="Di chuyển lên"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none border-l"
                      disabled={index === blocks.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      title="Di chuyển xuống"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Bật / Tắt hiển thị */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleActive(block.id, block.is_active)}
                    title={block.is_active ? 'Ẩn khối' : 'Hiện khối'}
                  >
                    {block.is_active ? (
                      <Eye className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>

                  {/* Nút sửa */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenEdit(block)}
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>

                  {/* Nút xóa */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    onClick={() => setDeleteConfirmId(block.id)}
                    title="Xóa khối"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm Mới / Chỉnh Sửa Khối */}
      <Dialog
        open={isAddOpen || !!editingBlock}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingBlock(null);
          }
        }}
      >
        <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>{editingBlock ? 'Chỉnh sửa khối nội dung' : 'Thêm khối nội dung mới'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingBlock
                ? 'Cập nhật lại các thông tin của khối hiển thị trên trang cá nhân.'
                : 'Chọn loại nội dung phong phú bạn muốn hiển thị trên trang NFC.'}
            </DialogDescription>
          </DialogHeader>

          {/* Chọn Tab loại khối (chỉ hiện khi tạo mới) */}
          {!editingBlock && (
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('youtube')}
                className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'youtube'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <YoutubeIcon className="w-4 h-4 text-red-500" />
                <span>YouTube</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'map'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Bản đồ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'text'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Văn bản</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('image')}
                className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  activeTab === 'image'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span>Hình ảnh</span>
              </button>
            </div>
          )}

          <div className="space-y-4 py-2">
            {/* Tiêu đề chung */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Tiêu đề khối (tùy chọn)</label>
              <Input
                placeholder="VD: Video giới thiệu, Địa chỉ công ty, Thông báo quan trọng..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* FORM YOUTUBE */}
            {activeTab === 'youtube' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Đường dẫn YouTube *</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Hỗ trợ shorts, watch, youtu.be</span>
                  </label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                </div>

                {previewYouTubeId && (
                  <div className="p-2.5 rounded-xl border bg-muted/40 space-y-2">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã nhận diện Video ID: {previewYouTubeId}</span>
                    </span>
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black/10">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${previewYouTubeId}`}
                        title="Preview"
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Mô tả hoặc chú thích (tùy chọn)</label>
                  <Input
                    placeholder="VD: Xem MV mới nhất của tôi trên YouTube"
                    value={youtubeCaption}
                    onChange={(e) => setYoutubeCaption(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* FORM GOOGLE MAPS */}
            {activeTab === 'map' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Địa chỉ hoặc tọa độ *</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Tự động tạo bản đồ nhúng</span>
                  </label>
                  <Input
                    placeholder="VD: Landmark 81, Bình Thạnh, TP. Hồ Chí Minh"
                    value={mapAddress}
                    onChange={(e) => setMapAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Tên địa điểm / Tòa nhà</label>
                  <Input
                    placeholder="VD: Văn phòng chính, Chi nhánh Hà Nội..."
                    value={mapPlaceName}
                    onChange={(e) => setMapPlaceName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* FORM VĂN BẢN / GHI CHÚ */}
            {activeTab === 'text' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Nội dung văn bản *</label>
                  <Textarea
                    placeholder="Nhập nội dung chia sẻ, trích dẫn, giới thiệu bản thân hoặc thông báo..."
                    rows={4}
                    value={textBody}
                    onChange={(e) => setTextBody(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Kiểu hiển thị</label>
                    <select
                      value={textStyle}
                      onChange={(e) => setTextStyle(e.target.value as 'card' | 'quote' | 'alert' | 'plain')}
                      className="w-full h-9 rounded-md border bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                    >
                      <option value="card">Thẻ sang trọng (Card)</option>
                      <option value="quote">Trích dẫn danh ngôn (Quote)</option>
                      <option value="alert">Thông báo nổi bật (Alert)</option>
                      <option value="plain">Văn bản thuần (Plain)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Căn lề chữ</label>
                    <div className="flex rounded-md border p-0.5 bg-muted">
                      <button
                        type="button"
                        onClick={() => setTextAlign('left')}
                        className={`flex-1 py-1.5 flex items-center justify-center rounded text-xs transition-colors ${
                          textAlign === 'left' ? 'bg-background shadow-xs font-semibold' : 'text-muted-foreground'
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextAlign('center')}
                        className={`flex-1 py-1.5 flex items-center justify-center rounded text-xs transition-colors ${
                          textAlign === 'center' ? 'bg-background shadow-xs font-semibold' : 'text-muted-foreground'
                        }`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextAlign('right')}
                        className={`flex-1 py-1.5 flex items-center justify-center rounded text-xs transition-colors ${
                          textAlign === 'right' ? 'bg-background shadow-xs font-semibold' : 'text-muted-foreground'
                        }`}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORM HÌNH ẢNH */}
            {activeTab === 'image' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Đường dẫn hình ảnh (URL) *</label>
                  <Input
                    placeholder="https://images.unsplash.com/... hoặc link ảnh bất kỳ"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                {imageUrl && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {}}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Chú thích ảnh (tùy chọn)</label>
                    <Input
                      placeholder="VD: Khoảnh khắc khai trương chi nhánh mới"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Tỉ lệ khung hình</label>
                    <select
                      value={imageAspectRatio}
                      onChange={(e) => setImageAspectRatio(e.target.value as 'auto' | '16/9' | '4/3' | '1/1')}
                      className="w-full h-9 rounded-md border bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                    >
                      <option value="auto">Tự động (Auto)</option>
                      <option value="16/9">Khung ngang 16:9</option>
                      <option value="4/3">Khung 4:3</option>
                      <option value="1/1">Khung vuông 1:1</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Liên kết khi bấm vào ảnh (tùy chọn)</label>
                  <Input
                    placeholder="https://..."
                    value={imageLinkUrl}
                    onChange={(e) => setImageLinkUrl(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingBlock(null);
              }}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveBlock} disabled={loading} className="gap-1.5">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingBlock ? 'Lưu thay đổi' : 'Thêm vào trang'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Xác nhận xóa khối nội dung</span>
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa khối nội dung này? Thao tác này không thể hoàn tác và khối sẽ lập tức biến mất khỏi trang cá nhân của bạn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              disabled={loading}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteBlock(deleteConfirmId)}
              disabled={loading}
              className="gap-1.5"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Xóa vĩnh viễn</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
