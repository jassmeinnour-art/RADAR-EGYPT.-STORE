import React from 'react';

interface PlatformDynamicBrandIconProps {
  code: string;
  name?: string;
  className?: string;
}

export const PlatformDynamicBrandIcon: React.FC<PlatformDynamicBrandIconProps> = ({
  code,
  name = '',
  className = 'w-8 h-8',
}) => {
  const normalized = (code + ' ' + name).toLowerCase();

  // 1. Amazon Egypt
  if (normalized.includes('amazon') || normalized.includes('أمازون') || normalized.includes('amz')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار أمازون مصر"
      >
        <rect width="32" height="32" rx="8" fill="#232F3E" />
        {/* Amazon Signature Smile Curve Arrow */}
        <path
          d="M7 21C11.5 24 19.5 24 24.5 19.2"
          stroke="#FF9900"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M22.8 18.2L25.4 19.5L24.8 22.4"
          stroke="#FF9900"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stylized 'a' letter */}
        <path
          d="M10.8 16.2C10.8 14.2 12.3 12.8 14.8 12.8C17.3 12.8 18.4 14 18.4 16V19.5M18.4 16.2C18.4 17.8 17 19.2 14.8 19.2C13 19.2 12 18.1 12 16.8C12 15.4 13.2 14.6 15.3 14.6C16.6 14.6 17.8 15 18.4 15.4"
          stroke="#FFFFFF"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 2. Noon Egypt
  if (normalized.includes('noon') || normalized.includes('نون')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار نون مصر"
      >
        <rect width="32" height="32" rx="8" fill="#FEEE00" />
        {/* Noon Iconic Loop & Arabic Noon Dot */}
        <circle cx="16" cy="14.8" r="7.5" stroke="#000000" strokeWidth="2.3" />
        <circle cx="16" cy="14.8" r="3.2" fill="#000000" />
        <circle cx="16" cy="9.2" r="1.4" fill="#000000" />
        {/* Noon underline / brand smile */}
        <path d="M11.5 24.5H20.5" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  // 3. Jumia Egypt
  if (normalized.includes('jumia') || normalized.includes('جوميا')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار جوميا مصر"
      >
        <rect width="32" height="32" rx="8" fill="#F68B1E" />
        {/* Jumia Iconic 5-point Star */}
        <path
          d="M16 7.5L18.6 13L24.5 13.8L20.2 18L21.3 24L16 21L10.7 24L11.8 18L7.5 13.8L13.4 13L16 7.5Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 4. Facebook Marketplace / Meta
  if (
    normalized.includes('facebook') ||
    normalized.includes('فيسبوك') ||
    normalized.includes('meta') ||
    normalized.includes('ميتا')
  ) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار فيسبوك ماركت بليس"
      >
        <rect width="32" height="32" rx="8" fill="#1877F2" />
        {/* Facebook 'f' */}
        <path
          d="M19.5 11.5H16.8C15.4 11.5 14.5 12.4 14.5 13.8V16H12V19.2H14.5V26H17.8V19.2H20.5L21 16H17.8V14.2C17.8 13.6 18.2 13.2 18.8 13.2H20V11.5Z"
          fill="#FFFFFF"
        />
        {/* Marketplace Awning Badge */}
        <circle cx="23.5" cy="8.5" r="3.5" fill="#FF5E3A" />
        <path d="M22 8.5H25M23.5 7V10" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  // 5. TikTok Shop
  if (normalized.includes('tiktok') || normalized.includes('تيك توك')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار تيك توك شوب"
      >
        <rect width="32" height="32" rx="8" fill="#0A0A0A" />
        {/* TikTok Dual Cyan/Magenta Note */}
        <path
          d="M18.8 9.5C19.8 11.2 21.5 12.5 23.2 12.8V15.5C21.4 15.5 19.8 14.8 18.8 13.8V20.2C18.8 22.8 16.6 25 14 25C11.4 25 9.2 22.8 9.2 20.2C9.2 17.7 11.4 15.5 14 15.5C14.4 15.5 14.9 15.6 15.3 15.7V18.5C14.9 18.3 14.5 18.2 14 18.2C12.9 18.2 12 19.1 12 20.2C12 21.3 12.9 22.2 14 22.2C15.1 22.2 16 21.3 16 20.2V7H18.8V9.5Z"
          fill="#00F2FE"
        />
        <path
          d="M19.5 8.5C20.5 10.2 22.2 11.5 24 11.8V14.5C22.2 14.5 20.6 13.8 19.5 12.8V19.2C19.5 21.8 17.3 24 14.8 24C12.2 24 10 21.8 10 19.2C10 16.7 12.2 14.5 14.8 14.5C15.2 14.5 15.7 14.6 16.1 14.7V17.5C15.7 17.3 15.3 17.2 14.8 17.2C13.7 17.2 12.8 18.1 12.8 19.2C12.8 20.3 13.7 21.2 14.8 21.2C15.9 21.2 16.8 20.3 16.8 19.2V6H19.5V8.5Z"
          fill="#FE0979"
          opacity="0.85"
        />
        <path
          d="M19 9C20 10.7 21.7 12 23.5 12.3V15C21.7 15 20.1 14.3 19 13.3V19.7C19 22.3 16.8 24.5 14.3 24.5C11.7 24.5 9.5 22.3 9.5 19.7C9.5 17.2 11.7 15 14.3 15C14.7 15 15.2 15.1 15.6 15.2V18C15.2 17.8 14.8 17.7 14.3 17.7C13.2 17.7 12.3 18.6 12.3 19.7C12.3 20.8 13.2 21.7 14.3 21.7C15.4 21.7 16.3 20.8 16.3 19.7V6.5H19V9Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 6. B.TECH Egypt
  if (normalized.includes('btech') || normalized.includes('بي تك') || normalized.includes('بي_تك')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار بي تك مصر"
      >
        <rect width="32" height="32" rx="8" fill="#003882" />
        <path
          d="M9.5 8.5H17C19.2 8.5 20.8 9.7 20.8 11.5C20.8 12.7 20 13.7 18.8 14.1C20.4 14.6 21.4 15.8 21.4 17.5C21.4 19.8 19.6 21.5 17 21.5H9.5V8.5ZM13.2 13.5H16.2C17.1 13.5 17.8 12.9 17.8 12C17.8 11.1 17.1 10.7 16.2 10.7H13.2V13.5ZM13.2 19.2H16.5C17.5 19.2 18.2 18.6 18.2 17.5C18.2 16.5 17.5 16 16.5 16H13.2V19.2Z"
          fill="#FFFFFF"
        />
        <circle cx="23.5" cy="20" r="2.2" fill="#FDB813" />
      </svg>
    );
  }

  // 7. ElAraby Group
  if (normalized.includes('elaraby') || normalized.includes('العربي')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار العربي جروب"
      >
        <rect width="32" height="32" rx="8" fill="#991B1B" />
        <circle cx="16" cy="16" r="10" stroke="#FDE047" strokeWidth="1.6" />
        <path
          d="M12 18.5C12 15 14 12 17.5 12C19.5 12 21 13 21 14.5C21 16 19.5 16.8 18 17.2C15.5 17.8 13.5 18.2 13 20H22"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="17.5" cy="9.5" r="1.3" fill="#FDE047" />
      </svg>
    );
  }

  // 8. Raneen Egypt
  if (normalized.includes('raneen') || normalized.includes('رنين')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار رنين مصر"
      >
        <rect width="32" height="32" rx="8" fill="#9D174D" />
        <path
          d="M16 8C13.5 8 11.5 10 11.5 12.5V17L9.5 19V20.5H22.5V19L20.5 17V12.5C20.5 10 18.5 8 16 8Z"
          fill="#FDE047"
        />
        <path
          d="M14.5 22C14.5 22.8 15.2 23.5 16 23.5C16.8 23.5 17.5 22.8 17.5 22"
          stroke="#FDE047"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="16" cy="6.5" r="1.2" fill="#FDE047" />
      </svg>
    );
  }

  // 9. Homzmart
  if (normalized.includes('homzmart') || normalized.includes('هومزمارت')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار هومزمارت"
      >
        <rect width="32" height="32" rx="8" fill="#0F766E" />
        <path d="M16 8.5L8.5 14.5V23.5H23.5V14.5L16 8.5Z" fill="#FFFFFF" opacity="0.9" />
        <path d="M13.5 23.5V16H18.5V23.5" fill="#0F766E" />
        <path d="M7 14L16 6.8L25 14" stroke="#FDE047" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  // 10. Kenzz
  if (normalized.includes('kenzz') || normalized.includes('كنز')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار كنز"
      >
        <rect width="32" height="32" rx="8" fill="#6D28D9" />
        <path d="M10 13L16 8L22 13L19.5 23H12.5L10 13Z" fill="#FBBF24" />
        <circle cx="16" cy="16" r="2.5" fill="#FFFFFF" />
        <path d="M12.5 13L16 18.5L19.5 13" stroke="#D97706" strokeWidth="1.2" />
      </svg>
    );
  }

  // 11. 2B Egypt
  if (normalized.includes('twob') || normalized.includes('2b') || normalized.includes('تو بي')) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار 2B مصر"
      >
        <rect width="32" height="32" rx="8" fill="#0284C7" />
        <text
          x="16"
          y="21.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="14"
          fill="#FFFFFF"
          textAnchor="middle"
          letterSpacing="-0.5"
        >
          2B
        </text>
      </svg>
    );
  }

  // 12. Shopify / Salla / Zid / Private Web Store
  if (
    normalized.includes('shopify') ||
    normalized.includes('salla') ||
    normalized.includes('zid') ||
    normalized.includes('سلة') ||
    normalized.includes('زد') ||
    normalized.includes('شوبيفاي') ||
    normalized.includes('متجر')
  ) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="شعار المتجر الإلكتروني"
      >
        <rect width="32" height="32" rx="8" fill="#15803D" />
        {/* Shopping bag with S lettermark */}
        <path d="M12 11C12 8.8 13.8 7 16 7C18.2 7 20 8.8 20 11V12H12V11Z" stroke="#FFFFFF" strokeWidth="2" />
        <path
          d="M9 12H23L21.5 24.5C21.4 25.3 20.7 26 19.9 26H12.1C11.3 26 10.6 25.3 10.5 24.5L9 12Z"
          fill="#FFFFFF"
        />
        <path
          d="M17.5 16C17.5 15.2 16.8 14.5 16 14.5C15.2 14.5 14.5 15.2 14.5 16C14.5 17.5 17.5 18 17.5 19.5C17.5 20.3 16.8 21 16 21C15.2 21 14.5 20.3 14.5 19.5"
          stroke="#15803D"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Fallback: Dynamic colored initial badge based on platform name
  const initials = (name || code).replace(/[^a-zA-Z\u0621-\u064A0-9]/g, '').slice(0, 2) || 'م';
  return (
    <div
      className={`${className} rounded-lg bg-linear-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center text-white font-black text-xs select-none shadow-md border border-white/20 font-['Cairo']`}
      aria-label={`أيقونة قناة ${name || code}`}
    >
      <span>{initials}</span>
    </div>
  );
};

export default PlatformDynamicBrandIcon;
