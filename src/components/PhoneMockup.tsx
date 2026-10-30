import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Share2,
  Bookmark,
  Check,
  Shield,
  Download,
  Smartphone,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  Maximize2,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { ApkItem, ReviewItem } from '../types/apk';
import { calculateValidatedMetrics } from '../utils/apkMetrics';
import { GooglePlayLogo } from './GooglePlayLogo';
import { PlayStoreDownloadCard } from './PlayStoreDownloadCard';
import { generateVectorAppIcon } from '../data/appIcons';

interface PhoneMockupProps {
  apk: ApkItem;
  onDownloadApk: (apk: ApkItem) => void;
  onUpdateReviewVote?: (reviewIndex: number) => void;
  scale?: number;
}

// Resilient SmartAppIcon component that guarantees a 100% vector SVG icon is ALWAYS visible
const SmartAppIcon: React.FC<{
  src?: string;
  name: string;
  category?: string;
  sizeClass?: string;
  roundedClass?: string;
  borderClass?: string;
}> = ({
  src,
  name,
  category = 'Aplicativo',
  sizeClass = 'w-16 h-16',
  roundedClass = 'rounded-[16px]',
  borderClass = 'border border-[#dadce0]',
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const vectorFallback = generateVectorAppIcon(name || 'App', category);

  return (
    <img
      src={!src || hasError ? vectorFallback : src}
      alt={name || 'App'}
      onError={() => setHasError(true)}
      className={`${sizeClass} ${roundedClass} ${borderClass} object-cover shrink-0 shadow-xs bg-white select-none`}
    />
  );
};

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  apk,
  onDownloadApk,
  onUpdateReviewVote,
  scale = 1,
}) => {
  const [activeTab, setActiveTab] = useState<'Jogos' | 'Aplicativos' | 'Livros' | 'Infantil'>('Aplicativos');
  const [votedReviews, setVotedReviews] = useState<Record<number, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const showPhoneToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleVote = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (votedReviews[idx]) return;
    setVotedReviews(prev => ({ ...prev, [idx]: true }));
    if (onUpdateReviewVote) {
      onUpdateReviewVote(idx);
    }
    showPhoneToast('Obrigado pelo seu feedback!');
  };

  // 100% Mathematically validated real-time review metrics
  const metrics = calculateValidatedMetrics(apk.reviews);

  // Pure SVG vector star renderer (zero text characters or cartoon emojis)
  const mkStars = (n: number, size = 12) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(n);
      const isHalf = !isFilled && i - n < 1;
      stars.push(
        <Star
          key={i}
          style={{ width: `${size}px`, height: `${size}px` }}
          className={`${
            isFilled
              ? 'fill-[#f4b400] text-[#f4b400]'
              : isHalf
              ? 'fill-[#f4b400]/40 text-[#f4b400]'
              : 'fill-[#dadce0] text-[#dadce0]'
          } shrink-0`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* MODERN SMARTPHONE CHASSIS */}
      <div
        className="relative w-[375px] h-[750px] bg-[#0c0d10] rounded-[52px] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.12)] border-[5px] border-[#252A30] ring-1 ring-black/80 transition-all duration-300"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
      >
        {/* Hardware side buttons */}
        <div className="absolute -left-[9px] top-28 w-[4px] h-12 bg-[#2a2f36] rounded-l-md border-l border-white/20" />
        <div className="absolute -left-[9px] top-44 w-[4px] h-12 bg-[#2a2f36] rounded-l-md border-l border-white/20" />
        <div className="absolute -right-[9px] top-32 w-[4px] h-16 bg-[#2a2f36] rounded-r-md border-r border-white/20" />

        {/* Top Speaker Ear-piece */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1a1c20] rounded-full z-40" />

        {/* Inner Screen Display (Curved OLED Bezel) */}
        <div className="relative w-full h-full bg-[#f8f9fa] rounded-[40px] overflow-hidden flex flex-col justify-between border border-black/40 shadow-inner">
          {/* Status Bar */}
          <div className="h-9 px-6 bg-white border-b border-[#dadce0]/50 flex items-center justify-between text-[11px] font-mono text-[#202124] shrink-0 z-30">
            <span className="font-semibold text-xs tracking-tight">{currentTime || '10:45'}</span>

            {/* Front Camera Punch-Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/10 shadow-inner" />

            <div className="flex items-center gap-1.5 text-[#5f6368]">
              <span className="text-[10px] font-bold">5G</span>
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* SCREEN CONTENT: GOOGLE PLAY STORE PERMANENT VIEW */}
          <div className="flex-1 overflow-y-auto relative">
            <div className="text-[#202124] font-sans antialiased text-xs">
              {/* Store Navigation Bar */}
                <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-[#dadce0] shadow-[0_1px_3px_rgba(0,0,0,0.05)] sticky top-0 z-20">
                  <div className="flex items-center gap-2">
                    <GooglePlayLogo className="w-5 h-5" />
                    <span className="text-[16px] font-medium text-[#202124] tracking-tight font-['Google_Sans',sans-serif] flex items-center">
                      Google <b className="text-[#01875f] font-bold ml-1">Play</b>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-[#5f6368]" />
                    <div
                      title="Conta Google"
                      className="w-6 h-6 rounded-full bg-[#e8eaed] border border-[#dadce0] flex items-center justify-center text-[#5f6368] overflow-hidden shadow-xs cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#5f6368]">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Subnav categories */}
                <div className="bg-white border-b border-[#dadce0] flex px-4">
                  {(['Jogos', 'Aplicativos', 'Livros', 'Infantil'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-2.5 text-[11px] font-medium border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'text-[#01875f] border-[#01875f]'
                          : 'text-[#5f6368] border-transparent'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* App Content */}
                <div className="p-3 space-y-3">
                  {/* Card 1: Header */}
                  <div className="bg-white rounded-[12px] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex gap-3.5 items-start">
                    <SmartAppIcon
                      src={apk.iconSrc}
                      name={apk.name}
                      sizeClass="w-16 h-16"
                      roundedClass="rounded-[16px]"
                      borderClass="border border-[#dadce0]"
                    />

                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold text-[#202124] leading-tight truncate font-['Google_Sans',sans-serif]">
                        {apk.name || 'Nome do Aplicativo'}
                      </h2>
                      <p className="text-xs font-medium text-[#01875f] truncate mt-0.5">
                        {apk.company || 'Desenvolvedor'}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <span className="bg-[#f1f3f4] rounded-full px-2 py-0.5 text-[10px] font-medium text-[#202124] flex items-center gap-1">
                          <span className="text-[#34a853]">●</span>
                          <span className="font-bold">{metrics.averageRating.toFixed(1).replace('.', ',')}</span>
                          <Star className="w-2.5 h-2.5 fill-[#f4b400] text-[#f4b400]" />
                        </span>
                        <span className="bg-[#f1f3f4] rounded-full px-2 py-0.5 text-[10px] font-medium text-[#202124]">
                          {apk.downloads || '100K+'}
                        </span>
                        <span className="bg-[#f1f3f4] rounded-full px-2 py-0.5 text-[10px] font-medium text-[#202124]">
                          Livre
                        </span>
                        <span className="bg-[#f1f3f4] rounded-full px-2 py-0.5 text-[10px] font-medium text-[#202124]">
                          {apk.category || 'Negócios'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Real-time Download Card */}
                  <PlayStoreDownloadCard
                    apk={apk}
                    onDownloadApk={onDownloadApk}
                    onToast={showPhoneToast}
                    isCompact={true}
                  />

                  {/* Card 3: About App / Description */}
                  <div className="bg-white rounded-[12px] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-2">
                    <div
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="flex items-center justify-between font-semibold text-xs text-[#202124] cursor-pointer hover:text-[#01875f] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>Sobre este app</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#f1f3f4] text-[#01875f] font-mono rounded">
                          OFICIAL
                        </span>
                      </span>
                      <span className="text-[#1a73e8] text-[11px] flex items-center gap-0.5">
                        <span>{isDescExpanded ? 'Menos' : 'Mais'}</span>
                        {isDescExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </span>
                    </div>
                    <div
                      className={`text-[11px] text-[#5f6368] leading-relaxed whitespace-pre-wrap ${
                        isDescExpanded ? 'max-h-[300px] overflow-y-auto pr-1' : 'line-clamp-4'
                      }`}
                    >
                      {apk.description || 'Nenhuma descrição fornecida.'}
                    </div>
                    <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
                      <span className="px-2 py-0.5 bg-[#f1f3f4] text-[#5f6368] rounded-full">
                        {apk.category || 'Negócios'}
                      </span>
                      <span className="px-2 py-0.5 bg-[#f1f3f4] text-[#5f6368] rounded-full font-medium">
                        Versão {apk.versionName || '1.0.0'}
                      </span>
                      <span className="px-2 py-0.5 bg-[#e6f4f1] text-[#01875f] rounded-full font-medium">
                        {apk.fileSize}
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Data Safety (Segurança dos dados) */}
                  <div className="bg-white rounded-[12px] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-2">
                    <div className="flex items-center justify-between font-semibold text-xs text-[#202124]">
                      <span>Segurança dos dados</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#01875f]" />
                    </div>
                    <p className="text-[11px] text-[#5f6368] leading-relaxed">
                      Sua segurança começa com o entendimento de como os desenvolvedores coletam e compartilham seus dados.
                    </p>

                    <div className="space-y-2 pt-1 border-t border-[#f1f3f4]">
                      <div className="flex items-start gap-2.5 text-[11px]">
                        <div className="w-6 h-6 rounded-full bg-[#e6f4f1] flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#01875f]" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#202124] block leading-tight">
                            Nenhum dado compartilhado com terceiros
                          </span>
                          <span className="text-[10px] text-[#5f6368]">
                            O desenvolvedor afirma que este app não repassa dados para outras empresas
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-[11px]">
                        <div className="w-6 h-6 rounded-full bg-[#e6f4f1] flex items-center justify-center shrink-0 mt-0.5">
                          <Lock className="w-3.5 h-3.5 text-[#01875f]" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#202124] block leading-tight">
                            Os dados são criptografados em trânsito
                          </span>
                          <span className="text-[10px] text-[#5f6368]">
                            Seus dados são transferidos por conexão segura certificada
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Ratings and Reviews with REAL LEADS PHOTOS */}
                  <div className="bg-white rounded-[12px] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-3">
                    <div className="flex items-center justify-between font-semibold text-xs text-[#202124]">
                      <span>Avaliações e opiniões</span>
                      <span className="text-[#1a73e8] text-[10px] flex items-center gap-1">
                        <span>Ver todas</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Ratings Summary (Mathematically Validated) */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-[#202124] leading-none">
                          {metrics.averageRating.toFixed(1).replace('.', ',')}
                        </span>
                        <div className="flex gap-0.5 my-1.5">{mkStars(metrics.averageRating, 11)}</div>
                        <span className="text-[10px] text-[#5f6368] font-mono">
                          {metrics.totalReviewsCount} {metrics.totalReviewsCount === 1 ? 'avaliação' : 'avaliações'}
                        </span>
                      </div>

                      <div className="flex-1 space-y-1">
                        {metrics.ratingBars.map(bar => (
                          <div key={bar.stars} className="flex items-center gap-1.5 text-[10px] text-[#5f6368]">
                            <span className="w-2 text-right">{bar.stars}</span>
                            <div className="flex-1 h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#01875f] rounded-full transition-all duration-300"
                                style={{ width: `${bar.pct}%` }}
                              />
                            </div>
                            <span className="w-6 text-right font-mono text-[9px]">{bar.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Real Leads Reviews List */}
                    <div className="divide-y divide-[#f1f3f4] pt-1">
                      {apk.reviews?.map((rev, idx) => (
                        <div key={idx} className="py-2.5 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#dadce0] shadow-xs bg-[#e8eaed] flex items-center justify-center">
                              {rev.avatarUrl ? (
                                <img
                                  src={rev.avatarUrl}
                                  alt={rev.name}
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center font-bold text-[10px] text-white ${
                                  rev.avatarUrl ? 'hidden' : 'flex'
                                }`}
                                style={{ backgroundColor: rev.color || '#01875f' }}
                              >
                                {rev.initials}
                              </div>
                            </div>

                            <div>
                              <p className="text-[11px] font-semibold text-[#202124] leading-tight">
                                {rev.name}
                              </p>
                              <p className="text-[9px] text-[#5f6368]">{rev.date}</p>
                            </div>
                          </div>

                          <div className="flex gap-0.5">{mkStars(rev.stars, 11)}</div>
                          <p className="text-[11px] text-[#5f6368] leading-relaxed">{rev.text}</p>

                          <div className="flex items-center gap-1.5 text-[10px] text-[#5f6368] pt-0.5">
                            <span>Útil?</span>
                            <button
                              onClick={e => handleVote(idx, e)}
                              className={`px-2 py-0.5 rounded-full border text-[10px] transition-colors cursor-pointer ${
                                votedReviews[idx]
                                  ? 'bg-[#e6f4f1] border-[#01875f] text-[#01875f] font-semibold'
                                  : 'border-[#dadce0] hover:bg-[#f1f3f4]'
                              }`}
                            >
                              Sim ({votedReviews[idx] ? rev.helpful + 1 : rev.helpful})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* Android Navigation Gesture Pill */}
          <div className="h-4 flex items-center justify-center bg-transparent shrink-0">
            <div className="w-28 h-1 bg-black/30 rounded-full" />
          </div>
        </div>

        {/* Floating Toast inside Phone Screen */}
        {toastMsg && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#323232] text-white px-4 py-2 rounded-full text-xs shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
};
