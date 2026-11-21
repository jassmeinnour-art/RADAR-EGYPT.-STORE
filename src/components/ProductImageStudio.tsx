import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Download,
  SlidersHorizontal,
  Columns,
  Smartphone,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Wand2,
  Maximize2,
  SunMedium,
  Contrast,
  ArrowLeftRight,
  Eraser,
} from 'lucide-react';
import JSZip from 'jszip';
import { ProductStudioThumbnailGallery } from './ProductStudioThumbnailGallery';
import { ProductStudioTemplates, type StudioDesignTemplate, STUDIO_DESIGN_TEMPLATES } from './ProductStudioTemplates';
import {
  ProductStudioSmartFilters,
  SMART_ARTISTIC_FILTERS,
  type SmartArtisticFilter,
} from './ProductStudioSmartFilters';

export interface ProductImageStudioProps {
  onShowToast?: (message: string) => void;
}

export type AspectRatioOption = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type ResolutionOption = '1K' | '2K' | '4K';
export type PreviewMode = 'result' | 'side_by_side' | 'slider' | 'social_mockup' | 'compare_two';
export type ExportFormat = 'png' | 'jpeg';

export interface DecorativeStylePreset {
  id: string;
  label: string;
  subtitle: string;
  swatchClass: string;
}

export interface SocialPlatformPreset {
  id: string;
  label: string;
  platformName: string;
  aspectRatio: AspectRatioOption;
  width: number;
  height: number;
  description: string;
}

export interface GeneratedVariation {
  id: string;
  imageUrl: string;
  originalImageUrl: string | null;
  productTitle: string;
  stylePresetId: string;
  styleLabel: string;
  artisticFilterId?: string;
  artisticFilterLabel?: string;
  platformPresetId: string;
  platformLabel: string;
  aspectRatio: AspectRatioOption;
  resolution: ResolutionOption;
  width: number;
  height: number;
  model: string;
  createdAt: string;
}

export interface UploadedBaseImage {
  id: string;
  dataUrl: string;
  fileName: string;
  mimeType: string;
  fileSizeKb: number;
  isBackgroundRemoved?: boolean;
}

export const DECORATIVE_STYLE_PRESETS: DecorativeStylePreset[] = [
  {
    id: 'luxury_marble',
    label: 'رخام فاخر وإضاءة استوديو',
    subtitle: 'منصة رخام كارارا مع إضاءة تجارية دافئة',
    swatchClass: 'from-slate-100 via-stone-200 to-amber-100',
  },
  {
    id: 'modern_cairo_living',
    label: 'ديكور منزلي عصري',
    subtitle: 'طاولة خشب طبيعي مع ضوء نهار ناعم',
    swatchClass: 'from-amber-100 via-orange-50 to-stone-200',
  },
  {
    id: 'ramadan_arabesque',
    label: 'طابع شرقي وأرابيسك',
    subtitle: 'خشب داكن ولمسات نحاسية دافئة',
    swatchClass: 'from-amber-900 via-amber-700 to-yellow-500',
  },
  {
    id: 'minimal_pastel',
    label: 'خلفية مينيمال ناعمة',
    subtitle: 'منصة هندسية بألوان رملية هادئة',
    swatchClass: 'from-rose-100 via-amber-50 to-sky-100',
  },
  {
    id: 'nature_botanical',
    label: 'حجر طبيعي وظلال نباتات',
    subtitle: 'إضاءة شمس صباحية وظلال أوراق خضراء',
    swatchClass: 'from-emerald-100 via-lime-50 to-stone-200',
  },
  {
    id: 'neon_tech',
    label: 'إضاءة تقنية عصرية',
    subtitle: 'سطح داكن بإضاءة سيان وكهرمانية للإلكترونيات',
    swatchClass: 'from-slate-900 via-cyan-900 to-amber-700',
  },
  {
    id: 'pure_commercial_white',
    label: 'خلفية بيضاء تجارية',
    subtitle: 'مطابقة لمعايير أمازون ونون وجوميا',
    swatchClass: 'from-white via-slate-50 to-slate-200',
  },
];

export const SOCIAL_PLATFORM_PRESETS: SocialPlatformPreset[] = [
  {
    id: 'instagram_post',
    label: 'بوست إنستغرام / متاجر',
    platformName: 'Instagram / Noon',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    description: 'مربع قياسي 1:1 (1080×1080)',
  },
  {
    id: 'instagram_story_reels',
    label: 'ستوري / ريلز / تيك توك',
    platformName: 'Stories & TikTok',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    description: 'طولي كامل 9:16 (1080×1920)',
  },
  {
    id: 'instagram_portrait',
    label: 'بوست إنستغرام طولي',
    platformName: 'Instagram Portrait',
    aspectRatio: '3:4',
    width: 1080,
    height: 1440,
    description: 'عمودي 3:4 (1080×1440)',
  },
  {
    id: 'facebook_post',
    label: 'منشور فيسبوك / إكس',
    platformName: 'Facebook / X',
    aspectRatio: '4:3',
    width: 1440,
    height: 1080,
    description: 'أفقي متوازن 4:3 (1440×1080)',
  },
  {
    id: 'youtube_banner',
    label: 'غلاف يوتيوب / بنر إعلاني',
    platformName: 'YouTube / Web Banner',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    description: 'عريض 16:9 (1920×1080)',
  },
];

const ASPECT_RATIO_BOX_CLASS: Record<AspectRatioOption, string> = {
  '1:1': 'aspect-square max-w-[460px]',
  '3:4': 'aspect-[3/4] max-w-[390px]',
  '4:3': 'aspect-[4/3] max-w-[520px]',
  '9:16': 'aspect-[9/16] max-w-[310px]',
  '16:9': 'aspect-video max-w-[580px]',
};

async function resizeImageForSocialPlatform(
  imageSrc: string,
  targetWidth: number,
  targetHeight: number,
  format: ExportFormat,
  brightness: number,
  contrast: number,
  extraCssFilter = ''
): Promise<string> {
  if (
    typeof document === 'undefined' ||
    typeof Image === 'undefined' ||
    (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent))
  ) {
    return imageSrc;
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallbackTimer);
      resolve(result);
    };

    const fallbackTimer = window.setTimeout(() => finish(imageSrc), 2000);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish(imageSrc);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.filter = [extraCssFilter, `brightness(${brightness}%) contrast(${contrast}%)`]
          .filter(Boolean)
          .join(' ');

        // Cover-fit the generated image neatly into exact target platform dimensions
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const offsetX = (targetWidth - drawWidth) / 2;
        const offsetY = (targetHeight - drawHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        finish(canvas.toDataURL(mime, format === 'jpeg' ? 0.94 : undefined));
      } catch {
        finish(imageSrc);
      }
    };
    img.onerror = () => finish(imageSrc);
    img.src = imageSrc;
  });
}

export const ProductImageStudio: React.FC<ProductImageStudioProps> = ({ onShowToast }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadedBaseImages, setUploadedBaseImages] = useState<UploadedBaseImage[]>([]);
  const [selectedBaseImageId, setSelectedBaseImageId] = useState<string | null>(null);
  const [useCustomBaseImage, setUseCustomBaseImage] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [productTitle, setProductTitle] = useState<string>('');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('luxury_marble');
  const [selectedArtisticFilterId, setSelectedArtisticFilterId] = useState<string>('none');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('instagram_post');
  const [resolution, setResolution] = useState<ResolutionOption>('1K');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
  const [bgRemovalProgress, setBgRemovalProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [variations, setVariations] = useState<GeneratedVariation[]>([]);
  const [activeVariationId, setActiveVariationId] = useState<string | null>(null);
  const [compareFirstId, setCompareFirstId] = useState<string | null>(null);
  const [compareSecondId, setCompareSecondId] = useState<string | null>(null);

  const [previewMode, setPreviewMode] = useState<PreviewMode>('result');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportingAll, setIsExportingAll] = useState<boolean>(false);

  const activePlatform = useMemo(
    () => SOCIAL_PLATFORM_PRESETS.find((p) => p.id === selectedPlatformId) || SOCIAL_PLATFORM_PRESETS[0],
    [selectedPlatformId]
  );

  const activeStyle = useMemo(
    () => DECORATIVE_STYLE_PRESETS.find((s) => s.id === selectedStyleId) || DECORATIVE_STYLE_PRESETS[0],
    [selectedStyleId]
  );

  const activeArtisticFilter = useMemo(
    () =>
      SMART_ARTISTIC_FILTERS.find((f) => f.id === selectedArtisticFilterId) ||
      SMART_ARTISTIC_FILTERS[0],
    [selectedArtisticFilterId]
  );

  const activeTemplate = useMemo(
    () => STUDIO_DESIGN_TEMPLATES.find((t) => t.id === selectedTemplateId) || null,
    [selectedTemplateId]
  );

  const activeVariation = useMemo(
    () => variations.find((v) => v.id === activeVariationId) || variations[0] || null,
    [variations, activeVariationId]
  );

  const activeBaseImage = useMemo(() => {
    if (!useCustomBaseImage) return null;
    return uploadedBaseImages.find((img) => img.id === selectedBaseImageId) || uploadedBaseImages[0] || null;
  }, [uploadedBaseImages, selectedBaseImageId, useCustomBaseImage]);

  const sourceImageDataUrl = activeBaseImage?.dataUrl || null;
  const sourceFileName = activeBaseImage?.fileName || '';
  const sourceMimeType = activeBaseImage?.mimeType || 'image/png';

  const compareFirstVariation = useMemo(
    () => variations.find((v) => v.id === compareFirstId) || variations[0] || null,
    [variations, compareFirstId]
  );

  const compareSecondVariation = useMemo(() => {
    const explicit = variations.find((v) => v.id === compareSecondId);
    if (explicit && explicit.id !== compareFirstVariation?.id) {
      return explicit;
    }
    return (
      variations.find((v) => v.id !== compareFirstVariation?.id) ||
      variations[1] ||
      variations[0] ||
      null
    );
  }, [variations, compareSecondId, compareFirstVariation]);

  const handleFilesSelected = useCallback(
    (fileList: FileList | File[] | null | undefined) => {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);
      setErrorMessage(null);

      let validCount = 0;
      files.forEach((file) => {
        if (!file.type.startsWith('image/')) {
          setErrorMessage('يرجى اختيار ملفات صور صالحة فقط (PNG, JPG, WEBP).');
          return;
        }
        if (file.size > 15 * 1024 * 1024) {
          setErrorMessage(`حجم الصورة "${file.name}" يتجاوز الحد الأقصى المسموح (15 ميجابايت).`);
          return;
        }

        validCount += 1;
        const reader = new FileReader();
        reader.onload = () => {
          const result = typeof reader.result === 'string' ? reader.result : null;
          if (!result) return;
          const newEntry: UploadedBaseImage = {
            id: `base_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            dataUrl: result,
            fileName: file.name,
            mimeType: file.type || 'image/png',
            fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
          };
          setUploadedBaseImages((prev) => [newEntry, ...prev].slice(0, 12));
          setSelectedBaseImageId(newEntry.id);
          setUseCustomBaseImage(true);
        };
        reader.onerror = () => {
          setErrorMessage(`تعذر قراءة ملف الصورة "${file.name}". يرجى المحاولة بصورة أخرى.`);
        };
        reader.readAsDataURL(file);
      });

      if (validCount > 0) {
        onShowToast?.(
          validCount === 1
            ? 'تم تحميل صورة منتجك من جهازك وتعيينها كقاعدة أساسية للتوليد.'
            : `تم تحميل ${validCount} صور لمنتجاتك من جهازك وتعيين أحدثها كقاعدة أساسية.`
        );
      }
    },
    [onShowToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFilesSelected(e.dataTransfer?.files);
    },
    [handleFilesSelected]
  );

  const handleRemoveBaseImage = (id: string) => {
    setUploadedBaseImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      if (selectedBaseImageId === id) {
        setSelectedBaseImageId(next[0]?.id || null);
      }
      return next;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearSourceImage = () => {
    setUseCustomBaseImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveOriginalBackground = async () => {
    if (!activeBaseImage || !sourceImageDataUrl || isRemovingBg) return;
    setErrorMessage(null);
    setIsRemovingBg(true);
    setBgRemovalProgress(0);

    try {
      const { removeBackground } = await import('@imgly/background-removal');

      // Convert Data URL cleanly to Blob without external network roundtrip
      let inputSource: Blob | string = sourceImageDataUrl;
      const match = sourceImageDataUrl.match(/^data:([^;]+);base64,(.+)$/i);
      if (match?.[2] && typeof atob === 'function') {
        const binaryStr = atob(match[2]);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i += 1) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        inputSource = new Blob([bytes], { type: match[1] || activeBaseImage.mimeType || 'image/png' });
      }

      const resultBlob = await removeBackground(inputSource, {
        output: {
          format: 'image/png',
          quality: 0.95,
        },
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            setBgRemovalProgress(Math.min(99, Math.round((current / total) * 100)));
          }
        },
      });

      const cutoutDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('تعذر قراءة الصورة المفرغة'));
          }
        };
        reader.onerror = () => reject(reader.error || new Error('فشل تحويل الصورة المفرغة'));
        reader.readAsDataURL(resultBlob);
      });

      const baseName = activeBaseImage.fileName.replace(/\.[^.]+$/, '') || 'product';
      const cutoutEntry: UploadedBaseImage = {
        id: `base_nobg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        dataUrl: cutoutDataUrl,
        fileName: `${baseName}-nobg.png`,
        mimeType: 'image/png',
        fileSizeKb: Math.max(1, Math.round(resultBlob.size / 1024)),
        isBackgroundRemoved: true,
      };

      setUploadedBaseImages((prev) => [cutoutEntry, ...prev].slice(0, 12));
      setSelectedBaseImageId(cutoutEntry.id);
      setUseCustomBaseImage(true);
      setBgRemovalProgress(100);
      onShowToast?.('تم تفريغ الخلفية الأصلية للصورة بنجاح! الصورة المفرغة جاهزة الآن للتوليد.');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? `تعذر إزالة الخلفية تلقائياً: ${err.message}`
          : 'حدث خطأ أثناء معالجة الصورة وإزالة الخلفية.';
      setErrorMessage(msg);
      onShowToast?.(msg);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleSelectArtisticFilter = (filter: SmartArtisticFilter) => {
    setSelectedArtisticFilterId(filter.id);
    if (filter.id === 'none') {
      onShowToast?.('تمت استعادة النمط القياسي الواقعي بدون فلتر فني.');
    } else {
      onShowToast?.(`تم اختيار الفلتر الذكي «${filter.label}» بنجاح.`);
    }
  };

  const handleGenerate = async (overrideArtisticFilterId?: string) => {
    setErrorMessage(null);

    if (!sourceImageDataUrl && !productTitle.trim() && !customPrompt.trim()) {
      const validationMsg = 'يرجى رفع صورة المنتج أو كتابة اسم/وصف المنتج قبل التوليد.';
      setErrorMessage(validationMsg);
      onShowToast?.(validationMsg);
      return;
    }

    const effectiveFilterId =
      typeof overrideArtisticFilterId === 'string'
        ? overrideArtisticFilterId
        : activeArtisticFilter.id;
    const effectiveFilter =
      SMART_ARTISTIC_FILTERS.find((f) => f.id === effectiveFilterId) || SMART_ARTISTIC_FILTERS[0];

    setIsGenerating(true);

    try {
      const response = await fetch('/api/product-image-studio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: sourceImageDataUrl || undefined,
          mimeType: sourceMimeType,
          productTitle: productTitle.trim(),
          stylePresetId: activeStyle.id,
          artisticFilterId: effectiveFilter.id,
          customPrompt: customPrompt.trim(),
          aspectRatio: activePlatform.aspectRatio,
          platformPresetId: activePlatform.id,
          resolution,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success || !data?.imageUrl) {
        const serverErr =
          data?.error ||
          `تعذر توليد صورة الاستوديو (رمز الحالة ${response.status}). يرجى المحاولة مرة أخرى.`;
        setErrorMessage(serverErr);
        onShowToast?.(serverErr);
        return;
      }

      const resolvedFilterId = data.artisticFilterId || effectiveFilter.id;
      const resolvedFilterObj =
        SMART_ARTISTIC_FILTERS.find((f) => f.id === resolvedFilterId) || effectiveFilter;

      const newVariation: GeneratedVariation = {
        id: `var_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        imageUrl: data.imageUrl,
        originalImageUrl: sourceImageDataUrl,
        productTitle: productTitle.trim() || 'منتج تجاري',
        stylePresetId: activeStyle.id,
        styleLabel: activeStyle.label,
        artisticFilterId: resolvedFilterId,
        artisticFilterLabel: resolvedFilterId !== 'none' ? resolvedFilterObj.label : undefined,
        platformPresetId: activePlatform.id,
        platformLabel: activePlatform.label,
        aspectRatio: (data.aspectRatio as AspectRatioOption) || activePlatform.aspectRatio,
        resolution: (data.resolution as ResolutionOption) || resolution,
        width: activePlatform.width,
        height: activePlatform.height,
        model: data.model || 'gemini-3.1-flash-lite-image',
        createdAt: new Date().toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setVariations((prev) => {
        const next = [newVariation, ...prev].slice(0, 8);
        setCompareFirstId(newVariation.id);
        setCompareSecondId(prev[0]?.id || newVariation.id);
        return next;
      });
      setActiveVariationId(newVariation.id);
      setBrightness(activeTemplate ? activeTemplate.brightness : 100);
      setContrast(activeTemplate ? activeTemplate.contrast : 100);
      setPreviewMode(sourceImageDataUrl ? 'side_by_side' : 'result');
      onShowToast?.(
        resolvedFilterId !== 'none'
          ? `تم توليد الصورة بنمط «${resolvedFilterObj.label}» بنجاح!`
          : 'تم توليد الخلفية الديكورية الاحترافية بنجاح! يمكنك معاينتها قبل التحميل.'
      );
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? `فشل الاتصال بخادم الاستوديو: ${err.message}`
          : 'حدث خطأ غير متوقع أثناء توليد الصورة.';
      setErrorMessage(errMsg);
      onShowToast?.(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyTemplate = (template: StudioDesignTemplate) => {
    setSelectedTemplateId(template.id);
    setSelectedStyleId(template.stylePresetId);
    setSelectedPlatformId(template.platformPresetId);
    setResolution(template.resolution);
    setCustomPrompt(template.lightingPrompt);
    setBrightness(template.brightness);
    setContrast(template.contrast);
    setErrorMessage(null);
    onShowToast?.(`تم تطبيق «${template.title}» (الأبعاد، الخلفية، والإضاءة) بنجاح.`);
  };

  const liveArtisticCssFilter =
    activeArtisticFilter.id !== 'none' &&
    activeVariation?.artisticFilterId !== activeArtisticFilter.id
      ? activeArtisticFilter.cssFilter
      : '';

  const downloadVariation = async (target: GeneratedVariation) => {
    setIsExporting(true);
    try {
      const isCurrent = target.id === activeVariation?.id;
      const preparedDataUrl = await resizeImageForSocialPlatform(
        target.imageUrl,
        target.width,
        target.height,
        exportFormat,
        isCurrent ? brightness : 100,
        isCurrent ? contrast : 100,
        isCurrent ? liveArtisticCssFilter : ''
      );

      const link = document.createElement('a');
      const safeSlug = (target.productTitle || 'radar-product')
        .replace(/[^\w\u0600-\u06FF-]+/g, '-')
        .slice(0, 32);
      link.href = preparedDataUrl;
      link.download = `${safeSlug}-${target.platformPresetId}-${target.width}x${target.height}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast?.(
        `تم تجهيز وتحميل الصورة بأبعاد ${target.width}×${target.height} بصيغة ${exportFormat.toUpperCase()}.`
      );
    } catch {
      onShowToast?.('تعذر تصدير الصورة حالياً.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPreviewedImage = async () => {
    if (!activeVariation) return;
    await downloadVariation(activeVariation);
  };

  const handleExportAllAsZip = async () => {
    if (variations.length === 0 || isExportingAll) return;
    setIsExportingAll(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('radar-studio-exports') || zip;

      for (let i = 0; i < variations.length; i += 1) {
        const item = variations[i];
        const isCurrent = item.id === activeVariation?.id;
        const preparedUrl = await resizeImageForSocialPlatform(
          item.imageUrl,
          item.width,
          item.height,
          exportFormat,
          isCurrent ? brightness : 100,
          isCurrent ? contrast : 100,
          isCurrent ? liveArtisticCssFilter : ''
        );

        const safeSlug =
          (item.productTitle || 'radar-product')
            .replace(/[^\w\u0600-\u06FF-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 28) || 'product';
        const fileName = `${String(i + 1).padStart(2, '0')}-${safeSlug}-${item.platformPresetId}-${item.width}x${item.height}.${exportFormat}`;

        const base64Match = preparedUrl.match(/^data:[^;]+;base64,(.+)$/i);
        if (base64Match?.[1]) {
          folder.file(fileName, base64Match[1], { base64: true });
        } else if (typeof fetch === 'function') {
          const res = await fetch(preparedUrl);
          const blob = await res.blob();
          folder.file(fileName, blob);
        }
      }

      let downloadHref = '';
      let shouldRevoke = false;

      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });
        downloadHref = URL.createObjectURL(zipBlob);
        shouldRevoke = true;
      } else {
        const zipBase64 = await zip.generateAsync({
          type: 'base64',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });
        downloadHref = `data:application/zip;base64,${zipBase64}`;
      }

      const link = document.createElement('a');
      const dateTag = new Date().toISOString().slice(0, 10);
      link.href = downloadHref;
      link.download = `radar-product-studio-${dateTag}-${variations.length}images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (shouldRevoke && typeof URL.revokeObjectURL === 'function') {
        window.setTimeout(() => URL.revokeObjectURL(downloadHref), 1500);
      }

      onShowToast?.(`تم ضغط وتصدير جميع الصور (${variations.length}) في ملف ZIP بنجاح.`);
    } catch {
      onShowToast?.('تعذر إنشاء ملف ZIP لتصدير الصور حالياً.');
    } finally {
      setIsExportingAll(false);
    }
  };

  const previewFilterStyle: React.CSSProperties = {
    filter: [liveArtisticCssFilter, `brightness(${brightness}%) contrast(${contrast}%)`]
      .filter(Boolean)
      .join(' '),
  };

  const displayedAspectClass =
    ASPECT_RATIO_BOX_CLASS[activeVariation?.aspectRatio || activePlatform.aspectRatio] ||
    'aspect-square max-w-[460px]';

  return (
    <section
      dir="rtl"
      aria-label="استوديو صور المنتجات بالذكاء الاصطناعي"
      className="w-full max-w-7xl mx-auto space-y-6 font-['Cairo']"
    >
      {/* Header Banner */}
      <header className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <span>استوديو صور المنتجات (ProductImageStudio)</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              أنشئ خلفيات ديكورية احترافية لصور منتجاتك بالذكاء الاصطناعي واضبطها بأبعاد منصات السوشيال ميديا مع معاينة كاملة قبل التحميل.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--card-border)] text-[var(--text-secondary)]">
            الأبعاد الحالية: {activePlatform.width} × {activePlatform.height}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300">
            النسبة: {activePlatform.aspectRatio}
          </span>
          {activeTemplate && (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
              الإضاءة: {activeTemplate.lightingLabel}
            </span>
          )}
          {activeArtisticFilter.id !== 'none' && (
            <span className="px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
              الفلتر الفني: {activeArtisticFilter.label}
            </span>
          )}
        </div>
      </header>

      {/* Ready-Made Design Templates Library */}
      <ProductStudioTemplates
        selectedTemplateId={selectedTemplateId}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Column: Configuration Controls (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Custom Product Base Image Upload from User Device */}
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>1. صور منتجاتي من جهازي (القاعدة الأساسية)</span>
              </h2>
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${
                  sourceImageDataUrl
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-[var(--surface-subtle)] border-[var(--card-border)] text-[var(--text-muted)]'
                }`}
              >
                {sourceImageDataUrl ? 'قاعدة: صورة منتجك الخاصة' : 'قاعدة: القوالب والوصف'}
              </span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                isDragging
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-[var(--card-border-strong)] bg-[var(--surface-subtle)] hover:border-amber-500/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                aria-label="رفع صورة المنتج"
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="sr-only"
                id="product-studio-file-input"
              />

              {sourceImageDataUrl ? (
                <div className="space-y-3 text-right">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-20 h-20 rounded-xl border border-[var(--card-border)] p-1 shrink-0 flex items-center justify-center overflow-hidden ${
                        activeBaseImage?.isBackgroundRemoved
                          ? 'bg-[repeating-conic-gradient(#cbd5e1_0%_25%,#f8fafc_0%_50%)] bg-[length:12px_12px]'
                          : 'bg-white'
                      }`}
                    >
                      <img
                        src={sourceImageDataUrl}
                        alt="صورة المنتج الأصلية"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {sourceFileName || 'صورة منتج مرفوعة'}
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {activeBaseImage?.isBackgroundRemoved
                            ? `تم تفريغ الخلفية (PNG شفاف • ${activeBaseImage.fileSizeKb} KB)`
                            : `معتمدة كقاعدة أساسية للذكاء الاصطناعي (${activeBaseImage?.fileSizeKb || 1} KB)`}
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <label
                          htmlFor="product-studio-file-input"
                          className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          تحميل صور أخرى من جهازي
                        </label>
                        <button
                          type="button"
                          onClick={handleClearSourceImage}
                          className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>إيقاف استخدام الصورة</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* One-click @imgly/background-removal cutout button */}
                  <button
                    type="button"
                    onClick={handleRemoveOriginalBackground}
                    disabled={isRemovingBg}
                    aria-label="إزالة الخلفية"
                    className="w-full py-2 px-3 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 disabled:opacity-60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isRemovingBg ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>
                          {bgRemovalProgress > 0
                            ? `جاري تفريغ الخلفية... ${bgRemovalProgress}%`
                            : 'جاري إزالة الخلفية الأصلية...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Eraser className="w-3.5 h-3.5" />
                        <span>إزالة الخلفية (تفريغ تلقائي بضغطة واحدة)</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="product-studio-file-input"
                  className="flex flex-col items-center justify-center py-3 cursor-pointer space-y-2"
                >
                  <div className="w-11 h-11 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    حمّل صور منتجاتك من جهازك كقاعدة أساسية
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    اسحب الصور هنا أو اضغط للاختيار (PNG / JPG / WEBP) للحفاظ على تفاصيل منتجك الحقيقية
                  </p>
                </label>
              )}
            </div>

            {/* Uploaded Custom Product Base Images Switcher */}
            {uploadedBaseImages.length > 0 && (
              <div className="space-y-2 rounded-xl border border-[var(--card-border)] bg-[var(--surface-subtle)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[var(--text-primary)]">
                    صور منتجاتك المرفوعة ({uploadedBaseImages.length})
                  </span>
                  {!useCustomBaseImage && (
                    <button
                      type="button"
                      onClick={() => setUseCustomBaseImage(true)}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      تفعيل الصورة كقاعدة أساسية
                    </button>
                  )}
                </div>

                <div
                  role="list"
                  aria-label="مكتبة صور منتجاتي المرفوعة"
                  className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                >
                  {uploadedBaseImages.map((img) => {
                    const isBaseActive = useCustomBaseImage && activeBaseImage?.id === img.id;
                    return (
                      <div
                        key={img.id}
                        role="listitem"
                        className={`relative rounded-lg border p-1 bg-[var(--card-bg)] transition ${
                          isBaseActive
                            ? 'border-emerald-500 ring-1 ring-emerald-500/40'
                            : 'border-[var(--card-border)] hover:border-amber-500/60'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBaseImageId(img.id);
                            setUseCustomBaseImage(true);
                          }}
                          aria-label={`تعيين كقاعدة أساسية: ${img.fileName}`}
                          aria-pressed={isBaseActive}
                          className="w-full text-right cursor-pointer focus:outline-none"
                        >
                          <img
                            src={img.dataUrl}
                            alt={img.fileName}
                            className="w-full h-14 object-contain rounded bg-white p-0.5"
                          />
                          <div className="text-[10px] font-bold text-[var(--text-primary)] truncate mt-1">
                            {img.fileName}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveBaseImage(img.id)}
                          aria-label={`حذف الصورة: ${img.fileName}`}
                          className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow hover:bg-rose-700 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="studio-product-title"
                className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
              >
                اسم المنتج أو وصفه
              </label>
              <input
                id="studio-product-title"
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="مثال: زجاجة عطر زجاجية فاخرة بغطاء ذهبي"
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3.5 py-2.5 text-sm text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 2. Decorative Backdrop Presets */}
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>2. اختيار نمط الخلفية الديكورية</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DECORATIVE_STYLE_PRESETS.map((style) => {
                const isSelected = style.id === selectedStyleId;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyleId(style.id)}
                    aria-pressed={isSelected}
                    className={`text-right rounded-xl border p-3 transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40'
                        : 'border-[var(--card-border)] bg-[var(--surface-subtle)] hover:border-[var(--card-border-strong)]'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${style.swatchClass} border border-black/10 shrink-0 mt-0.5`}
                    />
                    <span className="min-w-0">
                      <span className="block text-xs font-extrabold text-[var(--text-primary)]">
                        {style.label}
                      </span>
                      <span className="block text-[11px] text-[var(--text-muted)] leading-snug mt-0.5">
                        {style.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label
                htmlFor="studio-custom-prompt"
                className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
              >
                توجيه ديكوري إضافي (اختياري)
              </label>
              <textarea
                id="studio-custom-prompt"
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="مثال: أضف بتلات ورد بيضاء وإضاءة غروب دافئة مع مساحة فارغة أعلى الصورة للنص الإعلاني"
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3.5 py-2 text-xs text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* 3. Smart Artistic Style Filters */}
          <ProductStudioSmartFilters
            selectedFilterId={selectedArtisticFilterId}
            onSelectFilter={handleSelectArtisticFilter}
            onApplyFilterAndGenerate={() => handleGenerate(selectedArtisticFilterId)}
            hasActiveVariation={Boolean(activeVariation)}
            isCurrentVariationMatched={
              Boolean(activeVariation) &&
              activeVariation?.artisticFilterId === selectedArtisticFilterId
            }
            isGenerating={isGenerating}
          />

          {/* 4. Social Media Dimensions & Resolution */}
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-sky-500" />
              <span>4. أبعاد منصات السوشيال ميديا والدقة</span>
            </h2>

            <div className="space-y-2">
              {SOCIAL_PLATFORM_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPlatformId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPlatformId(preset.id)}
                    aria-pressed={isSelected}
                    className={`w-full text-right rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/40'
                        : 'border-[var(--card-border)] bg-[var(--surface-subtle)] hover:border-[var(--card-border-strong)]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-[var(--text-primary)]">
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {preset.description}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] shrink-0">
                      {preset.aspectRatio}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs font-bold text-[var(--text-secondary)]">جودة الإخراج:</span>
              <div className="flex items-center gap-1.5">
                {(['1K', '2K', '4K'] as ResolutionOption[]).map((resOpt) => (
                  <button
                    key={resOpt}
                    type="button"
                    onClick={() => setResolution(resOpt)}
                    aria-pressed={resolution === resOpt}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      resolution === resOpt
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--card-border)] hover:border-[var(--card-border-strong)]'
                    }`}
                  >
                    {resOpt}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-bold text-rose-600 dark:text-rose-300 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-slate-950 font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري توليد الخلفية الاحترافية...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد الخلفية بالذكاء الاصطناعي</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Left Column: Preview Stage Before Download (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm space-y-4">
            {/* Preview Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--divider-color)] pb-3.5">
              <div>
                <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-500" />
                  <span>معاينة النتيجة قبل التحميل</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  افحص التكوين وقارن بين الصورة الأصلية والمعدّلة واضبط الإضاءة قبل التصدير النهائي
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="أوضاع المعاينة">
                <button
                  type="button"
                  onClick={() => setPreviewMode('result')}
                  aria-pressed={previewMode === 'result'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition ${
                    previewMode === 'result'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--card-border)]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>النتيجة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('side_by_side')}
                  aria-pressed={previewMode === 'side_by_side'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition ${
                    previewMode === 'side_by_side'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--card-border)]'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>قبل / بعد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('slider')}
                  aria-pressed={previewMode === 'slider'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition ${
                    previewMode === 'slider'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--card-border)]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>منزلق المقارنة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('social_mockup')}
                  aria-pressed={previewMode === 'social_mockup'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition ${
                    previewMode === 'social_mockup'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--card-border)]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>إطار المنصة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('compare_two')}
                  aria-pressed={previewMode === 'compare_two'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition ${
                    previewMode === 'compare_two'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--card-border)]'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>مقارنة صورتين</span>
                </button>
              </div>
            </div>

            {/* Stage Canvas */}
            <div className="min-h-[380px] rounded-2xl border border-[var(--card-border)] bg-[var(--surface-subtle)] p-4 md:p-6 flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center space-y-3 py-12">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                    <RefreshCw className="w-7 h-7 animate-spin" />
                  </div>
                  <p className="text-sm font-extrabold text-[var(--text-primary)]">
                    يقوم الذكاء الاصطناعي ببناء الخلفية الديكورية وضبط الإضاءة...
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    الأبعاد المستهدفة: {activePlatform.label} ({activePlatform.aspectRatio})
                  </p>
                </div>
              ) : !activeVariation ? (
                <div className="text-center max-w-md space-y-3 py-10">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-amber-500 flex items-center justify-center shadow-sm">
                    <Wand2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                    مساحة المعاينة التفاعلية جاهزة
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {sourceImageDataUrl
                      ? 'صورتك الأصلية جاهزة على اليمين. اختر نمط الديكور وأبعاد السوشيال ميديا ثم اضغط توليد.'
                      : 'ارفع صورة المنتج أو اكتب وصفه، واختر أبعاد المنصة المطلوبة لتظهر المعاينة هنا قبل التحميل.'}
                  </p>
                  {sourceImageDataUrl && (
                    <div className="pt-2">
                      <img
                        src={sourceImageDataUrl}
                        alt="معاينة الصورة الأصلية قبل التوليد"
                        className="max-h-52 mx-auto rounded-xl border border-[var(--card-border)] bg-white p-2 object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {/* Result Only */}
                  {previewMode === 'result' && (
                    <div
                      className={`mx-auto w-full ${displayedAspectClass} rounded-2xl overflow-hidden border border-[var(--card-border-strong)] bg-black/5 shadow-lg relative`}
                    >
                      <img
                        src={activeVariation.imageUrl}
                        alt={`النتيجة المولدة - ${activeVariation.styleLabel}`}
                        style={previewFilterStyle}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 text-white text-[11px] font-mono font-bold">
                        {activeVariation.width} × {activeVariation.height} ({activeVariation.aspectRatio})
                      </span>
                    </div>
                  )}

                  {/* Side-by-Side Before & After */}
                  {previewMode === 'side_by_side' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-3 space-y-2">
                        <div className="text-xs font-extrabold text-[var(--text-secondary)]">
                          قبل (الأصلية)
                        </div>
                        <div className="aspect-square rounded-lg overflow-hidden bg-white border border-[var(--card-border)] flex items-center justify-center">
                          {activeVariation.originalImageUrl ? (
                            <img
                              src={activeVariation.originalImageUrl}
                              alt="الصورة الأصلية قبل المعالجة"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-[var(--text-muted)] px-4 text-center">
                              تم التوليد من الوصف النصي بدون صورة أصلية
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-emerald-500/40 bg-[var(--card-bg)] p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                          <span>بعد (خلفية الذكاء الاصطناعي)</span>
                          <span className="font-mono">{activeVariation.aspectRatio}</span>
                        </div>
                        <div
                          className={`mx-auto w-full ${displayedAspectClass} rounded-lg overflow-hidden border border-[var(--card-border)]`}
                        >
                          <img
                            src={activeVariation.imageUrl}
                            alt="النتيجة بعد إضافة الخلفية الديكورية"
                            style={previewFilterStyle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comparison Slider */}
                  {previewMode === 'slider' && (
                    <div className="space-y-3 max-w-lg mx-auto">
                      <div
                        className={`relative mx-auto w-full ${displayedAspectClass} rounded-2xl overflow-hidden border border-[var(--card-border-strong)] select-none`}
                      >
                        <img
                          src={activeVariation.imageUrl}
                          alt="بعد المعالجة"
                          style={previewFilterStyle}
                          className="w-full h-full object-cover"
                        />
                        {activeVariation.originalImageUrl && (
                          <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                          >
                            <img
                              src={activeVariation.originalImageUrl}
                              alt="قبل المعالجة"
                              className="w-full h-full object-cover bg-white"
                            />
                          </div>
                        )}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow"
                          style={{ right: `${sliderPosition}%` }}
                        />
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-950/75 text-white text-[10px] font-bold">
                          قبل
                        </span>
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-bold">
                          بعد
                        </span>
                      </div>

                      <div className="flex items-center gap-3 px-2">
                        <span className="text-xs font-bold text-[var(--text-secondary)]">نسبة المقارنة:</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={sliderPosition}
                          aria-label="منزلق مقارنة قبل وبعد"
                          onChange={(e) => setSliderPosition(Number(e.target.value))}
                          className="flex-1 accent-amber-500 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-[var(--text-primary)] w-10 text-left">
                          {sliderPosition}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Social Media Mockup Preview */}
                  {previewMode === 'social_mockup' && (
                    <div className="max-w-md mx-auto rounded-2xl border border-[var(--card-border-strong)] bg-[var(--card-bg)] shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-[var(--divider-color)] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white text-xs font-extrabold flex items-center justify-center">
                            R
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-[var(--text-primary)]">
                              RADAR Store Official
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)]">
                              {activeVariation.platformLabel} • {activeVariation.width}×{activeVariation.height}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-300">
                          {activeVariation.aspectRatio}
                        </span>
                      </div>

                      <div className={`mx-auto w-full ${displayedAspectClass} bg-slate-900 overflow-hidden`}>
                        <img
                          src={activeVariation.imageUrl}
                          alt={`معاينة منشور ${activeVariation.platformLabel}`}
                          style={previewFilterStyle}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <div className="text-xs font-extrabold text-[var(--text-primary)]">
                          {activeVariation.productTitle}
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          تصوير إعلاني بخلفية «{activeVariation.styleLabel}» جاهز للنشر على {activeVariation.platformLabel}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Two Generated Images Side-by-Side Comparison */}
                  {previewMode === 'compare_two' && (
                    <div className="space-y-4">
                      {variations.length < 2 ? (
                        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-center space-y-2">
                          <p className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                            يلزم توليد صورتين مختلفتين على الأقل للمقارنة بينهما جنباً إلى جنب قبل التصدير.
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)]">
                            جرّب اختيار نمط خلفية ديكورية أو أبعاد منصة أخرى واضغط «توليد الخلفية بالذكاء الاصطناعي» لإضافة الصورة الثانية.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Controls to pick Image A vs Image B and swap */}
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2.5 items-end rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-3">
                            <label className="block space-y-1">
                              <span className="block text-[11px] font-extrabold text-[var(--text-secondary)]">
                                الصورة الأولى (أ)
                              </span>
                              <select
                                aria-label="اختيار الصورة الأولى للمقارنة"
                                value={compareFirstVariation?.id || ''}
                                onChange={(e) => setCompareFirstId(e.target.value)}
                                className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-2.5 py-1.5 text-xs font-bold text-[var(--input-text)] focus:outline-none focus:border-amber-500"
                              >
                                {variations.map((v, index) => (
                                  <option key={v.id} value={v.id}>
                                    #{variations.length - index} — {v.styleLabel} ({v.aspectRatio} • {v.createdAt})
                                  </option>
                                ))}
                              </select>
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                const left = compareFirstVariation?.id || null;
                                const right = compareSecondVariation?.id || null;
                                setCompareFirstId(right);
                                setCompareSecondId(left);
                              }}
                              aria-label="تبديل موضعي الصورتين"
                              title="تبديل موضعي الصورتين"
                              className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--surface-subtle)] hover:border-amber-500 text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-1 cursor-pointer h-[34px]"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-500" />
                              <span>تبديل</span>
                            </button>

                            <label className="block space-y-1">
                              <span className="block text-[11px] font-extrabold text-[var(--text-secondary)]">
                                الصورة الثانية (ب)
                              </span>
                              <select
                                aria-label="اختيار الصورة الثانية للمقارنة"
                                value={compareSecondVariation?.id || ''}
                                onChange={(e) => setCompareSecondId(e.target.value)}
                                className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-2.5 py-1.5 text-xs font-bold text-[var(--input-text)] focus:outline-none focus:border-amber-500"
                              >
                                {variations.map((v, index) => (
                                  <option key={v.id} value={v.id}>
                                    #{variations.length - index} — {v.styleLabel} ({v.aspectRatio} • {v.createdAt})
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>

                          {/* Side-by-Side Cards */}
                          <div
                            aria-label="مقارنة صورتين مولدتين جنباً إلى جنب"
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start"
                          >
                            {[
                              { slotLabel: 'الصورة الأولى (أ)', item: compareFirstVariation },
                              { slotLabel: 'الصورة الثانية (ب)', item: compareSecondVariation },
                            ].map(({ slotLabel, item }) => {
                              if (!item) return null;
                              const isSelectedForExport = item.id === activeVariation?.id;
                              const slotAspectClass =
                                ASPECT_RATIO_BOX_CLASS[item.aspectRatio] || 'aspect-square max-w-[460px]';
                              return (
                                <div
                                  key={`${slotLabel}-${item.id}`}
                                  className={`rounded-xl border p-3 bg-[var(--card-bg)] space-y-2.5 transition ${
                                    isSelectedForExport
                                      ? 'border-emerald-500 ring-1 ring-emerald-500/40'
                                      : 'border-[var(--card-border)]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-extrabold text-[var(--text-primary)]">
                                      {slotLabel}: {item.styleLabel}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-[var(--surface-subtle)] border border-[var(--card-border)] text-[10px] font-mono font-bold text-[var(--text-secondary)]">
                                      {item.width}×{item.height}
                                    </span>
                                  </div>

                                  <div
                                    className={`mx-auto w-full ${slotAspectClass} rounded-lg overflow-hidden border border-[var(--card-border)] bg-black/5`}
                                  >
                                    <img
                                      src={item.imageUrl}
                                      alt={`${slotLabel} - ${item.styleLabel}`}
                                      style={previewFilterStyle}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                                    <span className="text-[var(--text-muted)] truncate">
                                      {item.platformLabel} • {item.resolution}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setActiveVariationId(item.id)}
                                        className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer transition ${
                                          isSelectedForExport
                                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                                            : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--card-border)] hover:border-amber-500'
                                        }`}
                                      >
                                        {isSelectedForExport ? 'معتمدة للتصدير' : 'اعتماد'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => downloadVariation(item)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                                      >
                                        <Download className="w-3 h-3" />
                                        <span>تصدير</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Post-Generation Finish & Export Bar */}
            {activeVariation && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-subtle)] p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block space-y-1">
                    <span className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                        <span>السطوع</span>
                      </span>
                      <span className="font-mono">{brightness}%</span>
                    </span>
                    <input
                      type="range"
                      min={75}
                      max={125}
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <Contrast className="w-3.5 h-3.5 text-sky-500" />
                        <span>التباين</span>
                      </span>
                      <span className="font-mono">{contrast}%</span>
                    </span>
                    <input
                      type="range"
                      min={75}
                      max={125}
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[var(--divider-color)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">صيغة التحميل:</span>
                    {(['png', 'jpeg'] as ExportFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setExportFormat(fmt)}
                        aria-pressed={exportFormat === fmt}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase border cursor-pointer ${
                          exportFormat === fmt
                            ? 'bg-sky-500 text-white border-sky-500'
                            : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--card-border)]'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPreviewedImage}
                    disabled={isExporting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm shadow transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isExporting
                        ? 'جاري تجهيز الأبعاد...'
                        : `تحميل الصورة (${activeVariation.width}×${activeVariation.height})`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery ('معرض مصغر') below Preview Area */}
          <ProductStudioThumbnailGallery
            variations={variations}
            activeVariationId={activeVariation?.id || null}
            onSelectVariation={setActiveVariationId}
            onExportAll={handleExportAllAsZip}
            isExportingAll={isExportingAll}
            onDownloadVariation={downloadVariation}
            previewFilterStyle={previewFilterStyle}
          />
        </div>
      </div>
    </section>
  );
};

export default ProductImageStudio;
