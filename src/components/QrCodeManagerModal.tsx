import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Sliders,
  Palette,
  Layers,
  Smartphone,
  Globe,
  Lock,
  RefreshCw,
  FileCode2,
  Link2,
  Sparkles,
} from 'lucide-react';
import { ApkItem, QrCustomization } from '../types/apk';
import {
  generateQrCodePng,
  generateQrCodeSvg,
  downloadQrCode,
  QrCodeConfig,
} from '../utils/qrGenerator';
import {
  generateDownloadToken,
  generateQrSlug,
  sanitizeAppNameForUrl,
  generateBlindSignature,
  buildIntelligentUrl,
} from '../utils/crypto';

interface QrCodeManagerModalProps {
  apk: ApkItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdateApk: (updates: Partial<ApkItem>) => void;
  onOpenExclusivePage: (channel: 'link' | 'qrcode', signature: string) => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export function QrCodeManagerModal({
  apk,
  isOpen,
  onClose,
  onUpdateApk,
  onOpenExclusivePage,
  onShowToast,
}: QrCodeManagerModalProps) {
  const [darkColor, setDarkColor] = useState(apk.qrSettings?.darkColor || '#01875F');
  const [lightColor, setLightColor] = useState(apk.qrSettings?.lightColor || '#FFFFFF');
  const [size, setSize] = useState(apk.qrSettings?.size || 400);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>(apk.qrSettings?.errorCorrectionLevel || 'H');
  const [includeLogo, setIncludeLogo] = useState(apk.qrSettings?.includeLogo ?? true);
  const [moduleRadius, setModuleRadius] = useState(apk.qrSettings?.moduleRadius ?? 0.35);
  const [showFrame, setShowFrame] = useState(apk.qrSettings?.showFrame ?? true);
  const [frameText, setFrameText] = useState(apk.qrSettings?.frameText || 'ESCANEAR PARA BAIXAR');
  const [frameColor, setFrameColor] = useState(apk.qrSettings?.frameColor || '#01875F');
  const [themeColor, setThemeColor] = useState(apk.themeColor || '#01875F');
  const [customDomain, setCustomDomain] = useState(
    apk.qrSettings?.customDomain || (typeof window !== 'undefined' ? window.location.origin : 'https://seu-dominio.vercel.app')
  );

  const [slug, setSlug] = useState(apk.qrSettings?.slug || generateQrSlug(apk.id));
  const [token, setToken] = useState(apk.qrSettings?.downloadToken || '');
  const [directSig, setDirectSig] = useState(apk.qrSettings?.directLinkSig || '');
  const [qrSig, setQrSig] = useState(apk.qrSettings?.qrCodeSig || '');
  const [activeTabLink, setActiveTabLink] = useState<'link' | 'qrcode'>('qrcode');

  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Inicializa assinaturas blindadas e tokens HMAC
  useEffect(() => {
    async function initSignatures() {
      const generatedToken = token || (await generateDownloadToken(apk.id, apk.fileName));
      const sigLink = await generateBlindSignature(apk.name, 'link', apk.id);
      const sigQr = await generateBlindSignature(apk.name, 'qrcode', apk.id);
      setToken(generatedToken);
      setDirectSig(sigLink);
      setQrSig(sigQr);
    }
    initSignatures();
  }, [apk.id, apk.name, apk.fileName]);

  // URLs Inteligentes com Nome Explícito do APK
  const qrTargetUrl = buildIntelligentUrl(customDomain, apk.name, 'qrcode', qrSig, slug);
  const directTargetUrl = buildIntelligentUrl(customDomain, apk.name, 'link', directSig, slug);

  // Renderiza o QR Code apontando para o link de QR Code
  useEffect(() => {
    let isCancelled = false;

    async function renderPreview() {
      if (!qrTargetUrl) return;
      setIsGenerating(true);
      try {
        const config: QrCodeConfig = {
          content: qrTargetUrl,
          darkColor,
          lightColor,
          size: 512,
          errorCorrectionLevel: errorLevel,
          logoUrl: includeLogo && apk.iconSrc ? apk.iconSrc : undefined,
          logoRatio: 0.22,
          moduleRadius,
          showFrame,
          frameText,
          frameColor,
          padding: 20,
        };

        const dataUrl = await generateQrCodePng(config);
        if (!isCancelled) {
          setQrPngUrl(dataUrl);
        }
      } catch (err) {
        console.error('Falha ao renderizar QR Code:', err);
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    }

    renderPreview();

    return () => {
      isCancelled = true;
    };
  }, [
    qrTargetUrl,
    darkColor,
    lightColor,
    errorLevel,
    includeLogo,
    moduleRadius,
    showFrame,
    frameText,
    frameColor,
    apk.iconSrc,
  ]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    const updatedSettings: QrCustomization = {
      darkColor,
      lightColor,
      size,
      errorCorrectionLevel: errorLevel,
      includeLogo,
      moduleRadius,
      showFrame,
      frameText,
      frameColor,
      downloadToken: token,
      slug,
      customDomain,
      directLinkSig: directSig,
      qrCodeSig: qrSig,
    };
    onUpdateApk({ qrSettings: updatedSettings, themeColor });
    onShowToast('Configurações Salvas', 'Links inteligentes e parâmetros do QR Code atualizados.', 'success');
  };

  const handleCopyQrLink = () => {
    navigator.clipboard.writeText(qrTargetUrl);
    setCopiedLink(true);
    onShowToast('Link do QR Code Copiado', qrTargetUrl, 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyDirectLink = () => {
    navigator.clipboard.writeText(directTargetUrl);
    setCopiedDirectLink(true);
    onShowToast('Link Direto Copiado', directTargetUrl, 'success');
    setTimeout(() => setCopiedDirectLink(false), 2500);
  };

  const handleDownloadPng = () => {
    if (!qrPngUrl) return;
    downloadQrCode(qrPngUrl, `qrcode_${sanitizeAppNameForUrl(apk.name)}_blindado`, 'png');
    onShowToast('QR Code Baixado', 'Imagem PNG em alta resolução exportada com sucesso.', 'success');
  };

  const handleDownloadSvg = async () => {
    try {
      const config: QrCodeConfig = {
        content: qrTargetUrl,
        darkColor,
        lightColor,
        size: 512,
        errorCorrectionLevel: errorLevel,
        moduleRadius,
        padding: 20,
      };
      const svgString = await generateQrCodeSvg(config);
      downloadQrCode(svgString, `qrcode_${sanitizeAppNameForUrl(apk.name)}_vetorial`, 'svg');
      onShowToast('SVG Vetorial Baixado', 'QR Code vetorial escalável exportado com sucesso.', 'success');
    } catch {
      onShowToast('Erro ao Exportar SVG', 'Não foi possível gerar a versão vetorial.', 'error');
    }
  };

  const handleRegenerateKeys = async () => {
    const newSlug = generateQrSlug(apk.id);
    const newToken = await generateDownloadToken(apk.id, apk.fileName);
    const newLinkSig = await generateBlindSignature(apk.name, 'link', apk.id);
    const newQrSig = await generateBlindSignature(apk.name, 'qrcode', apk.id);
    setSlug(newSlug);
    setToken(newToken);
    setDirectSig(newLinkSig);
    setQrSig(newQrSig);
    onShowToast('Chaves Criptográficas Renovadas', 'Novos tokens e assinaturas gerados para o aplicativo.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0D0F12] border border-[#252A30] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252A30] flex items-center justify-between shrink-0 bg-[#111317]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#01875F]/15 border border-[#01875F]/40 flex items-center justify-center text-[#01875F] shadow-sm">
              <QrCode className="w-5 h-5 text-[#01875F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#F5F7FA]">
                  Gerenciador de Links Inteligentes & QR Code Blindado
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Links com Nome do APK
                </span>
              </div>
              <p className="text-xs text-[#9299A3]">
                Aplicativo: <strong className="text-[#F5F7FA]">{apk.name}</strong> • Slug: <span className="text-[#27B9F2] font-mono">{sanitizeAppNameForUrl(apk.name)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#9299A3] hover:text-[#F5F7FA] hover:bg-[#191B1F] rounded-[8px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-y-auto">
          {/* Left Column: QR Code Preview (5 cols) */}
          <div className="md:col-span-5 p-6 bg-[#0B0D10] border-b md:border-b-0 md:border-r border-[#252A30] flex flex-col items-center justify-between space-y-4">
            <div className="w-full flex flex-col items-center">
              <span className="text-xs font-semibold text-[#9299A3] uppercase tracking-wider mb-3 self-start">
                Preview do QR Code Exclusivo
              </span>

              {/* QR Container */}
              <div className="relative p-3 rounded-[16px] bg-[#14171C] border border-[#252A30] shadow-xl flex items-center justify-center max-w-[280px] w-full aspect-square">
                {qrPngUrl ? (
                  <img
                    src={qrPngUrl}
                    alt="QR Code Blindado"
                    className="w-full h-full object-contain rounded-[10px]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#9299A3] text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#01875F]" />
                    <span>Gerando código criptografado...</span>
                  </div>
                )}

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/40 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#27B9F2]" />
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="w-full mt-3 p-2.5 rounded-[10px] bg-[#111317] border border-[#252A30] text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#10B981]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Assinatura HMAC-SHA256 Ativa</span>
                </div>
                <p className="text-[10px] text-[#9299A3] font-mono truncate px-1">
                  ID: {slug} • {sanitizeAppNameForUrl(apk.name)}
                </p>
              </div>
            </div>

            {/* Quick Actions for QR */}
            <div className="w-full space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={!qrPngUrl}
                  className="px-3 py-2 bg-[#01875F] hover:bg-[#029e6f] disabled:opacity-50 text-white rounded-[10px] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="px-3 py-2 bg-[#191B1F] hover:bg-[#252A30] text-[#F5F7FA] rounded-[10px] text-xs font-semibold border border-[#252A30] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-[#27B9F2]" />
                  <span>Baixar SVG</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Intelligent Links & Screen Differentiator (7 cols) */}
          <div className="md:col-span-7 p-6 space-y-5 overflow-y-auto">
            {/* Host Base */}
            <div className="p-4 rounded-[12px] bg-[#111317] border border-[#252A30] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#27B9F2]" />
                  <span>Domínio Base (Vercel Host Free ou Próprio)</span>
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateKeys}
                  className="text-[10px] text-[#27B9F2] hover:underline flex items-center gap-1 font-mono"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Renovar Chaves</span>
                </button>
              </div>

              <input
                type="text"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="https://seu-projeto.vercel.app"
                className="w-full bg-[#191B1F] text-[#F5F7FA] text-xs rounded-[8px] px-3 py-2 border border-[#252A30] focus:border-[#27B9F2] font-mono"
              />
            </div>

            {/* SEÇÃO PRINCIPAL: OS 2 LINKS INTELIGENTES COM NOME DO APK */}
            <div className="p-4 rounded-[14px] bg-[#111317] border border-[#252A30] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#252A30]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>Links Diferenciados por Modo de Instalação</span>
                </h3>
              </div>

              {/* OPÇÃO 1: LINK DIRETO OFICIAL (COM NOME DO APK) */}
              <div className="p-3.5 rounded-[12px] bg-[#14171C] border border-[#1A73E8]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[6px] bg-[#1A73E8]/20 flex items-center justify-center text-[#1A73E8]">
                      <Link2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#F5F7FA]">Link Direto Oficial com Nome do APK</span>
                      <p className="text-[10px] text-[#9299A3]">Gera tela otimizada com indicador de Link Autenticado</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveSettings();
                      onOpenExclusivePage('link', directSig);
                    }}
                    className="px-2.5 py-1 bg-[#1A73E8]/20 hover:bg-[#1A73E8]/30 text-[#1A73E8] border border-[#1A73E8]/40 rounded-[6px] text-[11px] font-bold transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Ver Tela do Link</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={directTargetUrl}
                    className="flex-1 bg-[#191B1F] text-[#F5F7FA] rounded-[8px] px-3 py-1.5 border border-[#252A30] font-mono text-[11px] truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyDirectLink}
                    className="px-3 py-1.5 bg-[#1A73E8] hover:bg-[#1557b0] text-white rounded-[8px] text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                  >
                    {copiedDirectLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDirectLink ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* OPÇÃO 2: LINK VIA QR CODE (COM NOME DO APK) */}
              <div className="p-3.5 rounded-[12px] bg-[#14171C] border border-[#01875F]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[6px] bg-[#01875F]/20 flex items-center justify-center text-[#01875F]">
                      <QrCode className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#F5F7FA]">Link do QR Code Exclusivo com Nome do APK</span>
                      <p className="text-[10px] text-[#9299A3]">Gera tela com indicador de Sessão Móvel Escaneada</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveSettings();
                      onOpenExclusivePage('qrcode', qrSig);
                    }}
                    className="px-2.5 py-1 bg-[#01875F]/20 hover:bg-[#01875F]/30 text-[#01875F] border border-[#01875F]/40 rounded-[6px] text-[11px] font-bold transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Ver Tela do QR</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={qrTargetUrl}
                    className="flex-1 bg-[#191B1F] text-[#F5F7FA] rounded-[8px] px-3 py-1.5 border border-[#252A30] font-mono text-[11px] truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyQrLink}
                    className="px-3 py-1.5 bg-[#01875F] hover:bg-[#029e6f] text-white rounded-[8px] text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: Personalização Visual do QR Code e Cor da Marca */}
            <div className="p-4 rounded-[12px] bg-[#111317] border border-[#252A30] space-y-3">
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#01875F]" />
                <span>Identidade Visual & Cores do QR Code</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[#9299A3] flex items-center justify-between">
                    <span>Cor dos Módulos do QR:</span>
                    <span className="font-mono text-[10px] text-[#F5F7FA]">{darkColor}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={darkColor}
                      onChange={e => setDarkColor(e.target.value)}
                      className="w-8 h-8 rounded-[6px] border border-[#252A30] cursor-pointer bg-transparent"
                    />
                    <div className="flex gap-1">
                      {['#01875F', '#08090B', '#1A73E8', '#7C3AED', '#E11D48'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setDarkColor(c)}
                          className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[#9299A3] flex items-center justify-between">
                    <span>Cor de Fundo:</span>
                    <span className="font-mono text-[10px] text-[#F5F7FA]">{lightColor}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={lightColor}
                      onChange={e => setLightColor(e.target.value)}
                      className="w-8 h-8 rounded-[6px] border border-[#252A30] cursor-pointer bg-transparent"
                    />
                    <div className="flex gap-1">
                      {['#FFFFFF', '#F8F9FA', '#F1F3F4', '#0D1117'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setLightColor(c)}
                          className="w-5 h-5 rounded-full border border-black/20 transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Central & Moldura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#252A30]">
                <label className="flex items-center gap-2 p-2 rounded-[8px] bg-[#191B1F] border border-[#252A30] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={e => setIncludeLogo(e.target.checked)}
                    className="w-4 h-4 rounded text-[#01875F]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#F5F7FA] block">Ícone no Centro do QR</span>
                    <span className="text-[10px] text-[#9299A3] block">Insere logo oficial</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-[8px] bg-[#191B1F] border border-[#252A30] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFrame}
                    onChange={e => setShowFrame(e.target.checked)}
                    className="w-4 h-4 rounded text-[#01875F]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#F5F7FA] block">Moldura com Texto</span>
                    <span className="text-[10px] text-[#9299A3] block">Adiciona moldura CTA</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#252A30] bg-[#111317] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#9299A3]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Blindagem Anti-Invasão Ativa • Links Prontos para Vercel</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#191B1F] hover:bg-[#252A30] text-[#F5F7FA] rounded-[8px] text-xs font-semibold border border-[#252A30] transition-colors"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveSettings();
                onClose();
              }}
              className="px-4 py-2 bg-[#01875F] hover:bg-[#029e6f] text-white rounded-[8px] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
