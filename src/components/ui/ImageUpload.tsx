import { ImageIcon, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

interface ImageUploadProps {
  label?: string;
  error?: string;
  currentImage?: string;
  onChange: (file: File | null) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  error,
  currentImage,
  onChange,
  className,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Ukuran file terlalu besar. Maksimal 2 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      {label && <label className="label">{label}</label>}
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors',
          error ? 'border-red-400' : 'border-gray-300',
          preview && 'border-solid border-gray-200'
        )}
        onClick={() => !preview && inputRef.current?.click()}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 max-w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <ImageIcon className="h-10 w-10 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500">
              Klik untuk upload gambar
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, JPEG maks 2MB
            </p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUpload;
