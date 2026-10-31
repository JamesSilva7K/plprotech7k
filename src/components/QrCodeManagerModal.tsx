import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Image as ImageIcon,
  FileText,
  Printer,
  Sparkles,
  Upload,
} from 'lucide-react';
import { ApkItem, QrCustomization } from '../types/apk';
import {
  QrCodeConfig,
  QrFrameTemplate,
  exportQrAsPng,
  exportQrAsJpg,
  exportQrAsSvg,
  exportQrAsPdf,
  copyQrImageToClipboard,
  triggerFileDownload,
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
  // Aba ativa: 'image-generator' (Gerador da Imagem do QR) | 'links' (Gerenciador de Links)
  const [modalTab, setModalTab] = useState<'image-generator' | 'links'>('image-generator');

  // Configurações visuais do QR Code
  const [darkColor, setDarkColor] = useState(apk.qrSettings?.darkColor || '#01875F');
  const [lightColor, setLightColor] = useState(apk.qrSettings?.lightColor || '#FFFFFF');
  const [frameTemplate, setFrameTemplate] = useState<QrFrameTemplate>('badge');
  const [frameText, setFrameText] = useState(apk.qrSettings?.frameText || 'APONTE A CÂMERA E INSTALE');
  const [frameColor, setFrameColor] = useState(apk.qrSettings?.frameColor || '#01875F');
  const [resolution, setResolution] = useState<number>(1024);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>(apk.qrSettings?.errorCorrectionLevel || 'H');
  const [moduleRadius, setModuleRadius] = useState(apk.qrSettings?.moduleRadius ?? 0.35);

  // Ícone Central do QR Code
  const [includeLogo, setIncludeLogo] = useState(apk.qrSettings?.includeLogo ?? true);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(apk.iconSrc || '');
  const [logoRatio, setLogoRatio] = useState<number>(0.22);
  const [logoShape, setLogoShape] = useState<'rounded' | 'circle'>('rounded');

  // Domínio e Criptografia (Padrão Oficial: https://playstore-rosy.vercel.app)
  const [customDomain, setCustomDomain] = useState(
    apk.qrSettings?.customDomain ||
      (typeof window !== 'undefined' && !window.location.origin.includes('localhost')
        ? window.location.origin
        : 'https://playstore-rosy.vercel.app')
  );
  const [slug, setSlug] = useState(apk.qrSettings?.slug || generateQrSlug(apk.id));
  const [token, setToken] = useState(apk.qrSettings?.downloadToken || '');
  const [directSig, setDirectSig] = useState(apk.qrSettings?.directLinkSig || '');
  const [qrSig, setQrSig] = useState(apk.qrSettings?.qrCodeSig || '');

  // Estados de visualização e cópia
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);

  const customLogoInputRef = useRef<HTMLInputElement>(null);

  // Inicializa tokens e assinaturas
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

  const qrTargetUrl = buildIntelligentUrl(customDomain, apk.name, 'qrcode', qrSig, slug);
  const directTargetUrl = buildIntelligentUrl(customDomain, apk.name, 'link', directSig, slug);

  // Constrói objeto de configuração consolidado
  const currentConfig: QrCodeConfig = {
    content: qrTargetUrl,
    darkColor,
    lightColor,
    size: resolution,
    errorCorrectionLevel: errorLevel,
    frameTemplate,
    frameText,
    frameColor,
    logoUrl: includeLogo && customLogoUrl ? customLogoUrl : undefined,
    logoRatio,
    logoShape,
    moduleRadius,
    appDetails: {
      name: apk.name,
      company: apk.company,
      fileSize: apk.fileSize,
      version: apk.versionName || '1.0.0',
      downloads: apk.downloads,
    },
  };

  // Recalcula o preview sempre que um parâmetro mudar
  useEffect(() => {
    let isCancelled = false;

    async function updatePreview() {
      if (!qrTargetUrl) return;
      setIsGenerating(true);
      try {
        const previewUrl = await exportQrAsPng({ ...currentConfig, size: 600 });
        if (!isCancelled) {
          setPreviewDataUrl(previewUrl);
        }
      } catch (err) {
        console.error('Falha ao gerar preview do QR Code:', err);
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    }

    updatePreview();

    return () => {
      isCancelled = true;
    };
  }, [
    qrTargetUrl,
    darkColor,
    lightColor,
    frameTemplate,
    frameText,
    frameColor,
    includeLogo,
    customLogoUrl,
    logoRatio,
    logoShape,
    moduleRadius,
    errorLevel,
  ]);

  if (!isOpen) return null;

  // Handlers de Exportação
  const handleDownloadPng = async () => {
    try {
      const dataUrl = await exportQrAsPng(currentConfig);
      triggerFileDownload(dataUrl, `qrcode_${sanitizeAppNameForUrl(apk.name)}_${frameTemplate}`, 'png');
      onShowToast('PNG Baixado', 'Imagem PNG em alta resolução exportada com sucesso.', 'success');
    } catch {
      onShowToast('Erro na Exportação', 'Não foi possível exportar como PNG.', 'error');
    }
  };

  const handleDownloadJpg = async () => {
    try {
      const dataUrl = await exportQrAsJpg(currentConfig);
      triggerFileDownload(dataUrl, `qrcode_${sanitizeAppNameForUrl(apk.name)}_${frameTemplate}`, 'jpg');
      onShowToast('JPG Baixado', 'Imagem JPG otimizada exportada com sucesso.', 'success');
    } catch {
      onShowToast('Erro na Exportação', 'Não foi possível exportar como JPG.', 'error');
    }
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await exportQrAsSvg(currentConfig);
      triggerFileDownload(svgString, `qrcode_${sanitizeAppNameForUrl(apk.name)}_vetor`, 'svg');
      onShowToast('SVG Vetorial Baixado', 'Vetor escalável exportado com sucesso.', 'success');
    } catch {
      onShowToast('Erro na Exportação', 'Não foi possível exportar como SVG.', 'error');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await exportQrAsPdf(currentConfig, `cartaz_instalacao_${sanitizeAppNameForUrl(apk.name)}_A4`);
      onShowToast('PDF A4 Gerado', 'Cartaz para impressão exportado em PDF.', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Erro ao Gerar PDF', 'Não foi possível compilar o documento PDF.', 'error');
    }
  };

  const handleCopyImageToClipboard = async () => {
    setIsCopyingImage(true);
    const success = await copyQrImageToClipboard(currentConfig);
    setIsCopyingImage(false);
    if (success) {
      onShowToast('Imagem Copiada', 'QR Code copiado para a área de transferência. Basta colar com Ctrl+V no WhatsApp ou editor.', 'success');
    } else {
      onShowToast('Aviso de Compatibilidade', 'Copie o link ou baixe a imagem em PNG.', 'info');
    }
  };

  const handleCustomLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        setCustomLogoUrl(e.target.result as string);
        setIncludeLogo(true);
        onShowToast('Ícone Central Carregado', 'Novo logotipo central aplicado no QR Code.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = () => {
    const updatedSettings: QrCustomization = {
      darkColor,
      lightColor,
      size: resolution,
      errorCorrectionLevel: errorLevel,
      includeLogo,
      moduleRadius,
      showFrame: frameTemplate !== 'none',
      frameText,
      frameColor,
      downloadToken: token,
      slug,
      customDomain,
      directLinkSig: directSig,
      qrCodeSig: qrSig,
    };
    onUpdateApk({ qrSettings: updatedSettings });
    onShowToast('Configurações Salvas', 'Estilo visual e links do APK atualizados.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#0D0F12] border border-[#252A30] rounded-[20px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col max-h-[94vh] overflow-hidden animate-in zoom-in-95">
        {/* Header com Abas */}
        <div className="px-6 py-4 border-b border-[#252A30] flex items-center justify-between shrink-0 bg-[#111317]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#01875F]/15 border border-[#01875F]/40 flex items-center justify-center text-[#01875F] shadow-sm">
              <QrCode className="w-5 h-5 text-[#01875F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#F5F7FA]">
                  Gerador Visual de QR Code & Cartaz de Instalação
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  Espelhamento Direto via Câmera
                </span>
              </div>
              <p className="text-xs text-[#9299A3]">
                Aplicativo vinculado: <strong className="text-[#F5F7FA]">{apk.name}</strong> ({apk.fileName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Abas */}
            <div className="flex items-center gap-1 bg-[#191B1F] p-1 rounded-[10px] border border-[#252A30] text-xs">
              <button
                type="button"
                onClick={() => setModalTab('image-generator')}
                className={`px-3 py-1.5 rounded-[8px] font-semibold transition-colors flex items-center gap-1.5 ${
                  modalTab === 'image-generator'
                    ? 'bg-[#01875F] text-white shadow-xs'
                    : 'text-[#9299A3] hover:text-[#F5F7FA]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Imagem & Cartaz</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('links')}
                className={`px-3 py-1.5 rounded-[8px] font-semibold transition-colors flex items-center gap-1.5 ${
                  modalTab === 'links'
                    ? 'bg-[#1A73E8] text-white shadow-xs'
                    : 'text-[#9299A3] hover:text-[#F5F7FA]'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Links com Nome do APK</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#9299A3] hover:text-[#F5F7FA] hover:bg-[#191B1F] rounded-[8px] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-y-auto">
          {/* Coluna Esquerda: Preview do Cartaz / QR Code e Botões de Download Imediato (5 colunas) */}
          <div className="md:col-span-5 p-6 bg-[#0B0D10] border-b md:border-b-0 md:border-r border-[#252A30] flex flex-col items-center justify-between space-y-4">
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#9299A3] uppercase tracking-wider">
                  Cartaz / Imagem do QR Code
                </span>
                <span className="text-[10px] font-mono text-[#01875F] font-bold">
                  {resolution}x{resolution}px
                </span>
              </div>

              {/* Moldura de Exibição */}
              <div className="relative p-2 rounded-[16px] bg-[#14171C] border border-[#252A30] shadow-2xl flex items-center justify-center max-w-[320px] w-full min-h-[300px]">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Cartaz do QR Code"
                    className="w-full h-auto object-contain rounded-[12px] shadow-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#9299A3] text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#01875F]" />
                    <span>Renderizando cartaz em alta definição...</span>
                  </div>
                )}

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/40 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#27B9F2]" />
                  </div>
                )}
              </div>

              {/* Informação para o Lead com Ícone Vetorial */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9299A3] text-center mt-3 max-w-[320px] leading-relaxed">
                <Smartphone className="w-3.5 h-3.5 text-[#27B9F2] shrink-0" />
                <span>O lead aponta a câmera do smartphone para esta imagem e o download seguro do APK é acionado imediatamente.</span>
              </div>
            </div>

            {/* BARRA DE EXPORTAÇÃO COMPLETA: PNG, JPG, SVG, PDF E COPIAR */}
            <div className="w-full space-y-2 pt-2 border-t border-[#252A30]">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#9299A3] block">
                Exportar Imagem em Múltiplos Formatos:
              </span>

              {/* Grid de Formatos de Download */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={!previewDataUrl}
                  className="px-3 py-2 bg-[#01875F] hover:bg-[#029e6f] disabled:opacity-50 text-white rounded-[10px] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Baixar imagem em PNG alta definição"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJpg}
                  disabled={!previewDataUrl}
                  className="px-3 py-2 bg-[#191B1F] hover:bg-[#252A30] text-[#F5F7FA] rounded-[10px] text-xs font-semibold border border-[#252A30] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Baixar imagem em JPG otimizado"
                >
                  <Download className="w-3.5 h-3.5 text-[#27B9F2]" />
                  <span>Baixar JPG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="px-3 py-2 bg-[#191B1F] hover:bg-[#252A30] text-[#F5F7FA] rounded-[10px] text-xs font-semibold border border-[#252A30] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Baixar vetor SVG sem perda de qualidade"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-[#27B9F2]" />
                  <span>Baixar SVG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3 py-2 bg-[#191B1F] hover:bg-[#252A30] text-[#F5F7FA] rounded-[10px] text-xs font-semibold border border-[#252A30] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Baixar Cartaz A4 para Impressão em PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>Cartaz PDF A4</span>
                </button>
              </div>

              {/* Botão Copiar Imagem Diretamente (Ctrl+V) */}
              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                disabled={isCopyingImage}
                className="w-full px-3 py-2 bg-[#27B9F2]/15 hover:bg-[#27B9F2]/25 text-[#27B9F2] border border-[#27B9F2]/40 rounded-[10px] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Copiar imagem para colar no WhatsApp Web ou Photoshop"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCopyingImage ? 'Copiando...' : 'Copiar Imagem (Colar no WhatsApp)'}</span>
              </button>
            </div>
          </div>

          {/* Coluna Direita: Controles de Customização da Moldura e Ícone Central (7 colunas) */}
          <div className="md:col-span-7 p-6 space-y-5 overflow-y-auto">
            {modalTab === 'image-generator' ? (
              <>
                {/* 1. Escolha de Modelos de Moldura */}
                <div className="p-4 rounded-[14px] bg-[#111317] border border-[#252A30] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#01875F]" />
                      <span>Modelos e Formas de Moldura</span>
                    </label>
                    <span className="text-[10px] text-[#10B981] font-mono font-bold">5 Modelos Prontos</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'badge', name: 'Botão CTA', desc: 'Pílula inferior destacada' },
                      { id: 'scan-camera', name: 'Câmera Espelhada', desc: 'Borda com ícone de câmera' },
                      { id: 'playstore', name: 'Google Play Store', desc: 'Cartaz oficial com selo' },
                      { id: 'poster', name: 'Cartaz Comercial', desc: 'Banner superior e inferior' },
                      { id: 'none', name: 'QR Code Puro', desc: 'Sem moldura, apenas código' },
                    ].map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setFrameTemplate(tpl.id as QrFrameTemplate)}
                        className={`p-2.5 rounded-[10px] border text-left transition-all cursor-pointer ${
                          frameTemplate === tpl.id
                            ? 'bg-[#01875F]/20 border-[#01875F] text-[#F5F7FA] shadow-xs'
                            : 'bg-[#191B1F] border-[#252A30] hover:border-[#01875F]/50 text-[#9299A3]'
                        }`}
                      >
                        <p className="text-xs font-bold text-[#F5F7FA] leading-tight">{tpl.name}</p>
                        <p className="text-[10px] mt-0.5 opacity-80 truncate">{tpl.desc}</p>
                      </button>
                    ))}
                  </div>

                  {frameTemplate !== 'none' && (
                    <div className="space-y-1.5 pt-2 border-t border-[#252A30]">
                      <label className="text-[11px] font-medium text-[#9299A3]">
                        Texto da Moldura (Chamada de Ação):
                      </label>
                      <input
                        type="text"
                        value={frameText}
                        onChange={e => setFrameText(e.target.value.toUpperCase())}
                        placeholder="APONTE A CÂMERA E INSTALE"
                        className="w-full bg-[#191B1F] text-[#F5F7FA] text-xs rounded-[8px] px-3 py-2 border border-[#252A30] focus:border-[#01875F] font-bold uppercase"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Personalização do Ícone do Meio do QR Code */}
                <div className="p-4 rounded-[14px] bg-[#111317] border border-[#252A30] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#27B9F2]" />
                      <span>Ícone do Meio do QR Code</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-[#9299A3] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeLogo}
                        onChange={e => setIncludeLogo(e.target.checked)}
                        className="rounded text-[#01875F]"
                      />
                      <span>Exibir Ícone Central</span>
                    </label>
                  </div>

                  {includeLogo && (
                    <div className="space-y-3 pt-1">
                      {/* Upload de Imagem Personalizada ou Uso do APK */}
                      <div className="flex items-center gap-3 p-3 bg-[#191B1F] border border-[#252A30] rounded-[10px]">
                        <div className="w-12 h-12 rounded-[10px] bg-[#111317] border border-[#252A30] overflow-hidden flex items-center justify-center shrink-0">
                          {customLogoUrl ? (
                            <img src={customLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-[#9299A3]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#F5F7FA] truncate">
                            {customLogoUrl === apk.iconSrc ? 'Usando Ícone Oficial do APK' : 'Imagem Customizada Carregada'}
                          </p>
                          <p className="text-[10px] text-[#9299A3]">
                            Centralizado com fundo de alto contraste para não falhar a leitura da câmera.
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setCustomLogoUrl(apk.iconSrc || '')}
                            className="px-2.5 py-1.5 bg-[#252A30] hover:bg-[#323842] text-[#F5F7FA] rounded-[6px] text-[11px] font-semibold"
                            title="Voltar para o ícone padrão do APK"
                          >
                            Usar APK
                          </button>
                          <button
                            type="button"
                            onClick={() => customLogoInputRef.current?.click()}
                            className="px-3 py-1.5 bg-[#27B9F2] hover:bg-[#38c8ff] text-[#08090B] rounded-[6px] text-xs font-bold flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3 stroke-[2.5]" />
                            <span>Upload</span>
                          </button>
                          <input
                            ref={customLogoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              if (e.target.files?.[0]) handleCustomLogoUpload(e.target.files[0]);
                            }}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Ajustes Finos da Logo Central */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[#9299A3]">
                            Formato do Fundo:
                          </label>
                          <select
                            value={logoShape}
                            onChange={e => setLogoShape(e.target.value as any)}
                            className="w-full bg-[#191B1F] text-[#F5F7FA] text-xs rounded-[8px] px-2.5 py-1.5 border border-[#252A30]"
                          >
                            <option value="rounded">Cantos Arredondados</option>
                            <option value="circle">Circular Perfeito</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-[#9299A3] flex items-center justify-between">
                            <span>Tamanho no Centro:</span>
                            <span className="font-mono text-[10px] text-[#27B9F2]">{Math.round(logoRatio * 100)}%</span>
                          </label>
                          <input
                            type="range"
                            min="0.16"
                            max="0.28"
                            step="0.02"
                            value={logoRatio}
                            onChange={e => setLogoRatio(parseFloat(e.target.value))}
                            className="w-full accent-[#01875F] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Cores e Resolução de Exportação */}
                <div className="p-4 rounded-[14px] bg-[#111317] border border-[#252A30] space-y-3">
                  <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#01875F]" />
                    <span>Cores do QR Code & Moldura</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#9299A3]">Cor do QR:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={darkColor}
                          onChange={e => setDarkColor(e.target.value)}
                          className="w-8 h-8 rounded-[6px] border border-[#252A30] cursor-pointer bg-transparent"
                        />
                        <span className="text-[11px] font-mono text-[#F5F7FA]">{darkColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#9299A3]">Cor de Fundo:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={lightColor}
                          onChange={e => setLightColor(e.target.value)}
                          className="w-8 h-8 rounded-[6px] border border-[#252A30] cursor-pointer bg-transparent"
                        />
                        <span className="text-[11px] font-mono text-[#F5F7FA]">{lightColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#9299A3]">Cor da Moldura:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={frameColor}
                          onChange={e => setFrameColor(e.target.value)}
                          className="w-8 h-8 rounded-[6px] border border-[#252A30] cursor-pointer bg-transparent"
                        />
                        <span className="text-[11px] font-mono text-[#F5F7FA]">{frameColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#252A30]">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#9299A3]">Resolução da Imagem:</label>
                      <select
                        value={resolution}
                        onChange={e => setResolution(parseInt(e.target.value))}
                        className="w-full bg-[#191B1F] text-[#F5F7FA] text-xs rounded-[8px] px-2.5 py-1.5 border border-[#252A30]"
                      >
                        <option value={512}>Padrão (512x512)</option>
                        <option value={1024}>Alta Resolução HD (1024x1024)</option>
                        <option value={2048}>Ultra 4K Impressão (2048x2048)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#9299A3]">Formato dos Módulos:</label>
                      <select
                        value={moduleRadius}
                        onChange={e => setModuleRadius(parseFloat(e.target.value))}
                        className="w-full bg-[#191B1F] text-[#F5F7FA] text-xs rounded-[8px] px-2.5 py-1.5 border border-[#252A30]"
                      >
                        <option value={0}>Quadrado Clássico</option>
                        <option value={0.35}>Cantos Suavemente Arredondados</option>
                        <option value={0.75}>Módulos Circulares / Dots</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* ABA 2: LINKS BLINDADOS COM O NOME DO APK */
              <div className="space-y-4">
                <div className="p-4 rounded-[12px] bg-[#111317] border border-[#252A30] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#27B9F2]" />
                      <span>Domínio de Destino (Vercel Host Free)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value)}
                    placeholder="https://seu-projeto.vercel.app"
                    className="w-full bg-[#191B1F] text-[#F5F7FA] text-xs rounded-[8px] px-3 py-2 border border-[#252A30] font-mono"
                  />
                </div>

                {/* Link Direto */}
                <div className="p-4 rounded-[12px] bg-[#14171C] border border-[#1A73E8]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-[#1A73E8]" />
                      <span className="text-xs font-bold text-[#F5F7FA]">Link Direto Oficial com Nome do APK</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveSettings();
                        onOpenExclusivePage('link', directSig);
                      }}
                      className="px-2.5 py-1 bg-[#1A73E8]/20 hover:bg-[#1A73E8]/30 text-[#1A73E8] rounded-[6px] text-[11px] font-bold"
                    >
                      Testar Tela do Link
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={directTargetUrl}
                      className="flex-1 bg-[#191B1F] text-[#F5F7FA] rounded-[8px] px-3 py-1.5 border border-[#252A30] font-mono text-[11px] truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(directTargetUrl);
                        setCopiedDirectLink(true);
                        onShowToast('Link Direto Copiado', directTargetUrl, 'success');
                        setTimeout(() => setCopiedDirectLink(false), 2500);
                      }}
                      className="px-3 py-1.5 bg-[#1A73E8] text-white rounded-[8px] text-xs font-bold"
                    >
                      {copiedDirectLink ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {/* Link QR Code */}
                <div className="p-4 rounded-[12px] bg-[#14171C] border border-[#01875F]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#01875F]" />
                      <span className="text-xs font-bold text-[#F5F7FA]">Link Codificado no QR Code</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveSettings();
                        onOpenExclusivePage('qrcode', qrSig);
                      }}
                      className="px-2.5 py-1 bg-[#01875F]/20 hover:bg-[#01875F]/30 text-[#01875F] rounded-[6px] text-[11px] font-bold"
                    >
                      Testar Tela do QR
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={qrTargetUrl}
                      className="flex-1 bg-[#191B1F] text-[#F5F7FA] rounded-[8px] px-3 py-1.5 border border-[#252A30] font-mono text-[11px] truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(qrTargetUrl);
                        setCopiedLink(true);
                        onShowToast('Link do QR Copiado', qrTargetUrl, 'success');
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      className="px-3 py-1.5 bg-[#01875F] text-white rounded-[8px] text-xs font-bold"
                    >
                      {copiedLink ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3.5 border-t border-[#252A30] bg-[#111317] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#9299A3]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Formatos Prontos: PNG • JPG • SVG • PDF A4 • Clipboard</span>
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
