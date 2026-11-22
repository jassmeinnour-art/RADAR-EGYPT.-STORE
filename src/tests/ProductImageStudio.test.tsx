import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { ProductImageStudio } from '../components/ProductImageStudio';
import { resolvePathToTab, resolveTabToPath } from '../utils/navigation';

const { mockRemoveBackground } = vi.hoisted(() => ({
  mockRemoveBackground: vi.fn(),
}));

vi.mock('@imgly/background-removal', () => ({
  removeBackground: mockRemoveBackground,
}));

describe('ProductImageStudio Component & Routing', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('resolves /image-studio and /studio routes to product_image_studio tab', () => {
    expect(resolvePathToTab('/image-studio')).toBe('product_image_studio');
    expect(resolvePathToTab('/studio')).toBe('product_image_studio');
    expect(resolveTabToPath('product_image_studio')).toBe('/image-studio');
  });

  it('shows validation alert when generating without product image or description', async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;
    const onShowToast = vi.fn();

    render(<ProductImageStudio onShowToast={onShowToast} />);

    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'يرجى رفع صورة المنتج أو كتابة اسم/وصف المنتج قبل التوليد.'
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onShowToast).toHaveBeenCalled();
  });

  it('submits uploaded image, decorative style, and social aspect ratio to server API and supports all preview modes before download', async () => {
    const generatedDataUrl = 'data:image/png;base64,GENERATED_IMAGE_DATA';
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        imageUrl: generatedDataUrl,
        mimeType: 'image/png',
        model: 'gemini-3.1-flash-lite-image',
        aspectRatio: '9:16',
        resolution: '1K',
      }),
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const onShowToast = vi.fn();
    render(<ProductImageStudio onShowToast={onShowToast} />);

    // Upload a product image file
    const fileInput = screen.getByLabelText('رفع صورة المنتج') as HTMLInputElement;
    const mockFile = new File(['dummy-png-bytes'], 'perfume.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getAllByText('perfume.png').length).toBeGreaterThanOrEqual(1);
    });

    // Enter product title & custom prompt
    fireEvent.change(screen.getByLabelText('اسم المنتج أو وصفه'), {
      target: { value: 'زجاجة عطر عود فاخر' },
    });
    fireEvent.change(screen.getByLabelText('توجيه ديكوري إضافي (اختياري)'), {
      target: { value: 'مع انعكاس ذهبي ناعم' },
    });

    // Select decorative backdrop style & social media platform preset
    fireEvent.click(screen.getByRole('button', { name: /طابع شرقي وأرابيسك/i }));
    fireEvent.click(screen.getByRole('button', { name: /ستوري \/ ريلز \/ تيك توك/i }));

    // Trigger generation
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/product-image-studio/generate');
    expect(options.method).toBe('POST');
    const parsedBody = JSON.parse(options.body);
    expect(parsedBody).toMatchObject({
      productTitle: 'زجاجة عطر عود فاخر',
      stylePresetId: 'ramadan_arabesque',
      customPrompt: 'مع انعكاس ذهبي ناعم',
      aspectRatio: '9:16',
      platformPresetId: 'instagram_story_reels',
      resolution: '1K',
    });
    expect(parsedBody.imageBase64).toContain('data:image/png;base64,');

    // Wait for preview stage to show generated before/after comparison
    await waitFor(() => {
      expect(screen.getByText('قبل (الأصلية)')).toBeInTheDocument();
      expect(screen.getByText('بعد (خلفية الذكاء الاصطناعي)')).toBeInTheDocument();
    });

    // Switch to Interactive Slider preview mode
    fireEvent.click(screen.getByRole('button', { name: /منزلق المقارنة/i }));
    const slider = screen.getByLabelText('منزلق مقارنة قبل وبعد');
    fireEvent.change(slider, { target: { value: '75' } });
    expect(screen.getByText('75%')).toBeInTheDocument();

    // Switch to Social Media Platform Frame Mockup preview mode
    fireEvent.click(screen.getByRole('button', { name: /إطار المنصة/i }));
    expect(screen.getByText('RADAR Store Official')).toBeInTheDocument();

    // Switch to Result Only preview mode
    fireEvent.click(screen.getByRole('button', { name: /النتيجة/i }));
    expect(screen.getByText('1080 × 1920 (9:16)')).toBeInTheDocument();

    // Verify download workflow before completing
    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    fireEvent.click(screen.getByRole('button', { name: /JPEG/i }));
    fireEvent.click(screen.getByRole('button', { name: /تحميل الصورة \(1080×1920\)/i }));

    await waitFor(() => {
      expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    });
    anchorClickSpy.mockRestore();
  });

  it('propagates real backend API errors cleanly without falling back to fake images', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        success: false,
        error: 'خدمة توليد الصور بالذكاء الاصطناعي غير مهيأة حالياً',
      }),
    }) as unknown as typeof fetch;

    render(<ProductImageStudio />);

    fireEvent.change(screen.getByLabelText('اسم المنتج أو وصفه'), {
      target: { value: 'ساعة ذكية رياضية' },
    });
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'خدمة توليد الصور بالذكاء الاصطناعي غير مهيأة حالياً'
    );
    expect(screen.queryByRole('button', { name: /تحميل الصورة/i })).not.toBeInTheDocument();
  });

  it('keeps @google/genai strictly server-side and uses recommended image models', () => {
    const clientSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ProductImageStudio.tsx'),
      'utf8'
    );
    const serverSource = fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf8');

    expect(clientSource).not.toContain('@google/genai');
    expect(clientSource).not.toContain('GEMINI_API_KEY');
    expect(serverSource).toContain('/api/product-image-studio/generate');
    expect(serverSource).toContain('gemini-3.1-flash-lite-image');
    expect(serverSource).toContain('gemini-nano-banana-2.1');
  });

  it('exports all session generated images as a compressed ZIP archive when clicking تصدير الكل', async () => {
    const JSZip = (await import('jszip')).default;
    const sampleBase64A = Buffer.from('PNG_A').toString('base64');
    const sampleBase64B = Buffer.from('PNG_B').toString('base64');

    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          imageUrl: `data:image/png;base64,${sampleBase64A}`,
          mimeType: 'image/png',
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '1:1',
          resolution: '1K',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          imageUrl: `data:image/png;base64,${sampleBase64B}`,
          mimeType: 'image/png',
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '16:9',
          resolution: '1K',
        }),
      });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const onShowToast = vi.fn();
    render(<ProductImageStudio onShowToast={onShowToast} />);

    // Generate image 1
    fireEvent.change(screen.getByLabelText('اسم المنتج أو وصفه'), {
      target: { value: 'قهوة عربية فاخرة' },
    });
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));

    await waitFor(() => {
      expect(screen.getByText(/سجل التصاميم المولدة في هذه الجلسة \(1\)/i)).toBeInTheDocument();
    });

    // Generate image 2 with different platform preset
    fireEvent.click(screen.getByRole('button', { name: /غلاف يوتيوب \/ بنر إعلاني/i }));
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));

    await waitFor(() => {
      expect(screen.getByText(/سجل التصاميم المولدة في هذه الجلسة \(2\)/i)).toBeInTheDocument();
    });

    let capturedBlob: Blob | null = null;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn((obj: Blob | MediaSource) => {
      capturedBlob = obj as Blob;
      return 'blob:mock-zip-url';
    });
    URL.revokeObjectURL = vi.fn();

    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const exportAllButton = screen.getByRole('button', { name: /تصدير الكل/i });
    fireEvent.click(exportAllButton);

    await waitFor(() => {
      expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    });

    expect(capturedBlob).not.toBeNull();
    const arrayBuf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(capturedBlob!);
    });
    const loadedZip = await JSZip.loadAsync(arrayBuf);
    const archivedFiles = Object.keys(loadedZip.files).filter((name) => !loadedZip.files[name].dir);
    expect(archivedFiles).toHaveLength(2);
    expect(archivedFiles[0]).toMatch(/radar-studio-exports\/01-.*-1920x1080\.png$/);
    expect(archivedFiles[1]).toMatch(/radar-studio-exports\/02-.*-1080x1080\.png$/);
    expect(onShowToast).toHaveBeenCalledWith('تم ضغط وتصدير جميع الصور (2) في ملف ZIP بنجاح.');

    anchorClickSpy.mockRestore();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('displays Thumbnail Gallery grid below preview and supports Quick View zoom, navigation, and close', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          imageUrl: 'data:image/png;base64,IMG_ONE',
          mimeType: 'image/png',
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '1:1',
          resolution: '1K',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          imageUrl: 'data:image/png;base64,IMG_TWO',
          mimeType: 'image/png',
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '4:3',
          resolution: '1K',
        }),
      });
    global.fetch = fetchSpy as unknown as typeof fetch;

    render(<ProductImageStudio />);

    fireEvent.change(screen.getByLabelText('اسم المنتج أو وصفه'), {
      target: { value: 'سماعة لاسلكية احترافية' },
    });

    // Generate 1st image (luxury_marble 1:1)
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));
    await waitFor(() => {
      expect(screen.getByText('معرض مصغر (Gallery)')).toBeInTheDocument();
    });

    // Generate 2nd image (neon_tech 4:3)
    fireEvent.click(screen.getByRole('button', { name: /إضاءة تقنية عصرية/i }));
    fireEvent.click(screen.getByRole('button', { name: /منشور فيسبوك \/ إكس/i }));
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    // Click first thumbnail in Gallery to open Quick View
    const quickViewTriggers = screen.getAllByRole('button', { name: /تكبير سريع:/i });
    fireEvent.click(quickViewTriggers[0]);

    const dialog = await screen.findByRole('dialog', { name: /التكبير السريع للصورة/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('100%')).toBeInTheDocument();
    expect(within(dialog).getByText(/صورة 1 من 2/i)).toBeInTheDocument();

    // Test Quick View zoom in / zoom out
    fireEvent.click(within(dialog).getByRole('button', { name: 'تكبير العرض' }));
    expect(within(dialog).getByText('150%')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'تصغير العرض' }));
    expect(within(dialog).getByText('100%')).toBeInTheDocument();

    // Test Next/Previous navigation in Quick View
    fireEvent.click(within(dialog).getByRole('button', { name: 'الصورة التالية' }));
    expect(within(dialog).getByText(/صورة 2 من 2/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'الصورة السابقة' }));
    expect(within(dialog).getByText(/صورة 1 من 2/i)).toBeInTheDocument();

    // Close Quick View
    fireEvent.click(within(dialog).getByRole('button', { name: 'إغلاق التكبير السريع' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('compares two different generated images side-by-side before export with swap and direct export controls', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          imageUrl: 'data:image/png;base64,STYLE_ONE',
          mimeType: 'image/png',
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '1:1',
          resolution: '1K',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          imageUrl: 'data:image/png;base64,STYLE_TWO',
          mimeType: 'image/png',
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '4:3',
          resolution: '1K',
        }),
      });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const onShowToast = vi.fn();
    render(<ProductImageStudio onShowToast={onShowToast} />);

    fireEvent.change(screen.getByLabelText('اسم المنتج أو وصفه'), {
      target: { value: 'حذاء رياضي كلاسيك' },
    });

    // Generate 1st variation
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    // With only 1 variation, compare_two shows helpful guidance
    fireEvent.click(screen.getByRole('button', { name: /مقارنة صورتين/i }));
    expect(
      screen.getByText(/يلزم توليد صورتين مختلفتين على الأقل للمقارنة بينهما جنباً إلى جنب قبل التصدير/i)
    ).toBeInTheDocument();

    // Generate 2nd variation with different backdrop & platform
    fireEvent.click(screen.getByRole('button', { name: /إضاءة تقنية عصرية/i }));
    fireEvent.click(screen.getByRole('button', { name: /منشور فيسبوك \/ إكس/i }));
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    // Enter two-image comparison mode
    fireEvent.click(screen.getByRole('button', { name: /مقارنة صورتين/i }));

    const compareContainer = screen.getByLabelText('مقارنة صورتين مولدتين جنباً إلى جنب');
    expect(compareContainer).toBeInTheDocument();
    expect(within(compareContainer).getByText(/الصورة الأولى \(أ\): إضاءة تقنية عصرية/i)).toBeInTheDocument();
    expect(within(compareContainer).getByText(/الصورة الثانية \(ب\): رخام فاخر وإضاءة استوديو/i)).toBeInTheDocument();

    // Swap positions
    fireEvent.click(screen.getByRole('button', { name: 'تبديل موضعي الصورتين' }));
    expect(within(compareContainer).getByText(/الصورة الأولى \(أ\): رخام فاخر وإضاءة استوديو/i)).toBeInTheDocument();
    expect(within(compareContainer).getByText(/الصورة الثانية \(ب\): إضاءة تقنية عصرية/i)).toBeInTheDocument();

    // Approve first variation and export directly from comparison card
    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const exportButtons = within(compareContainer).getAllByRole('button', { name: 'تصدير' });
    fireEvent.click(exportButtons[0]);

    await waitFor(() => {
      expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    });
    anchorClickSpy.mockRestore();
  });

  it('applies ready-made design templates (dimensions, background, lighting) in one click and preserves lighting on generation', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        imageUrl: 'data:image/png;base64,TEMPLATE_GENERATED',
        mimeType: 'image/png',
        model: 'gemini-3.1-flash-lite-image',
        aspectRatio: '3:4',
        resolution: '1K',
      }),
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const onShowToast = vi.fn();
    render(<ProductImageStudio onShowToast={onShowToast} />);

    // Filter templates by category 'حملات وعروض'
    const templatesSection = screen.getByLabelText('مكتبة قوالب التصميم الجاهزة');
    fireEvent.click(within(templatesSection).getByRole('button', { name: 'حملات وعروض' }));

    // Apply 'قالب العروض الشرقية والذهبية' in one click
    const goldenTemplateBtn = within(templatesSection).getByRole('button', {
      name: /قالب العروض الشرقية والذهبية/i,
    });
    fireEvent.click(goldenTemplateBtn);

    expect(goldenTemplateBtn).toHaveAttribute('aria-pressed', 'true');
    expect(within(goldenTemplateBtn).getByText('مُطبّق')).toBeInTheDocument();
    expect(screen.getByText('الأبعاد الحالية: 1080 × 1440')).toBeInTheDocument();
    expect(screen.getByText('النسبة: 3:4')).toBeInTheDocument();
    expect(screen.getByText('الإضاءة: إضاءة درامية ذهبية دافئة')).toBeInTheDocument();
    expect(onShowToast).toHaveBeenCalledWith(
      'تم تطبيق «قالب العروض الشرقية والذهبية» (الأبعاد، الخلفية، والإضاءة) بنجاح.'
    );

    // Custom prompt textarea is pre-populated with template lighting prompt
    const promptTextarea = screen.getByLabelText('توجيه ديكوري إضافي (اختياري)') as HTMLTextAreaElement;
    expect(promptTextarea.value).toContain('Warm golden ambient bokeh glow');

    // Generate using the template settings
    fireEvent.change(screen.getByLabelText('اسم المنتج أو وصفه'), {
      target: { value: 'طقم فناجين قهوة ذهبي' },
    });
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const sentPayload = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(sentPayload).toMatchObject({
      stylePresetId: 'ramadan_arabesque',
      platformPresetId: 'instagram_portrait',
      aspectRatio: '3:4',
      resolution: '1K',
    });
    expect(sentPayload.customPrompt).toContain('Warm golden ambient bokeh glow');

    // Verify template lighting brightness (98%) & contrast (110%) were preserved after generation
    await waitFor(() => {
      expect(screen.getByText('98%')).toBeInTheDocument();
      expect(screen.getByText('110%')).toBeInTheDocument();
    });
  });

  it('supports uploading multiple user product photos from device, switching the active base photo, and sending it to AI generation', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        imageUrl: 'data:image/png;base64,USER_PRODUCT_ENHANCED',
        mimeType: 'image/png',
        model: 'gemini-3.1-flash-lite-image',
        aspectRatio: '1:1',
        resolution: '1K',
      }),
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const onShowToast = vi.fn();
    render(<ProductImageStudio onShowToast={onShowToast} />);

    // Initially in template/description base mode
    expect(screen.getByText('قاعدة: القوالب والوصف')).toBeInTheDocument();

    // Upload two product photos from device
    const fileInput = screen.getByLabelText('رفع صورة المنتج') as HTMLInputElement;
    const bagFile = new File(['BAG_BYTES'], 'leather-bag.png', { type: 'image/png' });
    const watchFile = new File(['WATCH_BYTES'], 'smart-watch.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [bagFile, watchFile] } });

    await waitFor(() => {
      const library = screen.getByRole('list', { name: 'مكتبة صور منتجاتي المرفوعة' });
      expect(within(library).getAllByRole('listitem')).toHaveLength(2);
    });

    expect(screen.getByText('قاعدة: صورة منتجك الخاصة')).toBeInTheDocument();

    // Switch active base photo explicitly to leather-bag.png
    const selectBagBtn = screen.getByRole('button', { name: 'تعيين كقاعدة أساسية: leather-bag.png' });
    fireEvent.click(selectBagBtn);
    expect(selectBagBtn).toHaveAttribute('aria-pressed', 'true');

    // Toggle pausing base image vs re-enabling
    fireEvent.click(screen.getByRole('button', { name: /إيقاف استخدام الصورة/i }));
    expect(screen.getByText('قاعدة: القوالب والوصف')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /تفعيل الصورة كقاعدة أساسية/i }));
    expect(screen.getByText('قاعدة: صورة منتجك الخاصة')).toBeInTheDocument();

    // Apply a ready-made template and confirm uploaded photo remains active base image
    fireEvent.click(screen.getByRole('button', { name: /قالب أمازون ونون القياسي/i }));
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const payload = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(payload.stylePresetId).toBe('pure_commercial_white');
    expect(payload.imageBase64).toContain(Buffer.from('BAG_BYTES').toString('base64'));
  });

  it('removes original product background using @imgly/background-removal and activates transparent PNG cutout', async () => {
    const cutoutBlob = new Blob(['CUTOUT_PNG_BYTES'], { type: 'image/png' });
    mockRemoveBackground.mockReset();
    mockRemoveBackground.mockImplementation(async (_src: unknown, config?: { progress?: (k: string, c: number, t: number) => void }) => {
      config?.progress?.('compute:inference', 1, 1);
      return cutoutBlob;
    });

    const onShowToast = vi.fn();
    render(<ProductImageStudio onShowToast={onShowToast} />);

    // Upload original product photo
    const fileInput = screen.getByLabelText('رفع صورة المنتج') as HTMLInputElement;
    const rawPhoto = new File(['RAW_SHOE_PHOTO'], 'sneaker.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [rawPhoto] } });

    await waitFor(() => {
      expect(screen.getAllByText('sneaker.jpg').length).toBeGreaterThanOrEqual(1);
    });

    // Click 'إزالة الخلفية'
    const removeBgBtn = screen.getByRole('button', { name: 'إزالة الخلفية' });
    fireEvent.click(removeBgBtn);

    await waitFor(() => {
      expect(mockRemoveBackground).toHaveBeenCalledTimes(1);
    });

    expect(mockRemoveBackground.mock.calls[0][1]).toMatchObject({
      output: { format: 'image/png', quality: 0.95 },
    });

    // Cutout PNG is added to library and activated
    await waitFor(() => {
      expect(screen.getAllByText('sneaker-nobg.png').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/تم تفريغ الخلفية \(PNG شفاف/i)).toBeInTheDocument();
    });

    expect(onShowToast).toHaveBeenCalledWith(
      'تم تفريغ الخلفية الأصلية للصورة بنجاح! الصورة المفرغة جاهزة الآن للتوليد.'
    );
  });

  it('shows clear Arabic error alert if @imgly/background-removal fails', async () => {
    mockRemoveBackground.mockReset();
    mockRemoveBackground.mockRejectedValueOnce(new Error('WASM initialization failed'));

    const onShowToast = vi.fn();
    render(<ProductImageStudio onShowToast={onShowToast} />);

    const fileInput = screen.getByLabelText('رفع صورة المنتج') as HTMLInputElement;
    const rawPhoto = new File(['RAW_PHOTO'], 'lamp.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [rawPhoto] } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'إزالة الخلفية' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'إزالة الخلفية' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'تعذر إزالة الخلفية تلقائياً: WASM initialization failed'
    );
  });

  it('filters and applies smart artistic styles (restaurant photography & playful cartoon) and sends artisticFilterId to AI backend', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          imageUrl: 'data:image/png;base64,STANDARD_IMG',
          mimeType: 'image/png',
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '1:1',
          resolution: '1K',
          artisticFilterId: 'none',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          imageUrl: 'data:image/png;base64,CARTOON_IMG',
          mimeType: 'image/png',
          model: 'gemini-3.1-flash-lite-image',
          aspectRatio: '1:1',
          resolution: '1K',
          artisticFilterId: 'playful_cartoon',
        }),
      });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const onShowToast = vi.fn();
    render(<ProductImageStudio onShowToast={onShowToast} />);

    const filtersSection = screen.getByLabelText('قائمة الفلاتر الذكية للأنماط الفنية');
    expect(filtersSection).toBeInTheDocument();

    // Filter by 'تجاري وضيافة' and pick 'تصوير مطاعم احترافي'
    fireEvent.click(within(filtersSection).getByRole('button', { name: 'تجاري وضيافة' }));
    const restaurantFilterBtn = within(filtersSection).getByRole('button', {
      name: /تصوير مطاعم احترافي/i,
    });
    fireEvent.click(restaurantFilterBtn);
    expect(restaurantFilterBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('الفلتر الفني: تصوير مطاعم احترافي')).toBeInTheDocument();

    // Reset filter back to standard 'none' before initial generation
    fireEvent.click(within(filtersSection).getByRole('button', { name: /إلغاء الفلتر/i }));
    expect(screen.queryByText(/الفلتر الفني:/i)).not.toBeInTheDocument();

    // Generate standard image first
    fireEvent.change(screen.getByLabelText('اسم المنتج أو وصفه'), {
      target: { value: 'برجر دجاج مقرمش' },
    });
    fireEvent.click(screen.getByRole('button', { name: /توليد الخلفية بالذكاء الاصطناعي/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    expect(JSON.parse(fetchSpy.mock.calls[0][1].body).artisticFilterId).toBe('none');

    // Switch smart filter category to 'كرتوني ومرح' and select 'نمط كرتوني للتسويق المرح'
    fireEvent.click(within(filtersSection).getByRole('button', { name: 'كرتوني ومرح' }));
    const cartoonBtn = within(filtersSection).getByRole('button', {
      name: /نمط كرتوني للتسويق المرح/i,
    });
    fireEvent.click(cartoonBtn);

    // Live CSS preview filter applies immediately on the preview stage image
    const previewImg = await screen.findByAltText(/النتيجة المولدة/i);
    expect(previewImg.style.filter).toContain('saturate(160%)');

    // Click 1-click AI generation button in the active smart filter bar
    fireEvent.click(
      within(filtersSection).getByRole('button', { name: /توليد بالذكاء الاصطناعي بهذا الفلتر/i })
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
    const secondPayload = JSON.parse(fetchSpy.mock.calls[1][1].body);
    expect(secondPayload.artisticFilterId).toBe('playful_cartoon');

    // Confirm generated variation records the artistic filter label in Gallery & Toast
    await waitFor(() => {
      const gallery = screen.getByLabelText('معرض مصغر للصور المولدة');
      expect(within(gallery).getByText('نمط كرتوني للتسويق المرح')).toBeInTheDocument();
    });
    expect(onShowToast).toHaveBeenCalledWith(
      'تم توليد الصورة بنمط «نمط كرتوني للتسويق المرح» بنجاح!'
    );
  });
});
