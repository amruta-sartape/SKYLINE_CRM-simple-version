import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { propertyListingService, PropertyImageRecord, UploadImageInput } from '../../services/propertyListing.service';
import { useToast } from '../../context/ToastContext';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Camera,
} from 'lucide-react';

interface AdminImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    code: string;
    subtype: string;
    cover_image?: string;
    images?: PropertyImageRecord[];
  } | null;
  onSuccess: () => void;
}

export const AdminImageUploadModal: React.FC<AdminImageUploadModalProps> = ({
  isOpen,
  onClose,
  property,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<PropertyImageRecord[]>(property?.images || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('Exterior');
  const [isUploading, setIsUploading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Sync images when property changes
  React.useEffect(() => {
    if (property?.images) {
      setImages(property.images);
    }
  }, [property]);

  if (!property) return null;

  // Process files into base64 and upload
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        showToast({
          variant: 'error',
          message: `File "${file.name}" is not supported. Please upload JPG, PNG, or WEBP images.`,
        });
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast({
          variant: 'error',
          message: `File "${file.name}" exceeds 10MB limit.`,
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      const payload: UploadImageInput[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        payload.push({
          filename: file.name,
          contentType: file.type,
          base64Data: base64,
          label: `${property.title} - ${selectedCategory}`,
          category: selectedCategory,
          isCover: images.length === 0 && i === 0,
        });
      }

      const updated = await propertyListingService.uploadImages(property.id, payload);
      setImages(updated);
      showToast({
        variant: 'success',
        message: `${payload.length} image(s) uploaded successfully!`,
      });
      onSuccess();
    } catch (err: any) {
      showToast({
        variant: 'error',
        message: err.message || 'Failed to upload images.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSetCover = async (imageId: string) => {
    setIsActionLoading(true);
    try {
      await propertyListingService.setCover(property.id, imageId);
      const updated = images.map((img) => ({
        ...img,
        is_cover: img.id === imageId ? 1 : 0,
      }));
      setImages(updated);
      showToast({
        variant: 'success',
        message: 'Primary Cover Image updated.',
      });
      onSuccess();
    } catch (err: any) {
      showToast({
        variant: 'error',
        message: err.message || 'Failed to set cover image.',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to remove this property image?')) return;

    setIsActionLoading(true);
    try {
      const remaining = await propertyListingService.deleteImage(property.id, imageId);
      setImages(remaining);
      showToast({
        variant: 'success',
        message: 'Image removed successfully.',
      });
      onSuccess();
    } catch (err: any) {
      showToast({
        variant: 'error',
        message: err.message || 'Failed to delete image.',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const coverImageRecord = images.find((i) => i.is_cover === 1) || images[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Property Image Manager"
      description={`Manage Cover & Gallery Images for ${property.title} (${property.code})`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-400">
            {images.length} Image(s) Attached • Strictly Isolated to {property.code}
          </span>
          <Button variant="primary" size="sm" onClick={onClose} className="text-xs font-bold">
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-5 text-left text-xs">
        {/* 1. Upload Controls & Drag-Drop Box */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload New Photos</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-950 text-slate-200 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Exterior">Exterior</option>
                <option value="Interior">Interior</option>
                <option value="Amenities">Amenities</option>
                <option value="Entrance">Entrance</option>
                <option value="Plan">Floor Plan</option>
              </select>
            </div>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files && processFiles(e.target.files)}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-md">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">
                {isUploading ? 'Processing & Uploading...' : 'Click to Upload or Drag & Drop Images'}
              </p>
              <p className="text-[11px] text-slate-400">
                Supports JPG, PNG, WEBP up to 10MB per file
              </p>
            </div>
          </div>
        </div>

        {/* 2. Gallery & Cover Images Grid */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-400" />
              <span>Current Property Photos ({images.length})</span>
            </span>

            <span className="text-[10px] text-amber-300 font-mono">
              ★ Cover Image is highlighted with Gold Border
            </span>
          </div>

          {images.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/80 rounded-xl border border-slate-800 text-slate-400 space-y-1">
              <p className="font-bold text-slate-300">No images uploaded yet</p>
              <p className="text-[11px]">Upload at least 1 cover image and 3–6 gallery images for customer discovery.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => {
                const isCover = img.is_cover === 1 || coverImageRecord?.id === img.id;
                return (
                  <div
                    key={img.id}
                    className={`relative rounded-xl overflow-hidden border-2 bg-slate-950 flex flex-col justify-between group shadow-md transition-all ${
                      isCover
                        ? 'border-amber-400 ring-2 ring-amber-400/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative h-28 w-full overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.alt_text || img.label}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      {/* Top Badge */}
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                        {isCover ? (
                          <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase shadow-xs flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            Cover
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-slate-300 text-[9px] font-bold">
                            {img.category}
                          </span>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={isActionLoading}
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-2 flex items-center justify-between gap-1 bg-slate-950 text-[10px]">
                      <span className="truncate text-slate-300 font-medium max-w-[100px]">
                        {img.label || img.category}
                      </span>

                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(img.id)}
                          disabled={isActionLoading}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 shrink-0 cursor-pointer"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
