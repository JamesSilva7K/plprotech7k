import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Download,
  QrCode,
  ShieldCheck,
  Smartphone,
  Calendar,
  Users,
  HardDrive,
  SlidersHorizontal,
  FileCode2,
  Lock,
  Layers,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { ApkItem } from '../types/apk';
import { GooglePlayLogo } from './GooglePlayLogo';
import {
  QrCodeConfig,
  exportQrAsPng,
  exportQrAsSvg,
  exportQrAsPdf,
  copyQrImageToClipboard,
  triggerFileDownload,
} from '../utils/qrGenerator';
import {
  generateDownloadToken,
  generateBlindSignature,
  generateQrSlug,
  buildIntelligentUrl,
  sanitizeAppNameForUrl,
} from '../utils/crypto';
import { getApkRealMetrics } from '../utils/realMetricsTracker';

interface FinalizedPageModalProps {
  apk: ApkItem;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, description?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onOpenAdvancedCustomizer?: (apk: ApkItem) => void;
}

export function FinalizedPageModal({
  apk,
  isOpen,
  onClose,
  onShowToast,
  onOpenAdvancedCustomizer,
}: FinalizedPageModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedQrImage, setCopiedQrImage] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  // Domínio e Criptografia
  const customDomain =
    apk.qrSettings?.customDomain ||
    (typeof window !== 'undefined' && !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://playstore-rosy.vercel.app');

  const slug = apk.qrSettings?.slug || generateQrSlug(apk.id);
  const [directSig, setDirectSig] = useState<string>('');
  const [qrSig, setQrSig] = useState<string>('');

  useEffect(() => {
    async function loadSignatures() {
      const sLink = await generateBlindSignature(apk.name, 'link', apk.id);
      const sQr = await generateBlindSignature(apk.name, 'qrcode', apk.id);
      setDirectSig(sLink);
      setQrSig(sQr);
    }
    if (isOpen) {
      loadSignatures();
    }
  }, [apk.id, apk.name, isOpen]);

  const directTargetUrl = buildIntelligentUrl(customDomain, apk.name, 'link', directSig, slug);
  const qrTargetUrl = buildIntelligentUrl(customDomain, apk.name, 'qrcode', qrSig, slug);

  // Configuração pura do QR Code limpo (apenas QR code em alta resolução com o ícone oficial no centro)
  const qrConfig: QrCodeConfig = {
    content: qrTargetUrl,
    darkColor: apk.qrSettings?.darkColor || apk.themeColor || '#01875F',
    lightColor: '#FFFFFF',
    size: 1024,
    errorCorrectionLevel: 'H',
    frameTemplate: 'none',
    logoUrl: apk.iconSrc || undefined,
    logoRatio: 0.22,
    logoShape: 'rounded',
    moduleRadius: 0.35,
    padding: 16,
    appDetails: {
      name: apk.name,
      company: apk.company,
      fileSize: apk.fileSize,
      version: apk.versionName || '1.0.0',
    },
  };

  // Gera o preview limpo do QR Code
  useEffect(() => {
    if (!isOpen || !qrTargetUrl) return;
    let isCancelled = false;

    async function generate() {
      setIsGeneratingQr(true);
      try {
        const url = await exportQrAsPng({ ...qrConfig, size: 512 });
        if (!isCancelled) {
          setQrDataUrl(url);
        }
      } catch (e) {
        console.error('Falha ao gerar QR Code finalizado:', e);
      } finally {
        if (!isCancelled) {
          setIsGeneratingQr(false);
        }
      }
    }

    generate();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, qrTargetUrl, apk.iconSrc]);

  if (!isOpen) return null;

  const metrics = getApkRealMetrics(apk.id, apk.createdAt || apk.uploadedAt);

  // Ações de Cópia e Compartilhamento
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directTargetUrl);
      setCopiedLink(true);
      onShowToast('Link Oficial Copiado', 'Link criptografado pronto para enviar ao lead.', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      onShowToast('Erro ao Copiar', 'Não foi possível copiar automaticamente.', 'error');
    }
  };

  const handleCopyMessage = async () => {
    const message = `🚀 *Acesso Oficial ao Aplicativo ${apk.name}*\n\nOlá! Segue o link verificado para download e instalação do app oficial:\n👉 ${directTargetUrl}\n\n📦 *Pacote:* ${apk.fileName} (${apk.fileSize})\n🛡️ *Segurança:* Verificado e autenticado via Google Play Protect.`;
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessage(true);
      onShowToast('Mensagem Copiada', 'Texto de apresentação pronto para colar no WhatsApp.', 'success');
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      onShowToast('Erro ao Copiar', 'Não foi possível copiar a mensagem.', 'error');
    }
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `🚀 *Acesso Oficial ao Aplicativo ${apk.name}*\n\nOlá! Segue o link oficial para download seguro:\n${directTargetUrl}\n\n🛡️ Verificado pelo Google Play Protect.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    onShowToast('WhatsApp Iniciado', 'Janela de envio aberta com sucesso.', 'info');
  };

  const handleCopySha = async () => {
    if (!apk.sha256) return;
    try {
      await navigator.clipboard.writeText(apk.sha256);
      setCopiedSha(true);
      onShowToast('Assinatura Copiada', 'Hash SHA-256 copiado para a área de transferência.', 'success');
      setTimeout(() => setCopiedSha(false), 2000);
    } catch {}
  };

  const handleDownloadPng = async () => {
    try {
      const data = await exportQrAsPng({ ...qrConfig, size: 1024 });
      const safeName = sanitizeAppNameForUrl(apk.name);
      triggerFileDownload(data, `qrcode-${safeName}-oficial.png`);
      onShowToast('Download Concluído', 'QR Code em alta definição (PNG 1024px) baixado.', 'success');
    } catch {
      onShowToast('Erro no Download', 'Falha ao baixar imagem PNG.', 'error');
    }
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await exportQrAsSvg(qrConfig);
      const safeName = sanitizeAppNameForUrl(apk.name);
      triggerFileDownload(svgString, `qrcode-${safeName}-vetorial.svg`, 'svg');
      onShowToast('Download Concluído', 'QR Code vetorial (SVG) baixado.', 'success');
    } catch {
      onShowToast('Erro no Download', 'Falha ao baixar arquivo SVG.', 'error');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const safeName = sanitizeAppNameForUrl(apk.name);
      await exportQrAsPdf(qrConfig, `qrcode-${safeName}-oficial.pdf`);
      onShowToast('Download Concluído', 'Documento PDF com QR Code gerado.', 'success');
    } catch {
      onShowToast('Erro no Download', 'Falha ao gerar PDF.', 'error');
    }
  };

  const handleCopyQrImage = async () => {
    try {
      const ok = await copyQrImageToClipboard(qrConfig);
      if (ok) {
        setCopiedQrImage(true);
        onShowToast('Imagem Copiada', 'Cole a imagem do QR Code direto no WhatsApp ou chat (Ctrl+V).', 'success');
        setTimeout(() => setCopiedQrImage(false), 2500);
      } else {
        throw new Error();
      }
    } catch {
      onShowToast('Não Suportado', 'Seu navegador não suporta cópia direta de imagens na área de transferência. Use a opção Baixar PNG.', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#111316] border border-[#252A30] rounded-[20px] shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 my-auto flex flex-col">
        {/* Header Superior */}
        <div className="px-6 py-4 bg-[#16181D] border-b border-[#252A30] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#01875F]/20 border border-[#01875F]/40 flex items-center justify-center text-[#01875F]">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#F5F7FA]">Página Oficial Pronta & Central de Envio</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#01875F]/20 text-[#01875F] border border-[#01875F]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#01875F] animate-pulse" />
                  100% Sincronizado
                </span>
              </div>
              <p className="text-xs text-[#9299A3]">
                Processo finalizado com sucesso. Link oficial blindado e QR Code exclusivo prontos para envio ao lead.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#9299A3] hover:text-[#F5F7FA] hover:bg-[#1F2228] rounded-[8px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Principal em 2 Colunas */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* COLUNA ESQUERDA: Card Oficial da Aplicação (Visão do Lead) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#9299A3] uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#27B9F2]" />
                Card Oficial de Publicação
              </span>
              <span className="text-[10px] text-[#01875F] font-mono font-semibold">
                Google Play Protect Ativo
              </span>
            </div>

            {/* Card com Estilo Oficial de Loja */}
            <div className="p-4 rounded-[16px] bg-[#16181D] border border-[#252A30] space-y-4 shadow-lg relative overflow-hidden group">
              {/* Efeito sutil de brilho superior */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#01875F] via-[#27B9F2] to-[#01875F]" />

              {/* Informações Principais */}
              <div className="flex items-start gap-3.5">
                <div className="relative w-16 h-16 rounded-[14px] overflow-hidden bg-[#1F2228] border border-[#252A30] shrink-0 shadow-md flex items-center justify-center">
                  {apk.iconSrc ? (
                    <img
                      src={apk.iconSrc}
                      alt={apk.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center text-white text-xl font-black ${
                      apk.iconSrc ? 'hidden' : 'flex'
                    }`}
                    style={{ background: 'linear-gradient(135deg, #01875f 0%, #004d40 100%)' }}
                  >
                    {apk.name.charAt(0)}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#F5F7FA] leading-snug truncate">
                    {apk.name}
                  </h3>
                  <p className="text-xs text-[#27B9F2] font-medium truncate mt-0.5">
                    {apk.company}
                  </p>
                  <p className="text-[11px] text-[#9299A3] truncate">
                    {apk.category} · {apk.ratingAvg || '4.9'} ★
                  </p>
                </div>
              </div>

              {/* Selo Play Protect */}
              <div className="p-2.5 rounded-[10px] bg-[#01875F]/10 border border-[#01875F]/25 flex items-center gap-2 text-[#01875F]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-semibold leading-tight">
                  Pacote verificado pelo Google Play Protect contra ameaças
                </span>
              </div>

              {/* Detalhes Técnicos do Pacote */}
              <div className="space-y-1.5 pt-2 border-t border-[#252A30] text-[11px] text-[#9299A3]">
                <div className="flex items-center justify-between">
                  <span>Arquivo:</span>
                  <span className="font-mono text-[#F5F7FA] truncate max-w-[180px]">{apk.fileName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tamanho:</span>
                  <span className="text-[#F5F7FA] font-medium">{apk.fileSize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Versão Oficial:</span>
                  <span className="font-mono text-[#F5F7FA]">{apk.versionName || '1.0.0'} (API 34)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data de Criação:</span>
                  <span className="text-[#F5F7FA]">{apk.createdAt || apk.uploadedAt || 'Hoje'}</span>
                </div>
              </div>

              {/* Assinatura Criptográfica SHA-256 */}
              {apk.sha256 && (
                <div className="space-y-1 pt-2 border-t border-[#252A30]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#9299A3] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#27B9F2]" />
                      Assinatura SHA-256:
                    </span>
                    <button
                      onClick={handleCopySha}
                      className="text-[10px] text-[#27B9F2] hover:underline flex items-center gap-1"
                    >
                      {copiedSha ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedSha ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="p-1.5 rounded-[6px] bg-[#111316] border border-[#252A30] font-mono text-[9px] text-[#9299A3] break-all select-all">
                    {apk.sha256}
                  </div>
                </div>
              )}

              {/* Métricas Reais do APK */}
              <div className="pt-2 border-t border-[#252A30] grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-[8px] bg-[#111316] border border-[#252A30]">
                  <span className="text-[10px] text-[#9299A3] block">Leads</span>
                  <span className="text-sm font-bold text-[#F5F7FA]">{metrics.views}</span>
                </div>
                <div className="p-2 rounded-[8px] bg-[#111316] border border-[#252A30]">
                  <span className="text-[10px] text-[#9299A3] block">Downloads</span>
                  <span className="text-sm font-bold text-[#10B981]">{metrics.downloads}</span>
                </div>
                <div className="p-2 rounded-[8px] bg-[#111316] border border-[#252A30]">
                  <span className="text-[10px] text-[#9299A3] block">Conversão</span>
                  <span className="text-sm font-bold text-[#27B9F2]">{metrics.conversionRate}%</span>
                </div>
              </div>

              {/* Botão de Testar Página Oficial */}
              <a
                href={directTargetUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-[#1F2228] hover:bg-[#252A30] text-[#27B9F2] border border-[#27B9F2]/40 rounded-[8px] text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Testar Página Oficial do Lead</span>
              </a>
            </div>
          </div>

          {/* COLUNA DIREITA: Meios de Envio ao Lead & QR Code Criado */}
          <div className="lg:col-span-7 space-y-5">
            {/* Bloco 1: O Link Pronto para Envio */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#27B9F2]" />
                  <span>Link Oficial Pronto para Enviar ao Lead</span>
                </label>
                <span className="text-[10px] text-[#10B981] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Assinatura Blindada HMAC
                </span>
              </div>

              {/* Campo do Link com Botão Copiar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={directTargetUrl}
                    className="w-full bg-[#16181D] text-[#F5F7FA] font-mono text-xs rounded-[10px] pl-3 pr-9 py-2.5 border border-[#252A30] focus:outline-none select-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#01875F]">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-[10px] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    copiedLink
                      ? 'bg-[#01875F] text-white shadow-[0_2px_10px_rgba(1,135,95,0.4)]'
                      : 'bg-[#27B9F2] hover:bg-[#38c8ff] text-[#08090B] shadow-sm'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>

              {/* Botões Rápidos de Envio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="px-3 py-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 rounded-[10px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Enviar no WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className={`px-3 py-2 rounded-[10px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    copiedMessage
                      ? 'bg-[#01875F]/20 text-[#01875F] border-[#01875F]'
                      : 'bg-[#191B1F] hover:bg-[#252A30] text-[#F5F7FA] border-[#252A30]'
                  }`}
                >
                  {copiedMessage ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-[#27B9F2]" />}
                  <span>{copiedMessage ? 'Mensagem Copiada!' : 'Copiar Texto Pronto de Envio'}</span>
                </button>
              </div>
            </div>

            {/* Bloco 2: Apenas o QR Code Já Criado (Alta Resolução) */}
            <div className="p-4 rounded-[16px] bg-[#16181D] border border-[#252A30] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#252A30]">
                <div>
                  <h4 className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-[#01875F]" />
                    <span>QR Code Oficial Pronto (Espelhar pela Câmera)</span>
                  </h4>
                  <p className="text-[11px] text-[#9299A3]">
                    QR Code limpo de alta resolução gerado para o lead escanear diretamente pela câmera do celular.
                  </p>
                </div>

                {onOpenAdvancedCustomizer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdvancedCustomizer(apk);
                    }}
                    className="text-[11px] text-[#27B9F2] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Molduras & Estilos</span>
                  </button>
                )}
              </div>

              {/* Preview do QR Code Limpo e Opções */}
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Visualizador do QR Code */}
                <div className="relative p-3 bg-white rounded-[14px] shadow-md border border-gray-200 shrink-0 flex items-center justify-center w-[160px] h-[160px]">
                  {isGeneratingQr ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 text-xs gap-1.5">
                      <div className="w-5 h-5 border-2 border-[#01875F] border-t-transparent rounded-full animate-spin" />
                      <span>Gerando QR...</span>
                    </div>
                  ) : qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code Oficial"
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                </div>

                {/* Painel de Ações Rápidas do QR Code */}
                <div className="flex-1 w-full space-y-2">
                  <span className="text-[11px] font-semibold text-[#9299A3] block">
                    Opções Rápidas de Download & Envio:
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Baixar PNG */}
                    <button
                      type="button"
                      onClick={handleDownloadPng}
                      className="p-2.5 rounded-[10px] bg-[#111316] hover:bg-[#1F2228] border border-[#252A30] hover:border-[#01875F] text-[#F5F7FA] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#01875F]" />
                      <div className="text-left">
                        <span className="block leading-tight">Baixar PNG</span>
                        <span className="text-[9px] text-[#9299A3]">1024px Alta Def.</span>
                      </div>
                    </button>

                    {/* Baixar SVG */}
                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className="p-2.5 rounded-[10px] bg-[#111316] hover:bg-[#1F2228] border border-[#252A30] hover:border-[#27B9F2] text-[#F5F7FA] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#27B9F2]" />
                      <div className="text-left">
                        <span className="block leading-tight">Baixar SVG</span>
                        <span className="text-[9px] text-[#9299A3]">Vetor Escalável</span>
                      </div>
                    </button>

                    {/* Copiar Imagem do QR Code */}
                    <button
                      type="button"
                      onClick={handleCopyQrImage}
                      className={`p-2.5 rounded-[10px] border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        copiedQrImage
                          ? 'bg-[#01875F]/20 text-[#01875F] border-[#01875F]'
                          : 'bg-[#111316] hover:bg-[#1F2228] border-[#252A30] text-[#F5F7FA]'
                      }`}
                    >
                      {copiedQrImage ? (
                        <Check className="w-3.5 h-3.5 text-[#01875F]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#27B9F2]" />
                      )}
                      <div className="text-left">
                        <span className="block leading-tight">
                          {copiedQrImage ? 'Copiado!' : 'Copiar Imagem'}
                        </span>
                        <span className="text-[9px] text-[#9299A3]">Colar direto no chat</span>
                      </div>
                    </button>

                    {/* Baixar PDF */}
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="p-2.5 rounded-[10px] bg-[#111316] hover:bg-[#1F2228] border border-[#252A30] hover:border-[#F59E0B] text-[#F5F7FA] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <div className="text-left">
                        <span className="block leading-tight">Baixar PDF</span>
                        <span className="text-[9px] text-[#9299A3]">Para Impressão</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-3.5 bg-[#16181D] border-t border-[#252A30] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#9299A3]">
            <CheckCircle2 className="w-4 h-4 text-[#01875F]" />
            <span>Link e QR Code ativos e prontos para captação de leads.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 bg-[#01875F] hover:bg-[#029e6f] text-white rounded-[10px] text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(1,135,95,0.3)] cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Link do Lead</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#191B1F] hover:bg-[#252A30] text-[#F5F7FA] rounded-[10px] text-xs font-semibold transition-colors"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
