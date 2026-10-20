import React, { useState, useEffect } from 'react';
import { RefreshCw, Crosshair, Globe2, Presentation } from 'lucide-react';

export interface MarketplaceLiveNode {
  id: 'amazon' | 'noon' | 'jumia';
  name: string;
  regionCode: string;
  regionLabel: string;
  usdPrice: number;
  egpPrice: number;
  buyBoxRate: string;
  latencyMs: number;
  skuCount: string;
}

const INITIAL_MARKETPLACE_NODES: Record<'amazon' | 'noon' | 'jumia', MarketplaceLiveNode> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    regionCode: 'US · TRACKING',
    regionLabel: 'الولايات المتحدة ومصر وأوروبا',
    usdPrice: 119.99,
    egpPrice: 5940,
    buyBoxRate: '94.2%',
    latencyMs: 380,
    skuCount: '1.8M+ SKUs',
  },
  noon: {
    id: 'noon',
    name: 'Noon',
    regionCode: 'AE · TRACKING',
    regionLabel: 'الإمارات والسعودية ومصر',
    usdPrice: 87.50,
    egpPrice: 4330,
    buyBoxRate: '91.8%',
    latencyMs: 420,
    skuCount: '940K+ SKUs',
  },
  jumia: {
    id: 'jumia',
    name: 'JUMIA',
    regionCode: 'NG · TRACKING',
    regionLabel: 'نيجيريا ومصر وشمال أفريقيا',
    usdPrice: 64.20,
    egpPrice: 3180,
    buyBoxRate: '88.6%',
    latencyMs: 490,
    skuCount: '620K+ SKUs',
  },
};

interface RadarGlobalHeroVisualProps {
  compact?: boolean;
  onOpenInvestorDeck?: () => void;
  onSelectPlatform?: (platformId: 'amazon' | 'noon' | 'jumia') => void;
}

export const RadarGlobalHeroVisual: React.FC<RadarGlobalHeroVisualProps> = ({
  compact = false,
  onOpenInvestorDeck,
  onSelectPlatform,
}) => {
  const [nodes, setNodes] = useState(INITIAL_MARKETPLACE_NODES);
  const [selectedId, setSelectedId] = useState<'amazon' | 'noon' | 'jumia'>('amazon');
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'EGP'>('USD');
  const [isScanning, setIsScanning] = useState(false);

  const handleTriggerRadarSweep = () => {
    setIsScanning(true);
    setTimeout(() => {
      setNodes((prev) => ({
        amazon: {
          ...prev.amazon,
          usdPrice: Number((119.99 - (Math.random() * 1.4 - 0.4)).toFixed(2)),
          egpPrice: Math.round(5940 - (Math.random() * 65 - 20)),
          latencyMs: Math.floor(310 + Math.random() * 90),
        },
        noon: {
          ...prev.noon,
          usdPrice: Number((87.50 - (Math.random() * 1.1 - 0.3)).toFixed(2)),
          egpPrice: Math.round(4330 - (Math.random() * 55 - 15)),
          latencyMs: Math.floor(340 + Math.random() * 95),
        },
        jumia: {
          ...prev.jumia,
          usdPrice: Number((64.20 - (Math.random() * 0.9 - 0.2)).toFixed(2)),
          egpPrice: Math.round(3180 - (Math.random() * 45 - 10)),
          latencyMs: Math.floor(390 + Math.random() * 110),
        },
      }));
      setIsScanning(false);
    }, 600);
  };

  useEffect(() => {
    setNodes(INITIAL_MARKETPLACE_NODES);
  }, []);

  const activeNode = nodes[selectedId];

  const formatPrice = (node: MarketplaceLiveNode) => {
    if (currencyMode === 'USD') {
      return `$${node.usdPrice.toFixed(2)}`;
    }
    return `${node.egpPrice.toLocaleString('en-US')} EGP`;
  };

  return (
    <div
      id="radar-global-hero-visual"
      className={`relative w-full overflow-hidden rounded-2xl bg-[#FFFFFF] text-[#000000] border-2 border-[#D4AF37] shadow-sm select-none ${
        compact ? 'p-4 sm:p-6' : 'p-5 sm:p-8'
      }`}
      dir="ltr"
    >
      {/* Top Interactive Controls Strip */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrencyMode((prev) => (prev === 'USD' ? 'EGP' : 'USD'))}
            className="h-10 px-4 rounded-lg bg-[#FFFFFF] text-[#000000] border-2 border-[#D4AF37] text-sm font-bold whitespace-nowrap flex items-center gap-2 justify-center transition-all cursor-pointer"
            title="Switch display currency between USD ($) and EGP"
          >
            <Globe2 className="w-4 h-4 text-[#000000]" />
            <span className="font-mono">{currencyMode === 'USD' ? 'USD ($)' : 'EGP (ج.م)'}</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerRadarSweep}
            disabled={isScanning}
            className="h-10 px-4 rounded-lg bg-[#FFFFFF] text-[#000000] border-2 border-[#D4AF37] text-sm font-bold whitespace-nowrap flex items-center gap-2 justify-center transition-all cursor-pointer disabled:opacity-50"
            title="تحديث فوري لأسعار المنصات العالمية"
          >
            <RefreshCw className={`w-4 h-4 text-[#000000] ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Live Pulse'}</span>
          </button>
        </div>

        {onOpenInvestorDeck && (
          <button
            type="button"
            id="btn-hero-open-investor-deck"
            onClick={onOpenInvestorDeck}
            className="h-10 px-4 rounded-lg bg-[#FFFFFF] text-[#000000] border-2 border-[#D4AF37] text-sm font-extrabold whitespace-nowrap flex items-center gap-2 justify-center transition-all cursor-pointer"
          >
            <Presentation className="w-4 h-4 text-[#000000]" />
            <span>عرض المستثمرين · Investor Deck</span>
          </button>
        )}
      </div>

      {/* Top Center Original Brand Lockup: Open Gold Radar Circle + R A D A R + Subtitle */}
      <div className="relative z-10 flex flex-col items-center text-center mb-2">
        {/* Iconic Original Open Gold Radar Ring with Glowing Target Dot */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="radarLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B48222" />
              </linearGradient>
              <radialGradient id="radarLogoBadgeBg" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#1B160D" />
                <stop offset="100%" stopColor="#08090D" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill="url(#radarLogoBadgeBg)" stroke="#D4AF37" strokeWidth="2" />
            {/* Broken Gold Ring (Original Brand Mark) */}
            <path
              d="M 50 14 A 36 36 0 1 1 21 29"
              fill="none"
              stroke="url(#radarLogoGold)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Glowing Gold Target Dot in Upper-Right Quadrant */}
            <circle
              cx="63"
              cy="33"
              r="4.2"
              fill="#FEF3C7"
              className={isScanning ? 'animate-ping' : ''}
            />
            <circle cx="63" cy="33" r="3.4" fill="#FBBF24" />
          </svg>
        </div>

        {/* R A D A R Solid Black Wordmark for Maximum Legibility */}
        <h2
          className="text-2xl sm:text-3xl font-extrabold tracking-[0.42em] pl-[0.42em] text-[#000000] font-['Outfit','Alexandria',sans-serif]"
        >
          RADAR
        </h2>
        <p className="mt-1 text-xs tracking-[0.18em] text-[#000000] uppercase font-bold">
          GLOBAL MARKETPLACES · REAL-TIME PRICE TRACKING
        </p>
      </div>

      {/* Main Interactive SVG Globe & Connected Price Tags Stage (Original Brand Asset on Pure White) */}
      <div className="relative z-10 w-full max-w-3xl mx-auto aspect-[16/10] min-h-[290px] sm:min-h-[360px] flex items-center justify-center">
        <svg
          viewBox="0 0 900 520"
          className="w-full h-full overflow-visible"
          aria-label="RADAR Global Marketplaces Geodesic Globe connected to Amazon, Noon, and Jumia"
        >
          <defs>
            <linearGradient id="globeGoldLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="1" />
              <stop offset="50%" stopColor="#B48222" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#926F23" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="orbitGold" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#926F23" stopOpacity="0.5" />
              <stop offset="25%" stopColor="#D4AF37" stopOpacity="1" />
              <stop offset="75%" stopColor="#B48222" stopOpacity="1" />
              <stop offset="100%" stopColor="#926F23" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Subtle Technical Grid Crosshairs */}
          <line x1="80" y1="265" x2="820" y2="265" stroke="#D4AF37" strokeOpacity="0.35" strokeWidth="1" />
          <line x1="450" y1="45" x2="450" y2="475" stroke="#D4AF37" strokeOpacity="0.35" strokeWidth="1" />

          {/* Outer Technical Radar Rings & Fine Degree Ticks */}
          <circle
            cx="450"
            cy="265"
            r="196"
            fill="none"
            stroke="#D4AF37"
            strokeOpacity="0.55"
            strokeWidth="1.2"
          />
          <circle
            cx="450"
            cy="265"
            r="186"
            fill="none"
            stroke="#B48222"
            strokeOpacity="0.65"
            strokeWidth="3.5"
            strokeDasharray="1.5 5.5"
          />
          <circle
            cx="450"
            cy="265"
            r="174"
            fill="none"
            stroke="#D4AF37"
            strokeOpacity="0.45"
            strokeWidth="1.2"
            strokeDasharray="40 18 12 18"
          />

          {/* Central 3D Geodesic Wireframe Globe (r=154 at 450,265) */}
          <g stroke="url(#globeGoldLine)" fill="none">
            <circle cx="450" cy="265" r="154" strokeWidth="2.4" strokeOpacity="0.95" />
            <ellipse cx="450" cy="265" rx="154" ry="56" strokeWidth="1.4" strokeOpacity="0.75" />
            <ellipse cx="450" cy="265" rx="154" ry="112" strokeWidth="1.4" strokeOpacity="0.7" />
            <ellipse cx="450" cy="265" rx="56" ry="154" strokeWidth="1.4" strokeOpacity="0.75" />
            <ellipse cx="450" cy="265" rx="112" ry="154" strokeWidth="1.4" strokeOpacity="0.7" />

            <polygon
              points="450,111 538,142 586,214 574,312 512,394 450,419 388,394 326,312 314,214 362,142"
              strokeWidth="1.6"
              strokeOpacity="0.85"
            />
            <polygon
              points="450,148 525,188 548,265 512,345 450,378 388,345 352,265 375,188"
              strokeWidth="1.6"
              strokeOpacity="0.9"
            />
            <polyline points="362,142 450,148 538,142" strokeWidth="1.4" />
            <polyline points="314,214 375,188 450,218 525,188 586,214" strokeWidth="1.5" />
            <polyline points="314,214 352,265 415,252 450,218 488,258 548,265 586,214" strokeWidth="1.5" />
            <polyline points="326,312 388,345 432,308 488,258 512,345 574,312" strokeWidth="1.5" />
            <polyline points="352,265 388,345 450,378 432,308 415,252 375,188" strokeWidth="1.5" />
            <polyline points="450,148 450,218 432,308 512,345 512,394" strokeWidth="1.4" />
            <polyline points="525,188 488,258 574,312" strokeWidth="1.4" />
            <polyline points="326,312 415,252 488,258" strokeWidth="1.4" />
          </g>

          {/* Sweeping Tilted Orbital Gold Ring */}
          <ellipse
            cx="450"
            cy="265"
            rx="238"
            ry="66"
            transform="rotate(-19 450 265)"
            fill="none"
            stroke="url(#orbitGold)"
            strokeWidth="2.8"
          />

          {/* Vertex Nodes on the Geodesic Sphere */}
          {[
            [450, 148],
            [525, 188],
            [375, 188],
            [450, 218],
            [415, 252],
            [488, 258],
            [548, 265],
            [352, 265],
            [432, 308],
            [512, 345],
            [388, 345],
            [538, 142],
            [362, 142],
            [574, 312],
            [326, 312],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="5.5" fill="#D4AF37" fillOpacity="0.35" />
              <circle cx={cx} cy={cy} r="3" fill="#B48222" />
            </g>
          ))}

          {/* Leader Connector Line 1: Globe -> AMAZON Tag (Top-Right) */}
          <path
            d="M 525 188 Q 570 154 619 144"
            fill="none"
            stroke="#B48222"
            strokeWidth="2"
          />

          {/* Leader Connector Line 2: Globe -> NOON Tag (Bottom-Right) */}
          <path
            d="M 512 345 Q 575 344 635 344"
            fill="none"
            stroke="#B48222"
            strokeWidth="2"
          />

          {/* Leader Connector Line 3: Globe -> JUMIA Tag (Bottom-Left) */}
          <path
            d="M 388 345 Q 332 392 269 390"
            fill="none"
            stroke="#B48222"
            strokeWidth="2"
          />

          {/* ==============================================================
              1. AMAZON PRICE TRACKING TAG (Top Right) - Pure White + Black Text + Original Brand Arrow
             ============================================================== */}
          <g
            onClick={() => {
              setSelectedId('amazon');
              onSelectPlatform?.('amazon');
            }}
            className="cursor-pointer transition-opacity hover:opacity-95"
          >
            <path
              d="M 608 134 L 642 94 H 824 Q 834 94 834 104 V 184 Q 834 194 824 194 H 642 L 608 154 Z"
              fill="#FFFFFF"
              stroke={selectedId === 'amazon' ? '#B48222' : '#D4AF37'}
              strokeWidth={selectedId === 'amazon' ? '2.8' : '2'}
            />
            <circle cx="627" cy="144" r="7.5" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="2" />

            {/* Amazon Wordmark in Solid Black */}
            <text
              x="735"
              y="126"
              textAnchor="middle"
              fill="#000000"
              fontFamily="Outfit, Alexandria, sans-serif"
              fontSize="24"
              fontWeight="800"
              letterSpacing="-0.5"
            >
              amazon
            </text>
            {/* Iconic Amazon Smile Arrow in Official Orange (#FF9900) */}
            <path
              d="M 702 132 Q 733 143 764 131"
              fill="none"
              stroke="#FF9900"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M 758 129 L 765 131 L 761 137"
              fill="none"
              stroke="#FF9900"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Real-Time Price in Solid Black */}
            <text
              x="735"
              y="162"
              textAnchor="middle"
              fill="#000000"
              fontFamily="monospace"
              fontSize="22"
              fontWeight="800"
            >
              {formatPrice(nodes.amazon)}
            </text>

            {/* Crosshair Icon + US · TRACKING in Solid Black */}
            <circle cx="684" cy="179" r="5.5" fill="none" stroke="#B48222" strokeWidth="1.5" />
            <circle cx="684" cy="179" r="1.8" fill="#B48222" />
            <text
              x="742"
              y="183"
              textAnchor="middle"
              fill="#000000"
              fontFamily="Outfit, sans-serif"
              fontSize="11.5"
              fontWeight="800"
              letterSpacing="1.8"
            >
              {nodes.amazon.regionCode}
            </text>
          </g>

          {/* ==============================================================
              2. NOON PRICE TRACKING TAG (Bottom Right) - Pure White + Black Text + Original Noon Emblem
             ============================================================== */}
          <g
            onClick={() => {
              setSelectedId('noon');
              onSelectPlatform?.('noon');
            }}
            className="cursor-pointer transition-opacity hover:opacity-95"
          >
            <path
              d="M 624 334 L 658 294 H 840 Q 850 294 850 304 V 384 Q 850 394 840 394 H 658 L 624 354 Z"
              fill="#FFFFFF"
              stroke={selectedId === 'noon' ? '#B48222' : '#D4AF37'}
              strokeWidth={selectedId === 'noon' ? '2.8' : '2'}
            />
            <circle cx="643" cy="344" r="7.5" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="2" />

            {/* Noon Official Brand Emblem */}
            <path
              d="M 741 312 A 13 13 0 1 1 731 316"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="739" cy="308" r="2.8" fill="#B48222" />

            {/* Real-Time Price in Solid Black */}
            <text
              x="748"
              y="360"
              textAnchor="middle"
              fill="#000000"
              fontFamily="monospace"
              fontSize="22"
              fontWeight="800"
            >
              {formatPrice(nodes.noon)}
            </text>

            {/* AE · TRACKING in Solid Black */}
            <text
              x="748"
              y="381"
              textAnchor="middle"
              fill="#000000"
              fontFamily="Outfit, sans-serif"
              fontSize="11.5"
              fontWeight="800"
              letterSpacing="1.8"
            >
              {nodes.noon.regionCode}
            </text>
          </g>

          {/* ==============================================================
              3. JUMIA PRICE TRACKING TAG (Bottom Left) - Pure White + Black Text + Original Jumia Star
             ============================================================== */}
          <g
            onClick={() => {
              setSelectedId('jumia');
              onSelectPlatform?.('jumia');
            }}
            className="cursor-pointer transition-opacity hover:opacity-95"
          >
            <path
              d="M 280 380 L 246 340 H 64 Q 54 340 54 350 V 430 Q 54 440 64 440 H 246 L 280 400 Z"
              fill="#FFFFFF"
              stroke={selectedId === 'jumia' ? '#B48222' : '#D4AF37'}
              strokeWidth={selectedId === 'jumia' ? '2.8' : '2'}
            />
            <circle cx="261" cy="390" r="7.5" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="2" />

            {/* JUMIA Wordmark in Solid Black + Official Orange Star Circle */}
            <text
              x="142"
              y="374"
              textAnchor="middle"
              fill="#000000"
              fontFamily="Outfit, Alexandria, sans-serif"
              fontSize="20"
              fontWeight="800"
              letterSpacing="2"
            >
              JUMIA
            </text>
            <circle cx="198" cy="367" r="10.5" fill="none" stroke="#F68B1E" strokeWidth="2.2" />
            <polygon
              points="198,359 200.4,364.2 206,364.8 201.8,368.5 203,374 198,371.2 193,374 194.2,368.5 190,364.8 195.6,364.2"
              fill="#F68B1E"
            />

            {/* Real-Time Price in Solid Black */}
            <text
              x="160"
              y="406"
              textAnchor="middle"
              fill="#000000"
              fontFamily="monospace"
              fontSize="22"
              fontWeight="800"
            >
              {formatPrice(nodes.jumia)}
            </text>

            {/* NG · TRACKING in Solid Black */}
            <text
              x="160"
              y="427"
              textAnchor="middle"
              fill="#000000"
              fontFamily="Outfit, sans-serif"
              fontSize="11.5"
              fontWeight="800"
              letterSpacing="1.8"
            >
              {nodes.jumia.regionCode}
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom Interactive Telemetry Bar for Selected Marketplace */}
      <div
        className="relative z-10 mt-2 pt-3 border-t-2 border-[#D4AF37] flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[#000000]"
        dir="rtl"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-extrabold text-[#000000] flex items-center gap-1.5">
            <Crosshair className="w-4 h-4 text-[#000000]" />
            <span>الرادار النشط: {activeNode.name}</span>
          </span>
          <span>·</span>
          <span className="text-[#000000] font-bold">{activeNode.regionLabel}</span>
          <span>·</span>
          <span className="font-mono text-[#000000] font-extrabold tabular-nums">Buy Box {activeNode.buyBoxRate}</span>
          <span>·</span>
          <span className="font-mono text-[#000000] font-extrabold tabular-nums">{activeNode.latencyMs}ms</span>
        </div>

        <div className="text-xs tracking-[0.22em] text-[#000000] uppercase font-extrabold" dir="ltr">
          AMAZON · NOON · JUMIA · GLOBAL MONITORING
        </div>
      </div>
    </div>
  );
};

export default RadarGlobalHeroVisual;
