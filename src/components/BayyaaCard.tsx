import React from 'react';
import headerBrandLogo from '../assets/images/regenerated_image_1793023955535.png';
import { useVisualCustomizer, DEFAULT_VISUAL_SETTINGS } from '../context/VisualCustomizerContext';

interface BayyaaCardProps {
  onSubscribe?: () => void;
  showOfficialLogoImage?: boolean;
  className?: string;
}

export function BayyaaCard({ 
  onSubscribe, 
  showOfficialLogoImage = true,
  className = ''
}: BayyaaCardProps) {
  let settings = DEFAULT_VISUAL_SETTINGS;
  try {
    const customizer = useVisualCustomizer();
    if (customizer?.settings) {
      settings = customizer.settings;
    }
  } catch {
    // Safe fallback if rendered outside provider
  }

  return (
    <div
      className={className}
      style={{
        background: settings.cardBackgroundColor || '#ffffff',
        borderRadius: `${settings.cardBorderRadius}px`,
        border: `${settings.cardBorderWidth || 2}px solid ${settings.cardBorderColor || '#ff6b00'}`,
        padding: `${settings.cardPadding}px 24px`,
        width: '100%',
        maxWidth: `${settings.cardMaxWidth}px`,
        margin: '20px auto',
        boxShadow: '0 10px 25px rgba(255, 107, 0, 0.15)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
      }}
      dir="rtl"
    >
      {/* الهيدر: الشعار والعنوان */}
      <div
        dir="rtl"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '16px',
          marginBottom: '20px',
          gap: '16px',
          textAlign: 'right'
        }}
      >
        <div dir="rtl" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span
            style={{
              background: '#fff3eb',
              color: '#ff6b00',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '4px 10px',
              borderRadius: '20px',
              display: 'inline-block',
              marginBottom: '4px',
              textAlign: 'right',
              direction: 'rtl'
            }}
          >
            المنصة الرسمية
          </span>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '4px 0 2px 0',
              textAlign: 'right',
              direction: 'rtl',
              unicodeBidi: 'plaintext'
            }}
          >
            منصة بياع (BAYYAA)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, textAlign: 'right', direction: 'rtl', unicodeBidi: 'plaintext' }}>
            سوق إلكتروني متكامل للتاجر المصري
          </p>
        </div>

        {/* أيقونة اللوجو */}
        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ff6b00 0%, #ff8800 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,107,0,0.3)',
            flexShrink: 0,
            overflow: 'hidden',
            padding: showOfficialLogoImage ? '4px' : undefined
          }}
        >
          {showOfficialLogoImage ? (
            <img
              src={headerBrandLogo}
              alt="شعار منصة بياع الرسمية"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'block';
                }
              }}
            />
          ) : null}
          <span
            style={{
              fontSize: '32px',
              color: '#fff',
              fontWeight: 'bold',
              display: showOfficialLogoImage ? 'none' : 'block'
            }}
          >
            🛒
          </span>
        </div>
      </div>

      {/* المحتوى الرئيسي للإعلان بأسطر مستقلة ومضبوطة بدقة */}
      <div dir="rtl" style={{ textAlign: 'center', marginBottom: '22px', overflowX: 'auto', direction: 'rtl' }}>
        {/* السطر الأول المستقل: انضم الآن إلى منصة بياع */}
        <h3
          style={{
            fontSize: `${settings.titleFontSize}px`,
            fontWeight: '900',
            color: '#0f172a',
            lineHeight: '1.3',
            margin: '0 0 4px 0',
            textAlign: 'center',
            direction: 'rtl',
            unicodeBidi: 'plaintext',
            whiteSpace: settings.textWrapMode
          }}
        >
          🚀 انضم الآن إلى منصة بياع
        </h3>

        {/* السطر الثاني المستقل: كلمة Bayyaa وحدها في سطر مستقل تماماً */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: '900',
            color: '#ff6b00',
            fontFamily: 'monospace',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            margin: '0 0 10px 0',
            textAlign: 'center',
            direction: 'ltr',
            whiteSpace: 'nowrap'
          }}
        >
          (Bayyaa)
        </div>

        {/* السطر الثالث المستقل: ابدأ بإدراج منتجاتك وتوسيع مبيعاتك عبر منصتنا الجديدة! */}
        <p
          style={{
            fontSize: `${settings.bodyFontSize}px`,
            color: '#334155',
            fontWeight: '700',
            margin: '0 0 16px 0',
            textAlign: 'center',
            direction: 'rtl',
            unicodeBidi: 'plaintext',
            whiteSpace: settings.textWrapMode,
            lineHeight: '1.5'
          }}
        >
          ابدأ بإدراج منتجاتك وتوسيع مبيعاتك عبر منصتنا الجديدة!
        </p>

        {/* النص التعريفي الأخير في سطر واحد متصل ومنسق بوضوح */}
        <div
          dir="rtl"
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '12px 16px',
            textAlign: 'right',
            direction: 'rtl',
            overflowX: 'auto'
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: '#475569',
              fontWeight: '700',
              lineHeight: '1.6',
              margin: 0,
              textAlign: 'right',
              direction: 'rtl',
              unicodeBidi: 'plaintext',
              whiteSpace: settings.textWrapMode
            }}
          >
            عمولة تنافسية، تحويل فوري للأرباح، ربط شامل للمخزون، ولوحة تحكم ذكية مدعومة بالذكاء الاصطناعي.
          </p>
        </div>
      </div>

      {/* مميزات المنصة الأفقية */}
      <div
        style={{
          background: '#fff8f2',
          borderRadius: '12px',
          border: '1px solid #ffd8bf',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: '8px',
          fontSize: '13px',
          color: '#c2410c',
          fontWeight: '700',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}
      >
        <span>✨ عمولة تنافسية</span>
        <span>⚡ تحويل فوري للأرباح</span>
        <span>📦 ربط شامل للمخزون</span>
        <span>🤖 لوحة تحكم ذكية</span>
      </div>

      {/* حاوية زر الاشتراك لضبط المحاذاة والعرض */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: settings.buttonAlignment === 'right' 
            ? 'flex-start' 
            : settings.buttonAlignment === 'left' 
            ? 'flex-end' 
            : 'center'
        }}
      >
        <button
          type="button"
          onClick={onSubscribe}
          dir="rtl"
          style={{
            width: settings.buttonWidthMode === 'full' 
              ? '100%' 
              : settings.buttonWidthMode === 'custom' 
              ? `${settings.buttonCustomWidth}px` 
              : 'auto',
            boxSizing: 'border-box',
            marginTop: `${settings.buttonMarginTop}px`,
            marginLeft: `${settings.buttonMarginLeft}px`,
            marginRight: `${settings.buttonMarginRight}px`,
            transform: `translateX(${settings.buttonTranslateX}px)`,
            padding: `${settings.buttonPaddingY}px ${settings.buttonPaddingX}px`,
            minHeight: '52px',
            background: `linear-gradient(135deg, ${settings.buttonColorStart || '#ff6b00'} 0%, ${settings.buttonColorEnd || '#e65c00'} 100%)`,
            color: settings.buttonTextColor || '#ffffff',
            border: 'none',
            borderRadius: `${settings.buttonBorderRadius}px`,
            fontSize: `${settings.buttonFontSize}px`,
            fontWeight: settings.buttonFontWeight,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            textAlign: 'center',
            direction: 'rtl',
            unicodeBidi: 'plaintext',
            boxShadow: '0 6px 20px rgba(255, 107, 0, 0.35)',
            transition: 'all 0.2s ease-in-out',
            whiteSpace: settings.textWrapMode
          }}
        >
          <span style={{ fontSize: '18px', display: 'inline-flex', alignItems: 'center' }} aria-hidden="true">
            🛍️
          </span>
          <span style={{ fontWeight: settings.buttonFontWeight, letterSpacing: '0.2px' }}>
            اشترك الآن وأضف منتجاتك في منصة بياع
          </span>
          <span style={{ fontSize: '18px', display: 'inline-flex', alignItems: 'center' }} aria-hidden="true">
            👈
          </span>
        </button>
      </div>
    </div>
  );
}

export default BayyaaCard;
