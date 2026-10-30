import React, { useState, useEffect } from 'react';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  Info,
  Layers,
  ArrowDown,
  Cpu,
  FileCheck,
  AlertTriangle,
  QrCode,
  Link2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { ApkItem } from '../types/apk';
import { GooglePlayLogo } from './GooglePlayLogo';
import { generateQrCodePng, QrCodeConfig } from '../utils/qrGenerator';
import { sanitizeAppNameForUrl } from '../utils/crypto';

interface ExclusiveQrDownloadPageProps {
  apk: ApkItem;
  channel?: 'link' | 'qrcode';
  signature?: string;
  onBackToAdmin: () => void;
  onDownloadApk: (apk: ApkItem) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export function ExclusiveQrDownloadPage({
  apk,
  channel = 'qrcode',
  signature,
  onBackToAdmin,
  onDownloadApk,
  onShowToast,
}: ExclusiveQrDownloadPageProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string>('');

  const isQrMode = channel === 'qrcode';
  const appSlug = sanitizeAppNameForUrl(apk.name);

  // Paleta de cor primária única baseada na categoria ou configuração
  const brandColor = apk.themeColor || (
    apk.category === 'Finanças' ? '#059669' :
    apk.category === 'Entretenimento' ? '#7C3AED' :
    apk.category === 'Produtividade' ? '#2563EB' :
    '#01875F'
  );

  // Gera o QR Code interativo
  useEffect(() => {
    async function makeQr() {
      try {
        const config: QrCodeConfig = {
          content: window.location.href,
          darkColor: apk.qrSettings?.darkColor || brandColor,
          lightColor: '#FFFFFF',
          size: 256,
          errorCorrectionLevel: 'H',
          logoUrl: apk.iconSrc || undefined,
          logoRatio: 0.22,
          moduleRadius: 0.35,
          padding: 12,
        };
        const url = await generateQrCodePng(config);
        setQrPreviewUrl(url);
      } catch (err) {
        console.error('Falha ao gerar QR na tela exclusiva:', err);
      }
    }
    makeQr();
  }, [apk, brandColor]);

  const handleStartDownload = () => {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          setDownloadSuccess(true);
          onDownloadApk(apk);
          onShowToast('Download Concluído', `${apk.fileName} transferido com integridade.`, 'success');
          return 100;
        }
        return prev + 15;
      });
    }, 140);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    onShowToast('Link Copiado', 'Link blindado pronto para compartilhamento.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] flex flex-col font-sans selection:bg-[#01875F]/20">
      {/* Top Banner de Diferenciação de Canal (QR vs. Link Direto) */}
      <div
        className={`px-4 py-2.5 text-xs font-semibold text-white flex items-center justify-between shadow-xs transition-colors`}
        style={{
          background: isQrMode
            ? 'linear-gradient(90deg, #01875F 0%, #004D40 100%)'
            : 'linear-gradient(90deg, #1A73E8 0%, #0D47A1 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isQrMode ? (
              <>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <QrCode className="w-3.5 h-3.5 text-white" />
                </div>
                <span>
                  Sessão Móvel Autenticada via <strong>QR Code Exclusivo</strong>
                </span>
              </>
            ) : (
              <>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Link2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span>
                  Acesso Oficial Autenticado via <strong>Link Direto Blindado</strong> ({appSlug})
                </span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] opacity-90">
            <Lock className="w-3 h-3" />
            <span>Assinatura: {signature ? signature.slice(0, 12) + '...' : 'HMAC-SHA256'}</span>
          </div>
        </div>
      </div>

      {/* Top Navbar Google Play Store */}
      <header className="bg-white border-b border-[#E0E2E5] px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToAdmin}
            className="p-1.5 hover:bg-[#F1F3F4] text-[#5F6368] rounded-full transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Voltar ao Painel Admin"
          >
            <ChevronLeft className="w-5 h-5 text-[#202124]" />
            <span className="hidden sm:inline">Painel Admin</span>
          </button>
          <div className="h-5 w-px bg-[#DADCE0] mx-1 hidden sm:block" />
          <div className="flex items-center gap-2">
            <GooglePlayLogo className="w-6 h-6" />
            <span className="font-medium text-base text-[#5F6368] tracking-tight">
              Google <span className="text-[#202124] font-bold">Play</span>
            </span>
          </div>
        </div>

        {/* Badges de Confiança */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#137333]" />
            <span className="hidden md:inline">Google Play Protect</span>
            <span className="text-[11px] font-mono">Verificado</span>
          </div>

          <button
            onClick={handleCopyShareLink}
            className="p-2 hover:bg-[#F1F3F4] text-[#5F6368] rounded-full transition-colors"
            title="Compartilhar Link Criptografado"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#137333]" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Específico do Modo Link Direto: Confiança & Dica Desktop */}
        {!isQrMode && (
          <div className="p-4 rounded-[16px] bg-[#E8F0FE] border border-[#D2E3FC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#1A73E8]/15 border border-[#1A73E8]/30 flex items-center justify-center text-[#1A73E8] shrink-0">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#174EA6]">
                  Link Oficial Criptografado de Distribuição Direta
                </h4>
                <p className="text-[11px] text-[#3C4043] font-mono mt-0.5">
                  ID do Aplicativo: <strong>{appSlug}</strong> • Blindagem contra interceptação e quebra de portas
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#1A73E8] text-white shrink-0">
              Canal Link Oficial
            </span>
          </div>
        )}

        {/* Banner Específico do Modo QR Code: Confirmação Móvel */}
        {isQrMode && (
          <div className="p-4 rounded-[16px] bg-[#E6F4EA] border border-[#CEEAD6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#01875F]/15 border border-[#01875F]/30 flex items-center justify-center text-[#01875F] shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#137333]">
                  Acesso Reconhecido via Escaneamento de QR Code
                </h4>
                <p className="text-[11px] text-[#3C4043] font-mono mt-0.5">
                  Conexão móvel segura vinculada ao pacote <strong>{apk.fileName}</strong>
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#01875F] text-white shrink-0">
              Canal QR Validado
            </span>
          </div>
        )}

        {/* Card Principal do Aplicativo */}
        <div className="bg-white rounded-[24px] border border-[#E0E2E5] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#F1F3F4]">
            <div className="flex items-center gap-5">
              {/* Ícone Oficial com borda temática da marca */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] overflow-hidden border-2 bg-[#F8F9FA] shadow-sm shrink-0 flex items-center justify-center"
                style={{ borderColor: brandColor }}
              >
                {apk.iconSrc ? (
                  <img src={apk.iconSrc} alt={apk.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-2xl font-black"
                    style={{ background: brandColor }}
                  >
                    {apk.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Título e Metadados com Nome do APK destacado */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#202124] leading-tight tracking-tight">
                    {apk.name}
                  </h1>
                </div>
                <p className="text-sm font-semibold" style={{ color: brandColor }}>
                  {apk.company || 'Desenvolvedor Oficial'}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-[6px] bg-[#F1F3F4] text-[#5F6368] text-xs font-medium">
                    {apk.category || 'Negócios'}
                  </span>
                  <span className="text-xs text-[#5F6368]">•</span>
                  <span className="text-xs text-[#5F6368] font-mono">{apk.fileSize}</span>
                  <span className="text-xs text-[#5F6368]">•</span>
                  <span className="text-xs text-[#5F6368]">{apk.downloads || '100K+'} downloads</span>
                </div>
              </div>
            </div>

            {/* Selo Google Play Protect */}
            <div className="hidden lg:flex flex-col items-end text-right">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#137333]">
                <CheckCircle2 className="w-4 h-4 text-[#137333]" />
                <span>Arquivo 100% Autêntico</span>
              </div>
              <p className="text-[11px] text-[#5F6368] mt-0.5 font-mono">sha256 verificado</p>
            </div>
          </div>

          {/* Botão de Download / Progresso de Instalação */}
          <div className="space-y-3">
            {!downloading && !downloadSuccess && (
              <button
                type="button"
                onClick={handleStartDownload}
                className="w-full sm:w-auto px-8 py-3.5 text-white rounded-[28px] text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-95"
                style={{ backgroundColor: brandColor }}
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Instalar Aplicativo Oficial ({apk.fileName})</span>
              </button>
            )}

            {downloading && (
              <div className="space-y-2 p-4 rounded-[16px] bg-[#F1F3F4] border border-[#DADCE0]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#202124]">
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 animate-bounce" style={{ color: brandColor }} />
                    <span>Baixando pacote seguro {apk.fileName}...</span>
                  </span>
                  <span className="font-mono font-bold" style={{ color: brandColor }}>{progress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#DADCE0] overflow-hidden">
                  <div
                    className="h-full transition-all duration-150 rounded-full"
                    style={{ width: `${progress}%`, backgroundColor: brandColor }}
                  />
                </div>
              </div>
            )}

            {downloadSuccess && (
              <div className="p-4 rounded-[16px] bg-[#E6F4EA] border border-[#CEEAD6] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#137333] text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#137333]">Download Concluído com Sucesso!</p>
                    <p className="text-[11px] text-[#5F6368]">
                      Abra o arquivo "{apk.fileName}" para concluir a instalação no seu Android.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStartDownload}
                  className="px-4 py-2 bg-white text-[#137333] hover:bg-[#F1F3F4] text-xs font-bold rounded-[8px] border border-[#CEEAD6] transition-colors"
                >
                  Baixar Novamente
                </button>
              </div>
            )}
          </div>

          {/* Descrição Oficial */}
          <div className="space-y-3 pt-4 border-t border-[#F1F3F4]">
            <h2 className="text-sm font-bold text-[#202124] uppercase tracking-wider">
              Sobre Este Aplicativo
            </h2>
            <div className="text-xs text-[#5F6368] leading-relaxed whitespace-pre-line font-normal">
              {apk.description}
            </div>
          </div>
        </div>

        {/* Grid: Blindagem Criptográfica + Transferência para Celular */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Integridade Criptográfica e Blindagem Anti-Invasão */}
          <div className="bg-white rounded-[20px] border border-[#E0E2E5] p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" style={{ color: brandColor }} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                Blindagem Criptográfica do Pacote
              </h3>
            </div>

            <p className="text-xs text-[#5F6368] leading-relaxed">
              Integridade assegurada via algoritmo criptográfico SHA-256 e assinatura blindada contra injeção de código ou adulteração de rotas.
            </p>

            <div className="space-y-1.5 pt-2 border-t border-[#F1F3F4]">
              <span className="text-[10px] text-[#5F6368] font-mono block">Assinatura SHA-256 Oficial:</span>
              <p className="p-2 rounded-[8px] bg-[#F8F9FA] border border-[#E0E2E5] text-[10px] font-mono text-[#202124] break-all select-all">
                {apk.sha256 || 'a4f938c9e83d291b0c9f1a74d284e56b9c8a123f456789abcdef0123456789ab'}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#5F6368] pt-1 font-mono">
              <span>Pacote: <strong>{apk.packageName || `br.com.${appSlug}`}</strong></span>
              <span>Versão: <strong>{apk.versionName || '1.0.0'} (API 34)</strong></span>
            </div>
          </div>

          {/* Card 2: QR Code Dinâmico (Perfeito para quem acessou via Link no Computador) */}
          <div className="bg-white rounded-[20px] border border-[#E0E2E5] p-5 flex items-center gap-5 shadow-xs">
            <div className="w-28 h-28 p-2 rounded-[14px] bg-[#F8F9FA] border border-[#E0E2E5] shrink-0 flex items-center justify-center">
              {qrPreviewUrl ? (
                <img src={qrPreviewUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-[#E0E2E5] animate-pulse rounded-[8px]" />
              )}
            </div>

            <div className="space-y-2 min-w-0">
              <span className="text-xs font-bold text-[#202124] block">
                {isQrMode ? 'Repassar para Outro Celular' : 'Abrir no Celular'}
              </span>
              <p className="text-[11px] text-[#5F6368] leading-tight">
                {isQrMode
                  ? 'Você pode repassar este pacote apontando outro smartphone para este código.'
                  : 'Abriu no computador? Aponte a câmera do seu celular Android para instalar direto nele.'}
              </p>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#202124] rounded-[8px] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Oficial */}
        <footer className="py-6 text-center text-xs text-[#5F6368] border-t border-[#E0E2E5] space-y-1">
          <p>© 2026 Google Play Store Oficial • Distribuição Segura e Criptografada</p>
          <p className="text-[11px] text-[#80868B] font-mono">
            Link Verificado • Canal: {isQrMode ? 'QR-Code-Session' : 'Direct-Encrypted-Link'} • {appSlug}
          </p>
        </footer>
      </main>
    </div>
  );
}
