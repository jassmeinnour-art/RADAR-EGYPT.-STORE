import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Sun, 
  Contrast, 
  Layers, 
  RotateCw, 
  Maximize2,
  Tag,
  Store,
  Share2,
  AlertCircle,
  Download,
  Sliders,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  X,
  Plus,
  Trash2,
  Copy,
  Grid,
  Check,
  Zap,
  Info,
  Box,
  Wand2,
  Image as ImageIcon,
  Compass,
  Move,
  ZoomIn,
  Flame,
  Palette,
  Layout,
  ExternalLink,
  Shield,
  Truck,
  Smartphone,
  ShoppingBag,
  Award,
  ChevronDown,
  ChevronUp,
  Percent,
  Coins,
  Target,
  BarChart3,
  Scale,
  Cloud,
  Save,
  FolderOpen,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductImageABTesting } from './ProductImageABTesting';
import { useAuth } from '../context/AuthContext';
import { 
  saveStudioDesignToCloud, 
  fetchStudioDesignsFromCloud, 
  deleteStudioDesignFromCloud,
  SavedStudioDesign 
} from '../services/firestoreSync';

import { 
  ProductData, 
  PlatformAspectRatio, 
  ProductAngleType, 
  DecorativeBackgroundId, 
  ProductFeatureCallout,
  SocialMediaFrameId,
  SocialMediaFrameConfig
} from '../types';
import { 
  PLATFORM_ASPECT_RATIOS, 
  ANGLE_PRESETS, 
  DECORATIVE_BACKGROUNDS, 
  DEFAULT_FEATURE_CALLOUTS,
  SOCIAL_MEDIA_FRAMES,
  StudioBackgroundPreset,
  AnglePresetConfig,
  PlatformRatioConfig
} from '../data/studioPresets';

interface MerchantImageStudioProps {
  product?: ProductData | null;
  currency: string;
  winningPrice: number;
  selectedDiscount: number;
  onApplyWinningImage?: (imageUrl: string) => void;
}

export const MerchantImageStudio: React.FC<MerchantImageStudioProps> = ({
  product,
  currency,
  winningPrice,
  selectedDiscount,
  onApplyWinningImage,
}) => {
  // Top Level Mode: 3D Studio vs A/B Testing Lab
  const [activeStudioTab, setActiveStudioTab] = useState<'3d_studio' | 'ab_testing'>('3d_studio');

  // Active Image Source (Product Default, Camera Snapshot, or Uploaded File)
  const defaultImage = product?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
  const [activeImageSrc, setActiveImageSrc] = useState<string>(defaultImage);
  const [imageSourceType, setImageSourceType] = useState<'product_default' | 'camera_snapshot' | 'user_upload'>('product_default');

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Aspect Ratio & Platform Dimensions
  const [selectedRatio, setSelectedRatio] = useState<PlatformAspectRatio>('1:1');
  const [showSafeZoneGrid, setShowSafeZoneGrid] = useState<boolean>(true);

  // Multi-Angle & 3D Perspective State
  const [selectedAngle, setSelectedAngle] = useState<ProductAngleType>('front_hero');
  const [rotationY, setRotationY] = useState<number>(0); // -45 to +45
  const [rotationX, setRotationX] = useState<number>(0); // -30 to +30
  const [rotationZ, setRotationZ] = useState<number>(0); // -180 to 180
  const [zoomScale, setZoomScale] = useState<number>(1.0); // 0.5 to 2.2
  const [panX, setPanX] = useState<number>(0); // -100 to 100
  const [panY, setPanY] = useState<number>(0); // -100 to 100
  const [shadowIntensity, setShadowIntensity] = useState<number>(50); // 0 to 100
  const [showPedestal, setShowPedestal] = useState<boolean>(false);

  // Background Theme
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<DecorativeBackgroundId>('pure_white');
  const [activeBgTab, setActiveBgTab] = useState<'all' | 'ecommerce_compliance' | 'luxury_studio' | 'lifestyle_home' | 'social_creative'>('all');

  // Color & Studio Lighting
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [warmth, setWarmth] = useState<number>(0); // -20 to +20
  const [saturation, setSaturation] = useState<number>(100);

  // AI Lighting & Contrast Optimization for Scanned Product Images
  const [isAiEnhanceActive, setIsAiEnhanceActive] = useState<boolean>(false);
  const [aiLightingPreset, setAiLightingPreset] = useState<'none' | 'studio_white' | 'hdr_dynamic' | 'shadow_lift' | 'vibrant_ecommerce'>('none');
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);
  const [aiEnhanceFeedback, setAiEnhanceFeedback] = useState<string | null>(null);

  const AI_LIGHTING_PRESETS = [
    {
      id: 'studio_white' as const,
      nameAr: 'إضاءة استوديو بيضاء',
      badge: 'معتمد أمازون ونون',
      description: 'يزيل بهتان ورمادية المسح الضوئي ويضبط خلفية نقية عالية السطوع',
      brightness: 114,
      contrast: 118,
      saturation: 106,
      icon: '✨'
    },
    {
      id: 'hdr_dynamic' as const,
      nameAr: 'تباين ديناميكي فائق HDR',
      badge: 'تفاصيل الخامات والأزرار',
      description: 'يبرز أدق ملامح وتفاصيل أسطح المنتج الممسوح ضوئياً بحدة استثنائية',
      brightness: 108,
      contrast: 126,
      saturation: 112,
      icon: '⚡'
    },
    {
      id: 'shadow_lift' as const,
      nameAr: 'إزالة ظلال المسح الضوئي',
      badge: 'تفتيح المعتمات',
      description: 'يفتح المناطق الداكنة والمعتمة الناتجة عن رداءة الفلاش أو زوايا المسح',
      brightness: 122,
      contrast: 112,
      saturation: 102,
      icon: '💡'
    },
    {
      id: 'vibrant_ecommerce' as const,
      nameAr: 'ألوان حيوية لمنصات البيع',
      badge: 'سوشيال شوب وتطبيقات',
      description: 'يعزز تشبع وجاذبية الألوان الحقيقية للعين لمنصات إنستجرام وجوميا',
      brightness: 110,
      contrast: 116,
      saturation: 128,
      icon: '🎨'
    }
  ];

  const handleApplyAiEnhance = (presetId: 'studio_white' | 'hdr_dynamic' | 'shadow_lift' | 'vibrant_ecommerce' = 'studio_white') => {
    const preset = AI_LIGHTING_PRESETS.find(p => p.id === presetId) || AI_LIGHTING_PRESETS[0];
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setIsAiEnhanceActive(true);
    setAiLightingPreset(preset.id);
    setAiEnhanceFeedback(`تم تحسين الإضاءة والتباين بالذكاء الاصطناعي بنمط [${preset.nameAr}]! ✨`);
    setTimeout(() => setAiEnhanceFeedback(null), 3500);
  };

  const handleResetLighting = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setIsAiEnhanceActive(false);
    setAiLightingPreset('none');
    setShowBeforeAfter(false);
    setAiEnhanceFeedback('تمت استعادة الإضاءة والتباين الأصلي للصورة.');
    setTimeout(() => setAiEnhanceFeedback(null), 3000);
  };

  // Badges & Marketing Overlays
  const [showPriceBadge, setShowPriceBadge] = useState<boolean>(false);
  const [showDiscountBadge, setShowDiscountBadge] = useState<boolean>(false);
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [merchantWatermarkText, setMerchantWatermarkText] = useState<string>('متجر التاجر المصري المعتمد 🇪🇬');
  const [showWarrantyBadge, setShowWarrantyBadge] = useState<boolean>(false);
  const [showShippingBadge, setShowShippingBadge] = useState<boolean>(false);

  // Social Media Frame / Template State
  const [selectedFrameId, setSelectedFrameId] = useState<SocialMediaFrameId>('none');
  const [frameBadgeText, setFrameBadgeText] = useState<string>('🔥 أقوى سعر بيع متاح بمصر 🇪🇬');
  const [frameProductTitle, setFrameProductTitle] = useState<string>(product?.title || '');
  const [frameSellingPrice, setFrameSellingPrice] = useState<number>(winningPrice || product?.targetPrice || 0);
  const [frameOriginalPrice, setFrameOriginalPrice] = useState<number>(
    selectedDiscount > 0
      ? Math.round((winningPrice || product?.targetPrice || 1000) / (1 - selectedDiscount / 100))
      : Math.round((winningPrice || product?.targetPrice || 1000) * 1.25)
  );
  const [frameTaglineText, setFrameTaglineText] = useState<string>('اطلب الآن • شحن سريع حتى باب المنزل • الدفع عند الاستلام 📦');
  const [frameStoreName, setFrameStoreName] = useState<string>('متجر التاجر المصري المعتمد 🇪🇬');
  const [showFramePrice, setShowFramePrice] = useState<boolean>(true);
  const [showFrameTitle, setShowFrameTitle] = useState<boolean>(true);
  const [showFrameBadge, setShowFrameBadge] = useState<boolean>(true);
  const [showFrameTagline, setShowFrameTagline] = useState<boolean>(true);
  const [showFrameOriginalPrice, setShowFrameOriginalPrice] = useState<boolean>(true);
  const [isFrameCustomizeOpen, setIsFrameCustomizeOpen] = useState<boolean>(true);

  // Feature Callouts
  const [showCallouts, setShowCallouts] = useState<boolean>(false);
  const [featureCallouts, setFeatureCallouts] = useState<ProductFeatureCallout[]>(DEFAULT_FEATURE_CALLOUTS);
  const [newCalloutText, setNewCalloutText] = useState<string>('');

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgressText, setExportProgressText] = useState<string>('');
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);

  // Canvas / Preview references
  const studioPreviewRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cloud Database & User Context
  const { user, profile } = useAuth();
  const [isCloudGalleryOpen, setIsCloudGalleryOpen] = useState<boolean>(false);
  const [cloudSavedDesigns, setCloudSavedDesigns] = useState<SavedStudioDesign[]>([]);
  const [isLoadingCloudDesigns, setIsLoadingCloudDesigns] = useState<boolean>(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState<boolean>(false);
  const [cloudSaveMessage, setCloudSaveMessage] = useState<string | null>(null);

  // AI Studio Backdrop Generator States
  const [isAiBackdropModalOpen, setIsAiBackdropModalOpen] = useState<boolean>(false);
  const [aiBackdropPrompt, setAiBackdropPrompt] = useState<string>('');
  const [aiBackdropPreset, setAiBackdropPreset] = useState<string>('luxury_marble');
  const [isGeneratingAiBackdrop, setIsGeneratingAiBackdrop] = useState<boolean>(false);
  const [aiBackdropResult, setAiBackdropResult] = useState<any>(null);

  // AI Image Retouch & Intelligent Editing States
  const [isAiRetouchModalOpen, setIsAiRetouchModalOpen] = useState<boolean>(false);
  const [aiRetouchInstruction, setAiRetouchInstruction] = useState<string>('');
  const [isApplyingAiRetouch, setIsApplyingAiRetouch] = useState<boolean>(false);
  const [aiRetouchFeedback, setAiRetouchFeedback] = useState<string | null>(null);

  // Current Preset Objects
  const currentRatioConfig = useMemo(() => {
    return PLATFORM_ASPECT_RATIOS.find(r => r.id === selectedRatio) || PLATFORM_ASPECT_RATIOS[0];
  }, [selectedRatio]);

  const currentBackground = useMemo(() => {
    return DECORATIVE_BACKGROUNDS.find(b => b.id === selectedBackgroundId) || DECORATIVE_BACKGROUNDS[0];
  }, [selectedBackgroundId]);

  const currentFrame = useMemo(() => {
    return SOCIAL_MEDIA_FRAMES.find(f => f.id === selectedFrameId) || SOCIAL_MEDIA_FRAMES[0];
  }, [selectedFrameId]);

  // Sync frame data when product or winning price changes
  useEffect(() => {
    if (product?.title) {
      setFrameProductTitle(product.title);
    }
    const currentP = winningPrice || product?.targetPrice || 0;
    setFrameSellingPrice(currentP);
    if (selectedDiscount > 0) {
      setFrameOriginalPrice(Math.round(currentP / (1 - selectedDiscount / 100)));
    } else {
      setFrameOriginalPrice(Math.round(currentP * 1.25));
    }
  }, [product?.title, product?.targetPrice, winningPrice, selectedDiscount]);

  const handleSelectFramePreset = (frameConfig: SocialMediaFrameConfig) => {
    setSelectedFrameId(frameConfig.id);
    if (frameConfig.id !== 'none') {
      if (frameConfig.defaultBadgeText) setFrameBadgeText(frameConfig.defaultBadgeText);
      if (frameConfig.defaultTagline) setFrameTaglineText(frameConfig.defaultTagline);
      setIsFrameCustomizeOpen(true);
    }
  };

  // Update image if product changes and user was on default
  useEffect(() => {
    if (imageSourceType === 'product_default' && product?.imageUrl) {
      setActiveImageSrc(product.imageUrl);
    }
  }, [product?.imageUrl, imageSourceType]);

  // Handle Angle Preset selection
  const handleSelectAnglePreset = (angleConfig: AnglePresetConfig) => {
    setSelectedAngle(angleConfig.id);
    setRotationY(angleConfig.rotationY);
    setRotationX(angleConfig.rotationX);
    setRotationZ(angleConfig.rotationZ);
    setZoomScale(angleConfig.zoomScale);
    setPanX(angleConfig.panX);
    setPanY(angleConfig.panY);
    
    if (angleConfig.id === 'pedestal_floating') {
      setShowPedestal(true);
      if (selectedBackgroundId === 'pure_white') {
        setSelectedBackgroundId('studio_pedestal');
      }
    } else {
      setShowPedestal(false);
    }

    if (angleConfig.id === 'macro_details') {
      setShowCallouts(true);
    }
  };

  // Reset Angle Transforms
  const handleResetTransforms = () => {
    const defaultPreset = ANGLE_PRESETS.find(a => a.id === selectedAngle) || ANGLE_PRESETS[0];
    setRotationY(defaultPreset.rotationY);
    setRotationX(defaultPreset.rotationX);
    setRotationZ(defaultPreset.rotationZ);
    setZoomScale(defaultPreset.zoomScale);
    setPanX(defaultPreset.panX);
    setPanY(defaultPreset.panY);
  };

  // Start Camera Stream
  const handleStartCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraActive(true);

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('لم نتمكن من الوصول لكاميرا الجهاز. يرجى التأكد من السماح بالأذونات أو رفع صورة من جهازك.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const handleStopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Take Snapshot from Camera
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    setActiveImageSrc(dataUrl);
    setImageSourceType('camera_snapshot');
    handleStopCamera();

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Switch Camera Facing (Front / Back)
  const handleToggleCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    handleStartCamera();
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setActiveImageSrc(event.target.result as string);
        setImageSourceType('user_upload');
        handleStopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Callout
  const handleAddCallout = () => {
    if (!newCalloutText.trim()) return;
    const newCallout: ProductFeatureCallout = {
      id: `callout-${Date.now()}`,
      title: newCalloutText.trim(),
      xPercent: 50,
      yPercent: 50,
      direction: 'right'
    };
    setFeatureCallouts(prev => [...prev, newCallout]);
    setNewCalloutText('');
    setShowCallouts(true);
  };

  const handleRemoveCallout = (id: string) => {
    setFeatureCallouts(prev => prev.filter(c => c.id !== id));
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Filtered Backgrounds
  const filteredBackgrounds = useMemo(() => {
    if (activeBgTab === 'all') return DECORATIVE_BACKGROUNDS;
    return DECORATIVE_BACKGROUNDS.filter(b => b.category === activeBgTab);
  }, [activeBgTab]);

  // Export Canvas Single Image Generator
  const generateCanvasImage = async (
    targetRatio: PlatformAspectRatio, 
    customAngle?: ProductAngleType
  ): Promise<string> => {
    const ratioConfig = PLATFORM_ASPECT_RATIOS.find(r => r.id === targetRatio) || currentRatioConfig;
    
    // Parse target resolution
    const [wStr, hStr] = ratioConfig.pixelDimensions.replace(/px/g, '').split('×').map(s => s.trim());
    const targetWidth = parseInt(wStr, 10) || 1200;
    const targetHeight = parseInt(hStr, 10) || 1200;

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    // 1. Draw Background
    if (selectedBackgroundId === 'pure_white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else if (selectedBackgroundId === 'cyber_neon') {
      const grad = ctx.createRadialGradient(
        targetWidth / 2, targetHeight * 0.3, 50,
        targetWidth / 2, targetHeight / 2, targetWidth * 0.7
      );
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.6, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else if (selectedBackgroundId === 'nordic_wood') {
      const grad = ctx.createRadialGradient(
        targetWidth * 0.6, targetHeight * 0.3, 80,
        targetWidth / 2, targetHeight / 2, targetWidth * 0.8
      );
      grad.addColorStop(0, '#f0f9ff');
      grad.addColorStop(0.4, '#e0f2fe');
      grad.addColorStop(0.85, '#bae6fd');
      grad.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else if (selectedBackgroundId === 'luxury_marble') {
      const grad = ctx.createRadialGradient(
        targetWidth / 2, targetHeight * 0.3, 100,
        targetWidth / 2, targetHeight / 2, targetWidth * 0.8
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.6, '#f1f5f9');
      grad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else if (selectedBackgroundId === 'transparent_grid') {
      // transparent alpha
      ctx.clearRect(0, 0, targetWidth, targetHeight);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // 2. Load & Draw Product Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // fallback gracefully
      img.src = activeImageSrc;
    });

    ctx.save();

    // Studio Lighting filters (including AI Lighting & Contrast optimization)
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    const centerX = targetWidth / 2 + (panX / 100) * (targetWidth * 0.2);
    const centerY = targetHeight / 2 + (panY / 100) * (targetHeight * 0.2);

    // Draw Realistic Drop Shadow
    if (selectedBackgroundId !== 'transparent_grid' && shadowIntensity > 0) {
      ctx.save();
      const shadowY = centerY + targetHeight * 0.32 + (rotationX * 1.5);
      const shadowWidth = targetWidth * 0.55 * zoomScale;
      const shadowHeight = targetHeight * 0.12;

      const shadowGrad = ctx.createRadialGradient(
        centerX, shadowY, 10,
        centerX, shadowY, shadowWidth / 2
      );
      const shadowAlpha = (shadowIntensity / 100) * 0.35;
      shadowGrad.addColorStop(0, `rgba(15, 23, 42, ${shadowAlpha})`);
      shadowGrad.addColorStop(0.6, `rgba(15, 23, 42, ${shadowAlpha * 0.4})`);
      shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, shadowY, shadowWidth / 2, shadowHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Pedestal Podium if enabled
    if (showPedestal && selectedBackgroundId !== 'transparent_grid') {
      ctx.save();
      const pedY = centerY + targetHeight * 0.28;
      const pedW = targetWidth * 0.65;
      const pedH = targetHeight * 0.14;

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(centerX, pedY, pedW / 2, pedH / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(centerX - pedW / 2, pedY, pedW, 35);
      ctx.beginPath();
      ctx.ellipse(centerX, pedY + 35, pedW / 2, pedH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Apply 3D Perspective Transformations
    ctx.translate(centerX, centerY);
    ctx.rotate((rotationZ * Math.PI) / 180);
    
    // Scale according to aspect and zoom
    const baseFit = Math.min(targetWidth, targetHeight) * 0.72 * zoomScale;
    const imgAspect = (img.width || 1) / (img.height || 1);
    let drawW = baseFit;
    let drawH = baseFit / imgAspect;

    if (drawH > targetHeight * 0.85 * zoomScale) {
      drawH = targetHeight * 0.85 * zoomScale;
      drawW = drawH * imgAspect;
    }

    // 3D pseudo tilt
    ctx.scale(1 - Math.abs(rotationY) * 0.003, 1 - Math.abs(rotationX) * 0.004);

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // 3. Draw Social Media Frame (if active) OR legacy individual badges
    const drawRoundRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    };

    const drawTopRoundedRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h);
      c.lineTo(x, y + h);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    };

    const drawBottomRoundedRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + w, y);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y);
      c.closePath();
    };

    if (selectedFrameId !== 'none') {
      const s = targetWidth / 1000;
      const margin = Math.round(targetWidth * 0.025);
      const frameW = targetWidth - margin * 2;
      const frameH = targetHeight - margin * 2;
      const cornerR = Math.round(24 * s);

      // A. Outer Frame Border
      ctx.save();
      if (selectedFrameId === 'modern_dark_social') {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = Math.round(6 * s);
        drawRoundRect(ctx, margin, margin, frameW, frameH, cornerR);
        ctx.stroke();
      } else if (selectedFrameId === 'hot_deal_flash_sale') {
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = Math.round(8 * s);
        drawRoundRect(ctx, margin, margin, frameW, frameH, cornerR);
        ctx.stroke();
      } else if (selectedFrameId === 'verified_merchant_gold') {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = Math.round(6 * s);
        drawRoundRect(ctx, margin, margin, frameW, frameH, cornerR);
        ctx.stroke();
      } else if (selectedFrameId === 'clean_minimal_story') {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = Math.round(4 * s);
        drawRoundRect(ctx, margin, margin, frameW, frameH, cornerR);
        ctx.stroke();
      } else if (selectedFrameId === 'black_friday_neon') {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = Math.round(6 * s);
        drawRoundRect(ctx, margin, margin, frameW, frameH, cornerR);
        ctx.stroke();
      } else if (selectedFrameId === 'egypt_flag_deal') {
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = Math.round(6 * s);
        drawRoundRect(ctx, margin, margin, frameW, frameH, cornerR);
        ctx.stroke();
      }
      ctx.restore();

      // B. Top Header Bar
      const topBarH = Math.round(targetHeight * 0.075);
      const topBarY = margin;
      
      ctx.save();
      if (selectedFrameId === 'modern_dark_social') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      } else if (selectedFrameId === 'hot_deal_flash_sale') {
        const topGrad = ctx.createLinearGradient(margin, topBarY, margin + frameW, topBarY);
        topGrad.addColorStop(0, '#be123c');
        topGrad.addColorStop(0.5, '#e11d48');
        topGrad.addColorStop(1, '#ea580c');
        ctx.fillStyle = topGrad;
      } else if (selectedFrameId === 'verified_merchant_gold') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
      } else if (selectedFrameId === 'clean_minimal_story') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      } else if (selectedFrameId === 'black_friday_neon') {
        ctx.fillStyle = '#000000';
      } else if (selectedFrameId === 'egypt_flag_deal') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      }

      drawTopRoundedRect(ctx, margin, topBarY, frameW, topBarH, cornerR);
      ctx.fill();

      const isLightFrame = selectedFrameId === 'clean_minimal_story';
      const defaultTextColor = isLightFrame ? '#0f172a' : '#ffffff';

      // Top Bar Content - Badge (Right)
      if (showFrameBadge && frameBadgeText) {
        ctx.font = `bold ${Math.round(20 * s)}px Alexandria, sans-serif`;
        let badgeColor = defaultTextColor;
        if (selectedFrameId === 'hot_deal_flash_sale') badgeColor = '#bae6fd';
        else if (selectedFrameId === 'verified_merchant_gold') badgeColor = '#7dd3fc';
        else if (selectedFrameId === 'black_friday_neon') badgeColor = '#67e8f9';
        else if (selectedFrameId === 'egypt_flag_deal') badgeColor = '#a7f3d0';

        ctx.fillStyle = badgeColor;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameBadgeText, margin + frameW - Math.round(20 * s), topBarY + topBarH / 2);
      }

      // Top Bar Content - Store Name (Left)
      if (frameStoreName) {
        ctx.font = `${Math.round(15 * s)}px Alexandria, sans-serif`;
        ctx.fillStyle = isLightFrame ? '#64748b' : '#94a3b8';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameStoreName, margin + Math.round(20 * s), topBarY + topBarH / 2);
      }
      ctx.restore();

      // C. Bottom Price & Product Card
      const bottomBarH = Math.round(targetHeight * 0.19);
      const bottomBarY = targetHeight - margin - bottomBarH;

      ctx.save();
      if (selectedFrameId === 'modern_dark_social') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
      } else if (selectedFrameId === 'hot_deal_flash_sale') {
        ctx.fillStyle = 'rgba(76, 5, 25, 0.97)';
      } else if (selectedFrameId === 'verified_merchant_gold') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.97)';
      } else if (selectedFrameId === 'clean_minimal_story') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      } else if (selectedFrameId === 'black_friday_neon') {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.98)';
      } else if (selectedFrameId === 'egypt_flag_deal') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.97)';
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      }

      drawBottomRoundedRect(ctx, margin, bottomBarY, frameW, bottomBarH, cornerR);
      ctx.fill();

      // Card Accent Top Line
      ctx.lineWidth = Math.round(2 * s);
      if (selectedFrameId === 'verified_merchant_gold') {
        ctx.strokeStyle = '#0ea5e9';
      } else if (selectedFrameId === 'hot_deal_flash_sale') {
        ctx.strokeStyle = '#f43f5e';
      } else if (selectedFrameId === 'black_friday_neon') {
        ctx.strokeStyle = '#06b6d4';
      } else if (selectedFrameId === 'egypt_flag_deal') {
        ctx.strokeStyle = '#10b981';
      } else if (selectedFrameId === 'clean_minimal_story') {
        ctx.strokeStyle = '#e2e8f0';
      } else {
        ctx.strokeStyle = '#334155';
      }
      ctx.beginPath();
      ctx.moveTo(margin + Math.round(15 * s), bottomBarY);
      ctx.lineTo(margin + frameW - Math.round(15 * s), bottomBarY);
      ctx.stroke();

      // 1. Product Title
      if (showFrameTitle && frameProductTitle) {
        ctx.font = `bold ${Math.round(22 * s)}px Alexandria, sans-serif`;
        ctx.fillStyle = isLightFrame ? '#0f172a' : '#ffffff';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';

        let displayTitle = frameProductTitle;
        const maxTitleW = frameW - Math.round(40 * s);
        if (ctx.measureText(displayTitle).width > maxTitleW) {
          while (displayTitle.length > 5 && ctx.measureText(displayTitle + '...').width > maxTitleW) {
            displayTitle = displayTitle.slice(0, -1);
          }
          displayTitle += '...';
        }
        ctx.fillText(displayTitle, margin + frameW - Math.round(20 * s), bottomBarY + Math.round(14 * s));
      }

      // 2. Selling Price & Strikethrough
      if (showFramePrice) {
        const priceY = bottomBarY + Math.round(48 * s);
        
        let pricePillBg = '#10b981';
        let priceTextColor = '#ffffff';
        if (selectedFrameId === 'hot_deal_flash_sale') {
          pricePillBg = '#0ea5e9';
          priceTextColor = '#0c4a6e';
        } else if (selectedFrameId === 'verified_merchant_gold') {
          pricePillBg = '#0ea5e9';
          priceTextColor = '#0c4a6e';
        } else if (selectedFrameId === 'black_friday_neon') {
          pricePillBg = '#06b6d4';
          priceTextColor = '#082f49';
        } else if (selectedFrameId === 'clean_minimal_story') {
          pricePillBg = '#6366f1';
          priceTextColor = '#ffffff';
        }

        const priceText = `${frameSellingPrice.toLocaleString()} ${currency}`;
        ctx.font = `bold ${Math.round(24 * s)}px Alexandria, sans-serif`;
        const priceTextWidth = ctx.measureText(priceText).width;
        const pillW = priceTextWidth + Math.round(30 * s);
        const pillH = Math.round(36 * s);
        const pillX = margin + frameW - pillW - Math.round(20 * s);

        ctx.fillStyle = pricePillBg;
        drawRoundRect(ctx, pillX, priceY, pillW, pillH, Math.round(12 * s));
        ctx.fill();

        ctx.fillStyle = priceTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(priceText, pillX + pillW / 2, priceY + pillH / 2);

        // Original Strikethrough Price
        if (showFrameOriginalPrice && frameOriginalPrice > frameSellingPrice) {
          const origText = `${frameOriginalPrice.toLocaleString()} ${currency}`;
          ctx.font = `${Math.round(17 * s)}px Alexandria, sans-serif`;
          ctx.fillStyle = isLightFrame ? '#94a3b8' : '#94a3b8';
          ctx.textAlign = 'right';
          const origX = pillX - Math.round(15 * s);
          ctx.fillText(origText, origX, priceY + pillH / 2);

          const origWidth = ctx.measureText(origText).width;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = Math.round(2 * s);
          ctx.beginPath();
          ctx.moveTo(origX - origWidth - Math.round(4 * s), priceY + pillH / 2);
          ctx.lineTo(origX + Math.round(4 * s), priceY + pillH / 2);
          ctx.stroke();

          // Discount chip
          const discountPct = Math.round(((frameOriginalPrice - frameSellingPrice) / frameOriginalPrice) * 100);
          if (discountPct > 0) {
            const discText = `خصم ${discountPct}% 🔥`;
            ctx.font = `bold ${Math.round(13 * s)}px Alexandria, sans-serif`;
            const discW = ctx.measureText(discText).width + Math.round(16 * s);
            const discH = Math.round(24 * s);
            const discX = origX - origWidth - discW - Math.round(10 * s);

            ctx.fillStyle = '#e11d48';
            drawRoundRect(ctx, discX, priceY + Math.round(6 * s), discW, discH, Math.round(8 * s));
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(discText, discX + discW / 2, priceY + Math.round(6 * s) + discH / 2);
          }
        }
      }

      // 3. Bottom Tagline / CTA
      if (showFrameTagline && frameTaglineText) {
        const taglineY = bottomBarY + bottomBarH - Math.round(16 * s);
        ctx.font = `${Math.round(13 * s)}px Alexandria, sans-serif`;
        ctx.fillStyle = isLightFrame ? '#64748b' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(frameTaglineText, margin + frameW / 2, taglineY);
      }
      ctx.restore();
    } else {
      // Legacy Overlays (Badges, Price, Watermarks)
      if (showDiscountBadge && selectedDiscount > 0) {
        ctx.save();
        ctx.fillStyle = '#e11d48';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        
        const badgeW = targetWidth * 0.24;
        const badgeH = targetHeight * 0.07;
        const badgeX = targetWidth - badgeW - 30;
        const badgeY = 30;

        drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(targetHeight * 0.03)}px Alexandria, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`خصم ${selectedDiscount}% 🔥`, badgeX + badgeW / 2, badgeY + badgeH / 2);
        ctx.restore();
      }

      if (showPriceBadge) {
        ctx.save();
        const pW = targetWidth * 0.34;
        const pH = targetHeight * 0.09;
        const pX = 30;
        const pY = targetHeight - pH - 30;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        drawRoundRect(ctx, pX, pY, pW, pH, 16);
        ctx.fill();

        ctx.fillStyle = '#4ade80';
        ctx.font = `bold ${Math.round(targetHeight * 0.032)}px Alexandria, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(`${winningPrice.toLocaleString()} ${currency}`, pX + pW - 20, pY + pH * 0.55);

        ctx.fillStyle = '#94a3b8';
        ctx.font = `${Math.round(targetHeight * 0.018)}px Alexandria, sans-serif`;
        ctx.fillText('أقوى سعر متاح', pX + pW - 20, pY + pH * 0.85);
        ctx.restore();
      }

      if (showWatermark && merchantWatermarkText) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `bold ${Math.round(targetHeight * 0.02)}px Alexandria, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(merchantWatermarkText, 30, 45);
        ctx.restore();
      }
    }

    return canvas.toDataURL('image/png');
  };

  // Download Single Current Image
  const handleDownloadSingleImage = async () => {
    try {
      setIsExporting(true);
      setExportProgressText('جاري معالجة الصورة بالأبعاد والزاوية المحددة...');

      const dataUrl = await generateCanvasImage(selectedRatio);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      const brand = product?.brand || 'Product';
      const model = product?.model || 'Studio';
      link.download = `${brand}-${model}-${selectedAngle}-${selectedRatio.replace(':', 'x')}-studio.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  // Download Full 6-Angles Multi-Pack
  const handleDownloadFullAnglesPack = async () => {
    try {
      setIsExporting(true);
      for (let i = 0; i < ANGLE_PRESETS.length; i++) {
        const preset = ANGLE_PRESETS[i];
        setExportProgressText(`جاري تصدير زاوية (${i + 1}/${ANGLE_PRESETS.length}): ${preset.title}...`);
        
        // Apply angle preset temporarily
        handleSelectAnglePreset(preset);
        await new Promise(r => setTimeout(r, 200));

        const dataUrl = await generateCanvasImage(preset.recommendedAspect, preset.id);

        const link = document.createElement('a');
        link.href = dataUrl;
        const brand = product?.brand || 'Product';
        const model = product?.model || 'Studio';
        link.download = `${brand}-${model}-Angle-${i + 1}-${preset.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await new Promise(r => setTimeout(r, 400));
      }

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (err) {
      console.error('Pack export error:', err);
    } finally {
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  // Copy Image to Clipboard
  const handleCopyImageToClipboard = async () => {
    try {
      setCopiedToClipboard(true);
      const dataUrl = await generateCanvasImage(selectedRatio);
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      }
      setTimeout(() => setCopiedToClipboard(false), 2500);
    } catch (err) {
      console.error('Clipboard copy error:', err);
      setCopiedToClipboard(false);
    }
  };

  // 1. Generate AI Studio Backdrop
  const handleGenerateAiBackdrop = async () => {
    setIsGeneratingAiBackdrop(true);
    setAiBackdropResult(null);
    try {
      const response = await fetch('/api/generate-ai-studio-backdrop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiBackdropPrompt,
          stylePreset: aiBackdropPreset,
          productTitle: product?.title || 'منتج تجاري',
          category: product?.category || 'إلكترونيات',
          aspectRatio: selectedRatio
        })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setAiBackdropResult(resData.data);
        // Automatically apply recommended lighting
        if (resData.data.recommendedLighting) {
          setBrightness(resData.data.recommendedLighting.brightness || 110);
          setContrast(resData.data.recommendedLighting.contrast || 115);
          setSaturation(resData.data.recommendedLighting.saturation || 105);
          setIsAiEnhanceActive(true);
        }
        if (resData.data.recommendedBadges && resData.data.recommendedBadges.length > 0) {
          setFrameBadgeText(resData.data.recommendedBadges[0]);
        }
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });
      }
    } catch (err) {
      console.error('AI backdrop generation error:', err);
    } finally {
      setIsGeneratingAiBackdrop(false);
    }
  };

  // 2. Intelligent AI Retouch & Lighting Editor
  const handleApplyAiRetouch = async () => {
    if (!aiRetouchInstruction.trim()) return;
    setIsApplyingAiRetouch(true);
    try {
      const response = await fetch('/api/edit-product-image-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: product?.title || 'منتج',
          instruction: aiRetouchInstruction,
          currentFilters: { brightness, contrast, saturation }
        })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        if (d.recommendedBrightness) setBrightness(d.recommendedBrightness);
        if (d.recommendedContrast) setContrast(d.recommendedContrast);
        if (d.recommendedSaturation) setSaturation(d.recommendedSaturation);
        if (d.recommendedShadow) setShadowIntensity(d.recommendedShadow);
        if (d.recommendedZoom) setZoomScale(d.recommendedZoom);
        if (d.suggestedBadge) setFrameBadgeText(d.suggestedBadge);
        setAiRetouchFeedback(d.explanationAr || 'تم تطبيق التعديلات الذكية بنجاح!');
        setIsAiEnhanceActive(true);
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('AI retouch error:', err);
    } finally {
      setIsApplyingAiRetouch(false);
    }
  };

  // 3. Save Design to Cloud (Firestore)
  const handleSaveDesignToCloud = async () => {
    if (!user) {
      setCloudSaveMessage('يرجى تسجيل الدخول السحابي أولاً لحفظ تصاميمك في قاعدة البيانات.');
      setTimeout(() => setCloudSaveMessage(null), 4000);
      return;
    }

    setIsSavingToCloud(true);
    setCloudSaveMessage(null);
    try {
      const dataUrl = await generateCanvasImage(selectedRatio);
      const designId = `design-${Date.now()}`;
      await saveStudioDesignToCloud(user.uid, {
        id: designId,
        productId: product?.id,
        title: product?.title ? `${product.title} - ${selectedRatio}` : `تصميم ستوديو ${new Date().toLocaleDateString('ar-EG')}`,
        aspectRatio: selectedRatio,
        backgroundTheme: currentBackground.nameAr,
        imageData: dataUrl,
      });

      setCloudSaveMessage('تم حفظ التصميم بنجاح في قاعدة بيانات Firestore السحابية! ☁️✅');
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => setCloudSaveMessage(null), 4000);
    } catch (err) {
      console.error('Save to cloud error:', err);
      setCloudSaveMessage('حدث خطأ أثناء الحفظ في قاعدة البيانات السحابية.');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  // 4. Open Cloud Gallery
  const handleOpenCloudGallery = async () => {
    if (!user) {
      setCloudSaveMessage('يرجى تسجيل الدخول السحابي أولاً لعرض تصاميمك المحفوظة.');
      setTimeout(() => setCloudSaveMessage(null), 4000);
      return;
    }

    setIsCloudGalleryOpen(true);
    setIsLoadingCloudDesigns(true);
    try {
      const designs = await fetchStudioDesignsFromCloud(user.uid);
      setCloudSavedDesigns(designs);
    } catch (err) {
      console.error('Fetch cloud designs error:', err);
    } finally {
      setIsLoadingCloudDesigns(false);
    }
  };

  // 5. Delete Cloud Design
  const handleDeleteCloudDesign = async (designId: string) => {
    if (!user) return;
    try {
      await deleteStudioDesignFromCloud(user.uid, designId);
      setCloudSavedDesigns(prev => prev.filter(d => d.id !== designId));
    } catch (err) {
      console.error('Delete cloud design error:', err);
    }
  };

  if (!product) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4" dir="rtl">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200">
          <Camera className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-['Alexandria']">لا توجد منتجات مسجلة حالياً، يرجى المزامنة</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          يرجى مزامنة منتجاتك الفعلية من المنصة أو مسح باركود منتج للبدء في توليد وتعديل صور المنتجات التنافسية واستوديو العرض ثلاثي الأبعاد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">

      {/* ========================================================================= */}
      {/* 0. TOP NAVIGATION SEGMENTED SWITCHER (STUDIO vs A/B TESTING) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveStudioTab('3d_studio')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeStudioTab === '3d_studio'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>استوديو التصميم وزوايا المنتج (3D Studio) 📸</span>
          </button>

          <button
            onClick={() => setActiveStudioTab('ab_testing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer relative ${
              activeStudioTab === 'ab_testing'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Target className="w-4 h-4 text-sky-400" />
            <span>اختبار أداء الصورتين (A/B Testing) ⚖️</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
              +71% CTR 🚀
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 text-[11px] text-slate-500 hidden md:flex">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>قارن جاذبية الصورتين ونسبة النقر مع توليد خلفيات موسمية بالذكاء الاصطناعي</span>
        </div>
      </div>

      {/* RENDER A/B TESTING INTERFACE WHEN SELECTED */}
      {activeStudioTab === 'ab_testing' ? (
        <ProductImageABTesting
          product={product}
          currency={currency}
          winningPrice={winningPrice}
          currentStudioImage={activeImageSrc}
          onApplyWinningImage={onApplyWinningImage}
          onBackToStudio={() => setActiveStudioTab('3d_studio')}
        />
      ) : (
        <>
      {/* ========================================================================= */}
      {/* 1. TOP SPOTLIGHT HERO BANNER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-bold text-indigo-700">
                استوديو التصميم وتصوير زوايا المنتج الذكي 📸
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-black border border-sky-200">
                متوافق مع أمازون، نون، وتيك توك
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Alexandria']">
              تصميم المنتج بزوايا متعددة وخلفيات ديكورية مع أبعاد المنصات
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              التقط صورة منتجك بالكاميرا مباشرة أو استخدم الصورة الحالية، تحكم في زوايا الرؤية ثلاثية الأبعاد (3D Perspective)، أبرز تفاصيل الملمس والمنافذ، مع الحفاظ الدقيق على أبعاد المنصات (1:1، 9:16، 4:5) وتطبيق خلفيات رخامية وخشبية واستوديو احترافية.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* AI Studio Backdrop Generator */}
            <button
              onClick={() => setIsAiBackdropModalOpen(true)}
              id="btn-ai-backdrop-studio"
              className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all cursor-pointer"
              title="توليد خلفية استوديو ذكية بالذكاء الاصطناعي مع أنماط مخصصة"
            >
              <Wand2 className="w-4 h-4 text-sky-300" />
              <span>توليد خلفية AI 🪄</span>
            </button>

            {/* AI Intelligent Retouch & Lighting Editor */}
            <button
              onClick={() => setIsAiRetouchModalOpen(true)}
              id="btn-ai-retouch-studio"
              className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-100 transition-all cursor-pointer"
              title="تعديل وتلميع الصورة تلقائياً بالذكاء الاصطناعي"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>تعديل ذكي بالذكاء 🎨</span>
            </button>

            {/* Save to Cloud Firestore Database */}
            <button
              onClick={handleSaveDesignToCloud}
              disabled={isSavingToCloud}
              id="btn-cloud-save-studio"
              className="h-10 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-emerald-400 text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="حفظ الصورة والتعديلات في قاعدة بيانات Firestore السحابية"
            >
              <Cloud className="w-4 h-4" />
              <span>{isSavingToCloud ? 'جاري الحفظ...' : 'حفظ سحابياً 💾'}</span>
            </button>

            {/* Cloud Saved Gallery */}
            <button
              onClick={handleOpenCloudGallery}
              id="btn-cloud-gallery-studio"
              className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
              title="عرض التصاميم والصور المحفوظة سحابياً"
            >
              <FolderOpen className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">معرض تصاميمي 📁</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('ab_testing')}
              className="h-10 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-slate-950 text-xs font-black flex items-center gap-2 shadow-md shadow-sky-100 transition-all cursor-pointer"
              title="مقارنة الصورة الحالية في اختبار A/B مع خلفية موسمية ذكية"
            >
              <Target className="w-4 h-4" />
              <span>اختبار A/B للصور ⚖️</span>
            </button>

            <button
              onClick={handleDownloadSingleImage}
              disabled={isExporting}
              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'جاري التصدير...' : 'تحميل لقطة الزاوية الحالية HD'}</span>
            </button>

            <button
              onClick={handleDownloadFullAnglesPack}
              disabled={isExporting}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-100 transition-all cursor-pointer disabled:opacity-50"
              title="تصدير 6 زوايا متكاملة للمنتج دفعة واحدة"
            >
              <Box className="w-4 h-4" />
              <span>تحميل حزمة الـ 6 زوايا الكاملة 📦</span>
            </button>
          </div>
        </div>

        {/* Live Exporting Progress Bar */}
        {isExporting && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-indigo-900">{exportProgressText || 'جاري التصدير والمعالجة...'}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. CAMERA CAPTURE & IMAGE SOURCE SELECTOR BAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>مصدر صورة المنتج:</span>
            </span>
            <span className="text-[11px] text-slate-500">
              (التقط بالكاميرا الحية، ارفع ملفك الخاص، أو استخدم صورة الكتالوج)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Camera Trigger Button */}
            {!isCameraActive ? (
              <button
                onClick={handleStartCamera}
                className="h-9 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>فتح الكاميرا والتقاط زاوية جديدة 📸</span>
              </button>
            ) : (
              <button
                onClick={handleStopCamera}
                className="h-9 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>إغلاق الكاميرا</span>
              </button>
            )}

            {/* 2. File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>رفع صورة من الجهاز</span>
            </button>

            {/* 3. Reset to Product Default */}
            {imageSourceType !== 'product_default' && (
              <button
                onClick={() => {
                  setActiveImageSrc(product.imageUrl);
                  setImageSourceType('product_default');
                  handleStopCamera();
                }}
                className="h-9 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>العودة لصورة المنتج الأصلية</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Camera Viewport Modal / In-Page Section */}
        {isCameraActive && (
          <div className="mt-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-white space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-slate-200">الكاميرا الحية للمنتج — وجّه الكاميرا نحو المنتج</span>
              </div>

              <button
                onClick={handleToggleCameraFacing}
                className="h-8 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="تبديل بين الكاميرا الخلفية والأمامية"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>تبديل الكاميرا</span>
              </button>
            </div>

            {/* Video Container with Grid Guides */}
            <div className="relative aspect-video max-h-[360px] mx-auto rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Composition Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div className="" />
              </div>

              {/* Safe Frame Box (85% Fill Target) */}
              <div className="absolute inset-10 border-2 border-dashed border-sky-400/70 rounded-2xl pointer-events-none flex items-start justify-end p-2">
                <span className="bg-sky-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md">
                  إطار أمازون 85%
                </span>
              </div>
            </div>

            {/* Camera Bottom Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={handleCaptureSnapshot}
                className="h-12 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5 fill-slate-950" />
                <span>التقاط لقطة وإرسالها للاستوديو 📸</span>
              </button>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN STUDIO INTERFACE (GRID: CONTROLS & LIVE PREVIEW) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ===================================================================== */}
        {/* LEFT COLUMN (5 COLS): ANGLE, RATIO, BACKGROUND, & PERSPECTIVE CONTROLS */}
        {/* ===================================================================== */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 3.1. MULTI-ANGLE PRESETS (6 Angles) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>زوايا واتجاهات عرض المنتج (6 زوايا ذكية):</span>
              </span>
              <button
                onClick={handleResetTransforms}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                title="إعادة ضبط زوايا المنظور"
              >
                <RotateCw className="w-3 h-3" />
                <span>إعادة ضبط</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ANGLE_PRESETS.map((angle) => {
                const isSelected = selectedAngle === angle.id;
                return (
                  <button
                    key={angle.id}
                    type="button"
                    onClick={() => handleSelectAnglePreset(angle)}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 font-bold shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{angle.icon}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">{angle.title}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{angle.bestFor}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3.2. PLATFORM ASPECT RATIO SELECTOR (1:1, 9:16, 4:5, 16:9) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-indigo-600" />
                <span>أبعاد المنصات والسوشيال ميديا:</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentRatioConfig.recommendedBadge}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLATFORM_ASPECT_RATIOS.map((ratio) => {
                const isSelected = selectedRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedRatio(ratio.id)}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-black">{ratio.name}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {ratio.pixelDimensions}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Ratio Platforms List */}
            <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>
                <strong>معتمد لـ:</strong> {currentRatioConfig.platforms.join(' • ')}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3.3. SOCIAL MEDIA TEMPLATES & MARKETING FRAMES (قوالب السوشيال ميديا) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl border border-indigo-100 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>قوالب سوشيال ميديا وإطارات المنتجات:</span>
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-500" />
                <span>إطار تلقائي بالسعر والاسم</span>
              </span>
            </div>

            {/* Frame Presets Carousel / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SOCIAL_MEDIA_FRAMES.map((frame) => {
                const isSelected = selectedFrameId === frame.id;
                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => handleSelectFramePreset(frame)}
                    className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    <div className={`w-full h-10 rounded-xl bg-gradient-to-br ${frame.previewBg} border border-slate-200/80 mb-2 shadow-inner flex items-center justify-between px-2 text-xs`}>
                      <span className="text-base">{frame.icon}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 line-clamp-1">{frame.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{frame.badge}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Customization Drawer / Panel when Frame is Active */}
            {selectedFrameId !== 'none' && (
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-3.5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    <span>تخصيص بيانات قالب الإطار:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFrameCustomizeOpen(!isFrameCustomizeOpen)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isFrameCustomizeOpen ? 'طي التخصيص' : 'تعديل البيانات'}</span>
                    {isFrameCustomizeOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isFrameCustomizeOpen && (
                  <div className="space-y-3 pt-1 border-t border-slate-200">
                    {/* 1. Product Title input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        اسم المنتج المعروض في شريط الإطار:
                      </label>
                      <input
                        type="text"
                        value={frameProductTitle}
                        onChange={(e) => setFrameProductTitle(e.target.value)}
                        placeholder="اكتب اسم المنتج..."
                        className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    {/* 2. Selling Price & Original Price inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-700 mb-1 flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          <span>سعر البيع ({currency}):</span>
                        </label>
                        <input
                          type="number"
                          value={frameSellingPrice}
                          onChange={(e) => setFrameSellingPrice(Math.max(0, Number(e.target.value)))}
                          className="w-full text-xs font-bold bg-white border border-emerald-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                          <span>السعر المشطوب ({currency}):</span>
                        </label>
                        <input
                          type="number"
                          value={frameOriginalPrice}
                          onChange={(e) => setFrameOriginalPrice(Math.max(0, Number(e.target.value)))}
                          className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* 3. Header Badge Text */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        نص الشارة العلوية (العرض الترويجي):
                      </label>
                      <input
                        type="text"
                        value={frameBadgeText}
                        onChange={(e) => setFrameBadgeText(e.target.value)}
                        placeholder="مثال: 🔥 أقوى سعر بيع متاح بمصر 🇪🇬"
                        className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* 4. Tagline / Call to Action */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        شريط وسيلة الطلب والتوصيل السفلي:
                      </label>
                      <input
                        type="text"
                        value={frameTaglineText}
                        onChange={(e) => setFrameTaglineText(e.target.value)}
                        placeholder="مثال: اطلب الآن • شحن سريع حتى باب المنزل • الدفع عند الاستلام 📦"
                        className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* 5. Store / Merchant Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        اسم المتجر / العلامة التجارية:
                      </label>
                      <input
                        type="text"
                        value={frameStoreName}
                        onChange={(e) => setFrameStoreName(e.target.value)}
                        placeholder="اسم متجرك..."
                        className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Element Visibility Toggles */}
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFramePrice(!showFramePrice)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          showFramePrice
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {showFramePrice ? '✓ السعر مفعل' : '✗ إخفاء السعر'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowFrameTitle(!showFrameTitle)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          showFrameTitle
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {showFrameTitle ? '✓ اسم المنتج مفعل' : '✗ إخفاء الاسم'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowFrameBadge(!showFrameBadge)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          showFrameBadge
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {showFrameBadge ? '✓ الشارة مفعلة' : '✗ إخفاء الشارة'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowFrameOriginalPrice(!showFrameOriginalPrice)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          showFrameOriginalPrice
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {showFrameOriginalPrice ? '✓ السعر المشطوب مفعل' : '✗ إخفاء المشطوب'}
                      </button>
                    </div>

                    {/* Quick Reset button */}
                    <div className="text-left pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setFrameProductTitle(product?.title || '');
                          setFrameSellingPrice(winningPrice || product?.targetPrice || 0);
                          setFrameOriginalPrice(
                            selectedDiscount > 0
                              ? Math.round((winningPrice || product?.targetPrice || 1000) / (1 - selectedDiscount / 100))
                              : Math.round((winningPrice || product?.targetPrice || 1000) * 1.25)
                          );
                          if (currentFrame.defaultBadgeText) setFrameBadgeText(currentFrame.defaultBadgeText);
                          if (currentFrame.defaultTagline) setFrameTaglineText(currentFrame.defaultTagline);
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        استعادة القيم الأصلية للمنتج ↺
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3.4. DECORATIVE BACKGROUNDS & SCENES */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>الخلفيات الديكورية واستوديوهات العرض:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {DECORATIVE_BACKGROUNDS.length} أنماط
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
              {([
                { id: 'all' as const, label: 'الكل' },
                { id: 'ecommerce_compliance' as const, label: 'معتمد المنصات' },
                { id: 'luxury_studio' as const, label: 'رخام وبيديستال' },
                { id: 'lifestyle_home' as const, label: 'خشب ومكتب' },
                { id: 'social_creative' as const, label: 'نيون وسوشيال' }
              ]).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveBgTab(tab.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                    activeBgTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Backgrounds Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredBackgrounds.map((bg) => {
                const isSelected = selectedBackgroundId === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => {
                      setSelectedBackgroundId(bg.id);
                      if (bg.id === 'studio_pedestal') setShowPedestal(true);
                    }}
                    className={`p-2 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-full h-10 rounded-xl bg-gradient-to-br ${bg.previewGradient} border border-slate-200/80 mb-1.5 shadow-inner flex items-center justify-center`}>
                      {isSelected && <Check className="w-4 h-4 text-indigo-700 bg-white/80 rounded-full p-0.5" />}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 line-clamp-1">{bg.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3.4. 3D PERSPECTIVE & TRANSFORM SLIDERS */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>التحكم الدقيق في المنظور ثلاثي الأبعاد (3D Controls):</span>
            </span>

            {/* Y-Axis Rotation (Horizontal 3D) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>دوران ثلاثي الأبعاد أفقي (Y-Axis)</span>
                <span className="font-bold text-indigo-600">{rotationY}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                value={rotationY}
                onChange={(e) => setRotationY(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* X-Axis Tilt (Vertical 3D) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>ميل رأسي ثلاثي الأبعاد (X-Axis Tilt)</span>
                <span className="font-bold text-indigo-600">{rotationX}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={rotationX}
                onChange={(e) => setRotationX(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Zoom / Scale */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>التكبير والماكرو (Zoom & Detail)</span>
                <span className="font-bold text-indigo-600">{Math.round(zoomScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.2"
                step="0.05"
                value={zoomScale}
                onChange={(e) => setZoomScale(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Drop Shadow Intensity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>شدة الظل الواقعي تحت المنتج</span>
                <span className="font-bold text-indigo-600">{shadowIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={shadowIntensity}
                onChange={(e) => setShadowIntensity(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Toggles: Pedestal & Safe Grid */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPedestal}
                  onChange={(e) => setShowPedestal(e.target.checked)}
                  className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                />
                <span>منصة عرض بيديستال 🏛️</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSafeZoneGrid}
                  onChange={(e) => setShowSafeZoneGrid(e.target.checked)}
                  className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                />
                <span>إطار أمان أمازون 85%</span>
              </label>
            </div>
          </div>

          {/* 3.4. AI LIGHTING & CONTRAST OPTIMIZER FOR SCANNED PRODUCT PHOTOS */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white rounded-3xl border border-indigo-200/90 p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Wand2 className="w-3 h-3 text-sky-300" />
                </span>
                <span>تحسين الإضاءة والتباين بالذكاء الاصطناعي (AI Lighting Studio):</span>
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">
                مخصص للصور الممسوحة ضوئياً 📷
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              يرفع جودة صور المنتجات الممسوحة ضوئياً أو الملتقطة بكاميرا الهاتف، ويزيل بهتان الإضاءة والظلال المعتمة لضمان توافقها مع معايير أمازون ونون ومنصات التجارة الإلكترونية.
            </p>

            {/* AI Feedback Banner */}
            {aiEnhanceFeedback && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{aiEnhanceFeedback}</span>
              </div>
            )}

            {/* 1-Click Master AI Enhancement Button */}
            <button
              type="button"
              onClick={() => handleApplyAiEnhance('studio_white')}
              id="btn-ai-auto-enhance-lighting"
              className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                isAiEnhanceActive
                  ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-emerald-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>تحسين الإضاءة والتباين بالذكاء الاصطناعي (AI Auto-Enhance)</span>
            </button>

            {/* Specialized Scanned E-Commerce Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-700 block">
                أنماط المعالجة المتخصصة لصور المنتجات:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {AI_LIGHTING_PRESETS.map((preset) => {
                  const isSelected = isAiEnhanceActive && aiLightingPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyAiEnhance(preset.id)}
                      className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full">
                        <span className="text-xs font-black flex items-center gap-1">
                          <span>{preset.icon}</span>
                          <span>{preset.nameAr}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-300 shrink-0" />}
                      </div>
                      <span className={`text-[9px] line-clamp-1 ${isSelected ? 'text-indigo-100 font-medium' : 'text-slate-500'}`}>
                        {preset.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine-Tuning Sliders */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-indigo-100/80">
              {/* Brightness */}
              <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[10px] text-slate-700">
                  <span className="flex items-center gap-1 font-bold">
                    <Sun className="w-3 h-3 text-sky-500" />
                    <span>السطوع</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-600">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="145"
                  value={brightness}
                  onChange={(e) => {
                    setBrightness(Number(e.target.value));
                    setIsAiEnhanceActive(true);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[10px] text-slate-700">
                  <span className="flex items-center gap-1 font-bold">
                    <Contrast className="w-3 h-3 text-indigo-500" />
                    <span>التباين</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-600">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="145"
                  value={contrast}
                  onChange={(e) => {
                    setContrast(Number(e.target.value));
                    setIsAiEnhanceActive(true);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5"
                />
              </div>

              {/* Saturation / Vibrance */}
              <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[10px] text-slate-700">
                  <span className="flex items-center gap-1 font-bold">
                    <Palette className="w-3 h-3 text-rose-500" />
                    <span>الحيوية</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-600">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="145"
                  value={saturation}
                  onChange={(e) => {
                    setSaturation(Number(e.target.value));
                    setIsAiEnhanceActive(true);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5"
                />
              </div>
            </div>

            {/* Quick Action Toolbar (Compare & Reset) */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-indigo-100/70 text-[11px]">
              <button
                type="button"
                onMouseDown={() => setShowBeforeAfter(true)}
                onMouseUp={() => setShowBeforeAfter(false)}
                onTouchStart={() => setShowBeforeAfter(true)}
                onTouchEnd={() => setShowBeforeAfter(false)}
                className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                title="اضغط واستمر بالضغط لمقارنة مظهر الصورة الأصلية قبل التحسين"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>اضغط باستمرار لمقارنة الأصل (Before / After)</span>
              </button>

              <button
                type="button"
                onClick={handleResetLighting}
                className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="إعادة تعيين السطوع والتباين للأصل (100%)"
              >
                <RefreshCw className="w-3 h-3" />
                <span>إعادة ضبط</span>
              </button>
            </div>
          </div>

          {/* 3.5. MARKETING BADGES & CALLOUT PINS */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-indigo-600" />
              <span>الشارات التسويقية ونقاط تفاصيل المنتج:</span>
            </span>

            {/* Marketing Badges Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                <span>إظهار شارة الخصم الحصري (-{selectedDiscount}%)</span>
                <input
                  type="checkbox"
                  checked={showDiscountBadge}
                  onChange={(e) => setShowDiscountBadge(e.target.checked)}
                  className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                <span>إظهار شارة السعر التنافسي ({winningPrice.toLocaleString()} {currency})</span>
                <input
                  type="checkbox"
                  checked={showPriceBadge}
                  onChange={(e) => setShowPriceBadge(e.target.checked)}
                  className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                <span>إظهار نقاط ومميزات المنتج التفاعلية (Feature Callouts)</span>
                <input
                  type="checkbox"
                  checked={showCallouts}
                  onChange={(e) => setShowCallouts(e.target.checked)}
                  className="rounded accent-indigo-600 w-4 h-4 cursor-pointer"
                />
              </label>

              {showCallouts && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newCalloutText}
                      onChange={(e) => setNewCalloutText(e.target.value)}
                      placeholder="أضف ميزة جديدة (مثال: بطارية 40 ساعة)..."
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCallout}
                      className="h-8 px-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                    >
                      إضافة
                    </button>
                  </div>

                  <div className="space-y-1">
                    {featureCallouts.map((callout) => (
                      <div key={callout.id} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded-lg border border-slate-200">
                        <span>{callout.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCallout(callout.id)}
                          className="text-rose-600 hover:text-rose-800 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN (7 COLS): LIVE RESPONSIVE CANVAS & MULTI-PERSPECTIVE VIEW */}
        {/* ===================================================================== */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          
          {/* Canvas Header Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>المعاينة المباشرة للأبعاد والزوايا:</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                ({currentRatioConfig.pixelDimensions})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyImageToClipboard}
                className="h-7 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="نسخ الصورة للحافظة"
              >
                {copiedToClipboard ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedToClipboard ? 'تم النسخ!' : 'نسخ الصورة'}</span>
              </button>

              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                currentBackground.isCompliantWithAmazon 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
              }`}>
                {currentBackground.badge}
              </span>
            </div>
          </div>

          {/* MAIN STAGE / VIEWPORT CONTAINER */}
          <div className="w-full bg-slate-900/5 border-2 border-slate-200/90 rounded-3xl p-4 sm:p-6 flex items-center justify-center min-h-[500px] overflow-hidden shadow-inner">
            
            {/* Dynamic Aspect-Ratio Frame Preserver */}
            <div
              ref={studioPreviewRef}
              style={{
                background: currentBackground.bgCss,
                aspectRatio: `${currentRatioConfig.ratioValue}`,
                maxHeight: '480px',
                width: currentRatioConfig.ratioValue > 1 ? '100%' : 'auto',
                height: currentRatioConfig.ratioValue <= 1 ? '480px' : 'auto',
              }}
              className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 flex items-center justify-center border border-slate-300 select-none"
            >
              {/* AI Lighting & Contrast Active / Before-After Comparison Badge */}
              {(isAiEnhanceActive || showBeforeAfter) && (
                <div className="absolute top-3 left-3 z-30 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-md border animate-fadeIn bg-slate-900/85 text-white border-sky-400/50">
                  {showBeforeAfter ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      <span>معاينة الصورة الأصلية (قبل التحسين)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      <span>تحسين إضاءة وتباين AI نشط ({AI_LIGHTING_PRESETS.find(p => p.id === aiLightingPreset)?.nameAr || 'مخصص'})</span>
                    </>
                  )}
                </div>
              )}
              
              {/* Safe Zone Frame Box Overlay (85% Fill for Amazon / TikTok guidelines) */}
              {showSafeZoneGrid && (
                <div className="absolute inset-6 border border-dashed border-indigo-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-2 z-30">
                  <div className="flex items-center justify-between text-[9px] font-bold text-indigo-600 bg-white/70 backdrop-blur-xs px-1.5 py-0.5 rounded shadow-xs w-fit">
                    <span>منطقة الأمان المعتمدة ({currentRatioConfig.name})</span>
                  </div>
                  <div className="text-[9px] text-slate-400 text-left">
                    {currentRatioConfig.pixelDimensions}
                  </div>
                </div>
              )}

              {/* Realistic Drop Shadow Layer */}
              {selectedBackgroundId !== 'transparent_grid' && shadowIntensity > 0 && (
                <div
                  style={{
                    transform: `translateX(${panX * 0.8}px) translateY(${panY * 0.8 + 120 + rotationX * 0.8}px) scaleX(${zoomScale * 1.1})`,
                    opacity: (shadowIntensity / 100) * 0.45,
                    filter: `blur(${18 + shadowIntensity * 0.15}px)`,
                  }}
                  className="absolute w-44 h-10 bg-slate-950 rounded-full pointer-events-none transition-transform duration-150"
                />
              )}

              {/* 3D Cylindrical Pedestal Podium */}
              {showPedestal && selectedBackgroundId !== 'transparent_grid' && (
                <div
                  style={{
                    transform: `translateX(${panX * 0.8}px) translateY(${panY * 0.8 + 105}px) scale(${zoomScale})`,
                  }}
                  className="absolute w-56 h-16 pointer-events-none transition-transform duration-150"
                >
                  <div className="w-full h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 rounded-full shadow-md border border-slate-300" />
                  <div className="w-full h-8 bg-gradient-to-b from-slate-300 to-slate-400 -mt-4 rounded-b-3xl shadow-lg" />
                </div>
              )}

              {/* TRANSFORMED PRODUCT IMAGE (3D PERSPECTIVE WRAPPER) */}
              <div
                style={{
                  transform: `
                    perspective(900px) 
                    translateX(${panX}px) 
                    translateY(${panY}px) 
                    rotateY(${rotationY}deg) 
                    rotateX(${rotationX}deg) 
                    rotateZ(${rotationZ}deg) 
                    scale(${zoomScale})
                  `,
                  filter: `brightness(${showBeforeAfter ? 100 : brightness}%) contrast(${showBeforeAfter ? 100 : contrast}%) saturate(${showBeforeAfter ? 100 : saturation}%)`,
                  transition: 'transform 0.1s ease-out',
                }}
                className="relative z-20 flex items-center justify-center p-4"
              >
                <img
                  src={activeImageSrc}
                  alt={product?.title || 'صورة المنتج'}
                  className="max-h-[320px] max-w-[85%] object-contain drop-shadow-md select-none pointer-events-none"
                />

                {/* Feature Callout Hotspot Pins */}
                {showCallouts && featureCallouts.map((pin) => (
                  <div
                    key={pin.id}
                    style={{
                      top: `${pin.yPercent}%`,
                      left: `${pin.xPercent}%`,
                    }}
                    className="absolute z-30 pointer-events-auto"
                  >
                    <div className="relative group">
                      <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center animate-ping" />
                      <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-lg absolute inset-0" />
                      
                      <div className="absolute top-1/2 -translate-y-1/2 right-5 bg-slate-900/90 text-white backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-xl whitespace-nowrap border border-indigo-400/40">
                        {pin.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ============================================================= */}
              {/* MARKETING OVERLAYS, SOCIAL MEDIA FRAMES & BADGES */}
              {/* ============================================================= */}

              {/* SOCIAL MEDIA FRAME LIVE OVERLAY (When Frame is Active) */}
              {selectedFrameId !== 'none' && (
                <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-2.5">
                  {/* Outer Accent Border */}
                  <div
                    className={`absolute inset-1.5 rounded-xl pointer-events-none ${
                      selectedFrameId === 'modern_dark_social'
                        ? 'border-2 border-slate-700/80 shadow-lg'
                        : selectedFrameId === 'hot_deal_flash_sale'
                        ? 'border-2 border-rose-600/90 shadow-lg'
                        : selectedFrameId === 'verified_merchant_gold'
                        ? 'border-2 border-sky-500/80 shadow-lg'
                        : selectedFrameId === 'clean_minimal_story'
                        ? 'border border-slate-300 shadow-sm'
                        : selectedFrameId === 'black_friday_neon'
                        ? 'border-2 border-cyan-400 shadow-lg shadow-cyan-950/50'
                        : 'border-2 border-emerald-600/90 shadow-lg'
                    }`}
                  />

                  {/* Top Header Bar */}
                  <div
                    className={`relative z-10 rounded-xl px-3 py-1.5 flex items-center justify-between backdrop-blur-md shadow-md ${
                      selectedFrameId === 'modern_dark_social'
                        ? 'bg-slate-950/90 text-white border border-slate-800'
                        : selectedFrameId === 'hot_deal_flash_sale'
                        ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-sky-600 text-white'
                        : selectedFrameId === 'verified_merchant_gold'
                        ? 'bg-slate-950/95 text-sky-400 border-b border-sky-500/50'
                        : selectedFrameId === 'clean_minimal_story'
                        ? 'bg-white/95 text-slate-900 border border-slate-200'
                        : selectedFrameId === 'black_friday_neon'
                        ? 'bg-black text-cyan-400 border border-cyan-500/50'
                        : 'bg-slate-950/95 text-emerald-400 border border-emerald-700/50'
                    }`}
                  >
                    {/* Badge / Headline (Right) */}
                    {showFrameBadge && frameBadgeText ? (
                      <div className="text-[11px] font-black line-clamp-1 flex items-center gap-1">
                        <span>{frameBadgeText}</span>
                      </div>
                    ) : <div />}

                    {/* Store Name (Left) */}
                    {frameStoreName && (
                      <div className="text-[10px] font-bold text-slate-300 opacity-90 line-clamp-1">
                        {frameStoreName}
                      </div>
                    )}
                  </div>

                  {/* Bottom Price & Product Card */}
                  <div
                    className={`relative z-10 rounded-2xl p-3 backdrop-blur-md shadow-2xl flex flex-col gap-1.5 ${
                      selectedFrameId === 'modern_dark_social'
                        ? 'bg-slate-950/95 text-white border border-slate-800'
                        : selectedFrameId === 'hot_deal_flash_sale'
                        ? 'bg-rose-950/95 text-white border border-rose-600/60'
                        : selectedFrameId === 'verified_merchant_gold'
                        ? 'bg-slate-950/95 text-white border border-sky-500/50'
                        : selectedFrameId === 'clean_minimal_story'
                        ? 'bg-white/95 text-slate-900 border border-slate-200'
                        : selectedFrameId === 'black_friday_neon'
                        ? 'bg-black/95 text-white border border-cyan-500/60'
                        : 'bg-slate-950/95 text-white border border-emerald-600/60'
                    }`}
                  >
                    {/* 1. Product Title */}
                    {showFrameTitle && frameProductTitle && (
                      <div className="text-xs sm:text-sm font-black line-clamp-1 text-right">
                        {frameProductTitle}
                      </div>
                    )}

                    {/* 2. Price Section */}
                    {showFramePrice && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Selling Price Pill */}
                          <div
                            className={`px-2.5 py-0.5 rounded-lg text-xs sm:text-sm font-black shadow-xs ${
                              selectedFrameId === 'hot_deal_flash_sale' || selectedFrameId === 'verified_merchant_gold'
                                ? 'bg-sky-400 text-sky-950'
                                : selectedFrameId === 'clean_minimal_story'
                                ? 'bg-indigo-600 text-white'
                                : selectedFrameId === 'black_friday_neon'
                                ? 'bg-cyan-400 text-cyan-950'
                                : 'bg-emerald-500 text-white'
                            }`}
                          >
                            <bdi>{frameSellingPrice.toLocaleString()} {currency}</bdi>
                          </div>

                          {/* Original Strikethrough Price */}
                          {showFrameOriginalPrice && frameOriginalPrice > frameSellingPrice && (
                            <span className="text-[11px] text-slate-400 line-through">
                              <bdi>{frameOriginalPrice.toLocaleString()} {currency}</bdi>
                            </span>
                          )}

                          {/* Discount Chip */}
                          {showFrameOriginalPrice && frameOriginalPrice > frameSellingPrice && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white">
                              <bdi>خصم {Math.round(((frameOriginalPrice - frameSellingPrice) / frameOriginalPrice) * 100)}% 🔥</bdi>
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-sky-400 font-bold hidden sm:block">
                          أقوى سعر بمصر 🇪🇬
                        </div>
                      </div>
                    )}

                    {/* 3. Tagline / Call to Action */}
                    {showFrameTagline && frameTaglineText && (
                      <div className="text-[10px] text-slate-300 text-center font-medium border-t border-white/10 pt-1 line-clamp-1">
                        <bdi>{frameTaglineText}</bdi>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 1. Discount Badge (When No Frame is Active) */}
              {selectedFrameId === 'none' && showDiscountBadge && selectedDiscount > 0 && (
                <div className="absolute top-4 right-4 z-30 bg-rose-600 text-white px-3 py-1.5 rounded-2xl shadow-xl font-black text-xs flex items-center gap-1 animate-bounce">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span><bdi>خصم {selectedDiscount}% 🔥</bdi></span>
                </div>
              )}

              {/* 2. Winning Price Banner (When No Frame is Active) */}
              {selectedFrameId === 'none' && showPriceBadge && (
                <div className="absolute bottom-4 inset-x-4 z-30 bg-slate-900/90 backdrop-blur-md border border-indigo-500/40 text-white p-3 rounded-2xl flex items-center justify-between shadow-2xl">
                  <div>
                    <div className="text-[10px] text-sky-400 font-bold">🔥 أقوى سعر بيع متاح بمصر</div>
                    <div className="text-base font-black text-emerald-400">
                      <bdi>{winningPrice.toLocaleString()} {currency}</bdi>
                    </div>
                  </div>
                  <div className="text-left text-[10px] text-slate-300">
                    <div className="flex items-center gap-1 text-indigo-300 font-bold">
                      <Shield className="w-3 h-3" />
                      <span>ضمان معتمد</span>
                    </div>
                    <div className="text-slate-400">شحن سريع للباب</div>
                  </div>
                </div>
              )}

              {/* 3. Watermark (When No Frame is Active) */}
              {selectedFrameId === 'none' && showWatermark && merchantWatermarkText && (
                <div className="absolute bottom-4 left-4 z-30 bg-white/90 backdrop-blur-xs border border-slate-200 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-800 shadow-xs">
                  🛡️ {merchantWatermarkText}
                </div>
              )}

              {/* 4. Amazon Strict 100% White Indicator */}
              {selectedBackgroundId === 'pure_white' && (
                <div className="absolute top-3 left-3 z-30 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>خلفية بيضاء 100% متوافقة مع أمازون</span>
                </div>
              )}

            </div>
          </div>

          {/* Canvas Bottom Specs & Tips */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">الزاوية النشطة:</span>
              <span className="text-indigo-700 font-bold">{ANGLE_PRESETS.find(a => a.id === selectedAngle)?.title}</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>الأبعاد: {currentRatioConfig.pixelDimensions}</span>
              <span>•</span>
              <span>الصيغة: PNG عالي الدقة HD</span>
            </div>
          </div>

        </div>

      </div>

        {/* Cloud Save Notification Toast */}
        {cloudSaveMessage && (
          <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-slate-950 text-white border border-emerald-500/60 shadow-2xl text-xs font-bold flex items-center gap-3 animate-fadeIn">
            <Cloud className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
            <span>{cloudSaveMessage}</span>
          </div>
        )}

        {/* 1. MODAL: AI Studio Backdrop Generator */}
        {isAiBackdropModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-right">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={() => setIsAiBackdropModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer p-1"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2 text-indigo-900 font-black text-base">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  <span>توليد خلفية استوديو ذكية بالذكاء الاصطناعي (AI Backdrop) 🪄</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-2">اختر النمط التجاري المفضل للمنتج:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'luxury_marble', label: 'رخام إيطالي فاخر 💎', desc: 'بوديوم ناصع البياض وظلال ناعمة' },
                      { id: 'ramadan_gold', label: 'أجواء رمضانية دافئة 🌙', desc: 'ذهبي ملوكي وإضاءة فوانيس' },
                      { id: 'neon_cyber', label: 'استوديو نيون تقني ⚡', desc: 'إضاءة زرقاء وأرجوانية متباينة' },
                      { id: 'desert_warmth', label: 'دفء مصري طبيعي 🏜️', desc: 'درجات الرمل والشمس الساطعة' },
                      { id: 'pure_white', label: 'أبيض ناصع 100% 📦', desc: 'معتمد رسمياً لأمازون ونون' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAiBackdropPreset(preset.id)}
                        className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                          aiBackdropPreset === preset.id
                            ? 'bg-purple-50 border-purple-500 text-purple-900 font-black ring-2 ring-purple-200'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">{preset.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    أو اكتب وصف المشهد المرغوب بحرية (Prompt):
                  </label>
                  <textarea
                    rows={3}
                    value={aiBackdropPrompt}
                    onChange={(e) => setAiBackdropPrompt(e.target.value)}
                    placeholder="مثال: منصة خشبية دافئة مع خلفية إضاءة ستوديو متدرجة وظلال واقعية تعكس الفخامة لمشتري السوق المصري..."
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 leading-relaxed font-medium text-xs"
                  />
                </div>

                {/* AI Backdrop Result Preview Card */}
                {aiBackdropResult && (
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-purple-900 text-sm">{aiBackdropResult.themeTitle}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-bold">
                        {aiBackdropResult.platformSuitability || 'جاهز للاستخدام'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">{aiBackdropResult.description}</p>
                    
                    {aiBackdropResult.marketingHook && (
                      <div className="text-[11px] font-bold text-purple-800 bg-purple-100/80 p-2 rounded-xl">
                        💡 عبارة ترويجية مقترحة: "{aiBackdropResult.marketingHook}"
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateAiBackdrop}
                    disabled={isGeneratingAiBackdrop}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-purple-200"
                  >
                    {isGeneratingAiBackdrop ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري التحليل والتوليد بالذكاء الاصطناعي...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-sky-300" />
                        <span>توليد وتطبيق إعدادات الخلفية الفاخرة</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAiBackdropModalOpen(false)}
                    className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MODAL: AI Intelligent Retouch & Photo Retoucher */}
        {isAiRetouchModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-right">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={() => setIsAiRetouchModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer p-1"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2 text-cyan-900 font-black text-base">
                  <Sparkles className="w-5 h-5 text-cyan-600" />
                  <span>تعديل وتلميع الصورة الذكي (AI Retouch) 🎨</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-2">تعليمات التعديل والتلميع:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {[
                      'زيادة لمعان وتباين المنتج لجذب مشتري نون وأمازون',
                      'تفتيح الظلال وإبراز تفاصيل الملمس والألوان الحقيقية',
                      'إضاءة ستوديو دافئة تناسب المجوهرات والإلكترونيات',
                      'إبراز نقاء الحواف وتكبير مناسب للعرض في السوشيال ميديا'
                    ].map((sugg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiRetouchInstruction(sugg)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-right text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                      >
                        ⚡ {sugg}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={aiRetouchInstruction}
                    onChange={(e) => setAiRetouchInstruction(e.target.value)}
                    placeholder="اكتب تعليمات التعديل التي تريدها (مثال: فتح الإضاءة قليلاً مع رفع التشبع اللوني لتبدو الكاميرا والشاشة براقة)..."
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none text-slate-800 leading-relaxed font-medium text-xs"
                  />
                </div>

                {aiRetouchFeedback && (
                  <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl text-[11px] text-cyan-900 leading-relaxed font-semibold animate-fadeIn">
                    ✨ {aiRetouchFeedback}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleApplyAiRetouch}
                    disabled={isApplyingAiRetouch || !aiRetouchInstruction.trim()}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-black transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-cyan-100"
                  >
                    {isApplyingAiRetouch ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري المعالجة والتعديل...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-cyan-200" />
                        <span>تطبيق التعديل الذكي الآن</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAiRetouchModalOpen(false)}
                    className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MODAL: Cloud Saved Designs Gallery (قاعدة بيانات Firestore) */}
        {isCloudGalleryOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-right">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={() => setIsCloudGalleryOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer p-1"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <span>معرض التصاميم المحفوظة في قاعدة البيانات السحابية ☁️</span>
                </div>
              </div>

              {isLoadingCloudDesigns ? (
                <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                  <span>جاري استرجاع تصاميمك من قاعدة بيانات Firestore...</span>
                </div>
              ) : cloudSavedDesigns.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700">لا توجد تصاميم محفوظة سحابياً بعد</p>
                  <p className="text-[11px] text-slate-400">
                    اضغط على "حفظ سحابياً 💾" في أعلى الاستوديو لحفظ أي لقطة أو تصميم للمنتج.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cloudSavedDesigns.map((design) => (
                    <div
                      key={design.id}
                      className="border border-slate-200 rounded-2xl p-3 bg-slate-50 hover:bg-white transition-all shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-200/80 flex items-center justify-center">
                        <img
                          src={design.imageData}
                          alt={design.title}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-xs truncate">{design.title}</div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>النسبة: {design.aspectRatio || '1:1'}</span>
                          <span>{design.backgroundTheme || 'استوديو'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveImageSrc(design.imageData);
                            setImageSourceType('user_upload');
                            setIsCloudGalleryOpen(false);
                            confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          استعادة وتعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCloudDesign(design.id)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="حذف من السحابة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        </>
      )}

    </div>
  );
};
