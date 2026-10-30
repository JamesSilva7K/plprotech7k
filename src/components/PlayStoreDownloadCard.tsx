import React, { useState } from 'react';
import {
  Download,
  Share2,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  X,
  ShieldCheck,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { ApkItem } from '../types/apk';
import { PlayProtectShield } from './PlayProtectShield';
import { useRealtimeDownload } from '../utils/useRealtimeDownload';

interface PlayStoreDownloadCardProps {
  apk: ApkItem;
  onDownloadApk: (apk: ApkItem) => void;
  onToast: (msg: string) => void;
  isCompact?: boolean;
}

export const PlayStoreDownloadCard: React.FC<PlayStoreDownloadCardProps> = ({
  apk,
  onDownloadApk,
  onToast,
  isCompact = false,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const {
    stage,
    progressPercent,
    downloadedMb,
    totalMb,
    speedMbPerSec,
    etaSeconds,
    startDownload,
    cancelDownload,
    uninstallApp,
    openApp,
  } = useRealtimeDownload({
    apk,
    onDownloadApk,
    onToast,
  });

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      onToast('Link oficial copiado!');
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    onToast(isWishlisted ? 'Removido da lista de desejos' : 'Adicionado à sua lista de desejos!');
  };

  return (
    <div
      className={`bg-white rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#e8eaed] ${
        isCompact ? 'p-3.5 space-y-2.5' : 'p-5 md:p-6 space-y-3.5'
      }`}
    >
      {/* 1. STATE: IDLE */}
      {stage === 'idle' && (
        <div className="space-y-3">
          <button
            onClick={startDownload}
            className={`w-full bg-[#01875f] hover:bg-[#017a56] active:bg-[#005e42] text-white rounded-full font-medium font-['Google_Sans',sans-serif] flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(1,135,95,0.25)] hover:shadow-[0_4px_12px_rgba(1,135,95,0.32)] transition-all cursor-pointer active:scale-[0.99] select-none ${
              isCompact ? 'py-2.5 text-xs' : 'py-3.5 text-sm sm:text-[15px]'
            }`}
          >
            <Download className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
            <span>Instalar ({apk.fileSize || `${totalMb} MB`})</span>
          </button>

          {/* Secondary Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={handleShare}
              className={`flex-1 border border-[#dadce0] hover:bg-[#f1f3f4] active:bg-[#e8eaed] text-[#01875f] rounded-full font-medium font-['Google_Sans',sans-serif] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isCompact ? 'py-1.5 text-[11px]' : 'py-2.5 text-xs'
              }`}
            >
              <Share2 className={isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
              <span>Compartilhar</span>
            </button>

            <button
              onClick={handleWishlistToggle}
              className={`flex-1 border rounded-full font-medium font-['Google_Sans',sans-serif] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isCompact ? 'py-1.5 text-[11px]' : 'py-2.5 text-xs'
              } ${
                isWishlisted
                  ? 'border-[#01875f] bg-[#e6f4f1] text-[#01875f]'
                  : 'border-[#dadce0] hover:bg-[#f1f3f4] text-[#01875f]'
              }`}
            >
              <Bookmark className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${isWishlisted ? 'fill-current' : ''}`} />
              <span>{isWishlisted ? 'Na lista' : 'Desejos'}</span>
            </button>
          </div>

          {/* Device & Security Indicator */}
          <div className="flex items-center justify-between text-[#5f6368] pt-0.5 border-t border-[#f1f3f4]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Smartphone className="w-3.5 h-3.5 text-[#01875f] shrink-0" />
              <span className={`truncate ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                Compatível com seu dispositivo Android
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <PlayProtectShield size={14} />
              <span className={`text-[#3c4043] font-medium ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
                Play Protect
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. STATE: DOWNLOADING (REAL-TIME ENGINE) */}
      {stage === 'downloading' && (
        <div className="space-y-2.5 animate-fadeIn">
          {/* Header metrics */}
          <div className="flex items-center justify-between font-['Google_Sans',sans-serif]">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-[#202124] tabular-nums ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {progressPercent}%
              </span>
              <span className={`text-[#5f6368] tabular-nums ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                {downloadedMb.toFixed(1)} MB de {totalMb.toFixed(1)} MB
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`font-mono text-[#01875f] font-semibold tabular-nums ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                {speedMbPerSec.toFixed(1)} MB/s
              </span>
              <span className={`text-[#80868b] ${isCompact ? 'text-[10px]' : 'text-[11px]'}`}>
                · {etaSeconds}s
              </span>
              <button
                onClick={cancelDownload}
                title="Cancelar download"
                className="w-6 h-6 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#202124] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Smooth Real-Time Progress Bar */}
          <div className="h-2 w-full bg-[#e8eaed] rounded-full overflow-hidden relative">
            <div
              className="h-full bg-[#01875f] rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Live transfer status */}
          <div className="flex items-center justify-between text-[#5f6368] pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#01875f] animate-ping" />
              <span className={`font-medium text-[#202124] ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                Baixando {apk.name}...
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#01875f]">
              <PlayProtectShield size={14} />
              <span className={`${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
                Verificado pelo Play Protect
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. STATE: VERIFYING (PLAY PROTECT SCAN) */}
      {stage === 'verifying' && (
        <div className="space-y-2.5 py-1 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <PlayProtectShield isScanning={true} size={isCompact ? 22 : 26} />
            <div className="min-w-0 flex-1">
              <p className={`font-bold text-[#202124] font-['Google_Sans',sans-serif] ${isCompact ? 'text-xs' : 'text-sm'}`}>
                Verificando pelo Play Protect...
              </p>
              <p className={`text-[#5f6368] truncate ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                Validando integridade e assinatura do pacote APK
              </p>
            </div>
          </div>

          <div className="h-1.5 w-full bg-[#e6f4f1] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#01875f] via-[#34a853] to-[#01875f] w-full animate-pulse rounded-full" />
          </div>
        </div>
      )}

      {/* 4. STATE: INSTALLED */}
      {stage === 'installed' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <button
              onClick={uninstallApp}
              className={`flex-1 border border-[#dadce0] hover:bg-[#f8f9fa] active:bg-[#f1f3f4] text-[#01875f] rounded-full font-medium font-['Google_Sans',sans-serif] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isCompact ? 'py-2 text-xs' : 'py-3 text-sm'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Desinstalar</span>
            </button>

            <button
              onClick={openApp}
              className={`flex-1 bg-[#01875f] hover:bg-[#017a56] active:bg-[#005e42] text-white rounded-full font-medium font-['Google_Sans',sans-serif] flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(1,135,95,0.25)] transition-all cursor-pointer active:scale-[0.99] ${
                isCompact ? 'py-2 text-xs' : 'py-3 text-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Abrir</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[#5f6368] pt-0.5 border-t border-[#f1f3f4]">
            <div className="flex items-center gap-1.5">
              <PlayProtectShield size={14} />
              <span className={`text-[#01875f] font-medium ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                Aplicativo verificado e seguro
              </span>
            </div>
            <span className={`text-[#80868b] ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
              Versão {apk.versionName || '1.0.0'} instalada
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
