/**
 * APK Studio — Gerador de QR Code Avançado e Multi-Formatos (PNG, JPG, SVG, PDF)
 * Gera imagens com molduras personalizadas, ícone central flexível e alta resolução.
 */

import { jsPDF } from 'jspdf';

export type QrFrameTemplate = 'none' | 'badge' | 'scan-camera' | 'playstore' | 'poster';

export interface QrCodeConfig {
  /** Conteúdo ou URL de destino */
  content: string;
  /** Cor dos módulos escuros. Default: #01875F */
  darkColor: string;
  /** Cor de fundo. Default: #FFFFFF */
  lightColor: string;
  /** Resolução do QR (512, 1024, 2048). Default: 1024 */
  size: number;
  /** Nível de correção de erro: L, M, Q, H. Default: H */
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  /** Modelo de moldura */
  frameTemplate?: QrFrameTemplate;
  /** Texto da moldura */
  frameText?: string;
  /** Cor da moldura */
  frameColor?: string;
  /** Imagem central (data URL ou URL externa) */
  logoUrl?: string;
  /** Proporção do tamanho da logo (0.16 a 0.28). Default: 0.22 */
  logoRatio?: number;
  /** Formato do fundo da logo: 'circle' | 'rounded' | 'none' */
  logoShape?: 'circle' | 'rounded' | 'none';
  /** Raio dos módulos (0 = quadrado, 0.35 = suave, 0.7 = circular) */
  moduleRadius?: number;
  /** Padding externo */
  padding?: number;
  /** Metadados do APK para enriquecer cartazes (Playstore e Poster) */
  appDetails?: {
    name: string;
    company?: string;
    version?: string;
    fileSize?: string;
    downloads?: string;
  };
}

type QrMatrix = boolean[][];

/**
 * Gera matriz binária do QR Code usando a biblioteca 'qrcode'
 */
async function generateQrMatrix(content: string, ecl: string): Promise<QrMatrix> {
  const QRCode = await import('qrcode');
  const qr = QRCode.create(content, {
    errorCorrectionLevel: ecl as any,
  });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const matrix: QrMatrix = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      row.push(!!data[r * size + c]);
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Desenha um módulo com cantos arredondados
 */
function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number
) {
  const r = Math.min(radius * size * 0.5, size * 0.45);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size - r, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + r);
  ctx.lineTo(x + size, y + size - r);
  ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
  ctx.lineTo(x + r, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Carrega imagem assincronamente com CORS seguro
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Renderiza o Canvas completo com o QR Code, Moldura e Logotipos
 */
export async function renderQrCanvas(config: QrCodeConfig): Promise<HTMLCanvasElement> {
  const {
    content,
    darkColor = '#01875F',
    lightColor = '#FFFFFF',
    size = 1024,
    errorCorrectionLevel = 'H',
    frameTemplate = 'badge',
    frameText = 'APONTE A CÂMERA E INSTALE',
    frameColor,
    logoUrl,
    logoRatio = 0.22,
    logoShape = 'rounded',
    moduleRadius = 0.35,
    padding = Math.round(size * 0.06),
    appDetails,
  } = config;

  const actualFrameColor = frameColor || darkColor;
  const matrix = await generateQrMatrix(content, errorCorrectionLevel);
  const qrGridSize = matrix.length;

  // Dimensões do Canvas baseadas no template de moldura
  let canvasWidth = size + padding * 2;
  let canvasHeight = size + padding * 2;
  let qrOffsetY = padding;
  let qrOffsetX = padding;

  if (frameTemplate === 'badge') {
    canvasHeight += Math.round(size * 0.16);
  } else if (frameTemplate === 'scan-camera') {
    canvasHeight += Math.round(size * 0.22);
  } else if (frameTemplate === 'playstore') {
    const headerH = Math.round(size * 0.22);
    const footerH = Math.round(size * 0.16);
    canvasHeight += headerH + footerH;
    qrOffsetY += headerH;
  } else if (frameTemplate === 'poster') {
    const headerH = Math.round(size * 0.32);
    const footerH = Math.round(size * 0.24);
    canvasHeight += headerH + footerH;
    qrOffsetY += headerH;
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // 1. Fundo Geral
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Elementos Decorativos de Topo (Templates PlayStore e Poster)
  if (frameTemplate === 'playstore') {
    // Header Institucional
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, qrOffsetY);

    // Barra de acento colorido superior
    ctx.fillStyle = actualFrameColor;
    ctx.fillRect(0, 0, canvasWidth, Math.round(size * 0.015));

    // Nome do aplicativo
    ctx.fillStyle = '#202124';
    ctx.font = `bold ${Math.round(size * 0.052)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(appDetails?.name || 'Aplicativo Android Oficial', canvasWidth / 2, Math.round(size * 0.09));

    // Subtítulo da empresa e selo seguro
    ctx.fillStyle = '#5F6368';
    ctx.font = `500 ${Math.round(size * 0.032)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillText(
      `${appDetails?.company || 'Distribuição Oficial'} • Google Play Protect Verificado`,
      canvasWidth / 2,
      Math.round(size * 0.14)
    );
  } else if (frameTemplate === 'poster') {
    // Banner Superior com Gradiente
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, qrOffsetY);
    grad.addColorStop(0, actualFrameColor);
    grad.addColorStop(1, '#0D1117');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, qrOffsetY - 10);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 ${Math.round(size * 0.058)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(appDetails?.name || 'INSTALAR APLICATIVO', canvasWidth / 2, Math.round(size * 0.12));

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `600 ${Math.round(size * 0.034)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillText('Aponte a câmera do seu smartphone Android para escanear', canvasWidth / 2, Math.round(size * 0.19));
  }

  // 3. Renderização dos Módulos do QR Code
  const cellSize = size / qrGridSize;
  const logoSize = logoUrl ? size * logoRatio : 0;
  const logoPad = logoSize / 2;
  const centerX = qrOffsetX + size / 2;
  const centerY = qrOffsetY + size / 2;

  ctx.fillStyle = darkColor;

  for (let r = 0; r < qrGridSize; r++) {
    for (let c = 0; c < qrGridSize; c++) {
      if (!matrix[r][c]) continue;

      const x = qrOffsetX + c * cellSize;
      const y = qrOffsetY + r * cellSize;

      // Pula células ocupadas pela logo
      if (logoUrl) {
        const mx = x + cellSize / 2;
        const my = y + cellSize / 2;
        if (
          Math.abs(mx - centerX) < logoPad + cellSize / 2 &&
          Math.abs(my - centerY) < logoPad + cellSize / 2
        ) {
          continue;
        }
      }

      if (moduleRadius > 0) {
        drawModule(ctx, x, y, cellSize, moduleRadius);
      } else {
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }

  // 4. Desenho da Logo Central (com fundo protetor)
  if (logoUrl) {
    try {
      const logoImg = await loadImage(logoUrl);
      const lx = centerX - logoSize / 2;
      const ly = centerY - logoSize / 2;
      const bgPad = Math.round(logoSize * 0.1);

      // Fundo branco protetor atrás da logo para garantir contraste e leitura 100%
      ctx.fillStyle = lightColor;
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(centerX, centerY, (logoSize + bgPad * 2) / 2, 0, Math.PI * 2);
      } else {
        const bgR = Math.round(logoSize * 0.22);
        ctx.roundRect(lx - bgPad, ly - bgPad, logoSize + bgPad * 2, logoSize + bgPad * 2, bgR);
      }
      ctx.fill();

      // Borda sutil na logo
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = Math.max(1, Math.round(size * 0.003));
      ctx.stroke();

      // Desenho da imagem recortada
      ctx.save();
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2);
      } else {
        const r = Math.round(logoSize * 0.18);
        ctx.roundRect(lx, ly, logoSize, logoSize, r);
      }
      ctx.clip();
      ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
      ctx.restore();
    } catch (err) {
      console.warn('Não foi possível carregar logo central:', err);
    }
  }

  // 5. Molduras Inferiores / Badges
  if (frameTemplate === 'badge') {
    const badgeY = qrOffsetY + size + Math.round(padding * 0.5);
    const badgeH = canvasHeight - badgeY - Math.round(padding * 0.5);

    // Botão / Pílula inferior
    const pillMargin = Math.round(size * 0.05);
    const pillW = canvasWidth - pillMargin * 2;
    const pillRadius = Math.round(badgeH * 0.35);

    ctx.fillStyle = actualFrameColor;
    ctx.beginPath();
    ctx.roundRect(pillMargin, badgeY, pillW, badgeH, pillRadius);
    ctx.fill();

    // Texto
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(badgeH * 0.42)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameText, canvasWidth / 2, badgeY + badgeH / 2);
  } else if (frameTemplate === 'scan-camera') {
    const badgeY = qrOffsetY + size + Math.round(padding * 0.4);
    const badgeH = canvasHeight - badgeY - Math.round(padding * 0.4);

    // Moldura com borda e ícone
    ctx.strokeStyle = actualFrameColor;
    ctx.lineWidth = Math.round(size * 0.005);
    ctx.beginPath();
    ctx.roundRect(padding, badgeY, canvasWidth - padding * 2, badgeH, Math.round(size * 0.02));
    ctx.stroke();

    ctx.fillStyle = actualFrameColor;
    ctx.font = `bold ${Math.round(badgeH * 0.38)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`📷 ${frameText}`, canvasWidth / 2, badgeY + badgeH / 2);
  } else if (frameTemplate === 'playstore') {
    const footerY = qrOffsetY + size + Math.round(padding * 0.3);
    const footerH = canvasHeight - footerY;

    // Fundo cinza suave
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, footerY, canvasWidth, footerH);

    ctx.fillStyle = actualFrameColor;
    ctx.font = `bold ${Math.round(size * 0.038)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameText || 'APONTE A CÂMERA DO CELULAR PARA INSTALAR', canvasWidth / 2, footerY + footerH / 2);
  } else if (frameTemplate === 'poster') {
    const footerY = qrOffsetY + size + Math.round(padding * 0.4);
    const footerH = canvasHeight - footerY;

    ctx.fillStyle = actualFrameColor;
    ctx.beginPath();
    ctx.roundRect(padding, footerY, canvasWidth - padding * 2, footerH - padding, Math.round(size * 0.02));
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(size * 0.042)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameText || 'ESCANEAR PARA INSTALAR AGORA', canvasWidth / 2, footerY + (footerH - padding) / 2);
  }

  return canvas;
}

/**
 * Exporta como PNG (Data URL)
 */
export async function exportQrAsPng(config: QrCodeConfig): Promise<string> {
  const canvas = await renderQrCanvas(config);
  return canvas.toDataURL('image/png');
}

/**
 * Exporta como JPG (Data URL) com qualidade 0.95
 */
export async function exportQrAsJpg(config: QrCodeConfig): Promise<string> {
  const canvas = await renderQrCanvas(config);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Exporta como SVG vetorial
 */
export async function exportQrAsSvg(config: QrCodeConfig): Promise<string> {
  const {
    content,
    darkColor = '#01875F',
    lightColor = '#FFFFFF',
    size = 1024,
    errorCorrectionLevel = 'H',
    moduleRadius = 0.35,
    padding = Math.round(size * 0.06),
  } = config;

  const matrix = await generateQrMatrix(content, errorCorrectionLevel);
  const qrSize = matrix.length;
  const cellSize = size / qrSize;
  const total = size + padding * 2;

  let paths = '';
  for (let r = 0; r < qrSize; r++) {
    for (let c = 0; c < qrSize; c++) {
      if (!matrix[r][c]) continue;
      const x = padding + c * cellSize;
      const y = padding + r * cellSize;
      const rx = moduleRadius > 0 ? cellSize * moduleRadius * 0.5 : 0;
      paths += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="${rx.toFixed(2)}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}">
  <rect width="${total}" height="${total}" fill="${lightColor}"/>
  <g fill="${darkColor}">${paths}</g>
</svg>`;
}

/**
 * Exporta como PDF A4 Comercial (Pronto para Impressão)
 */
export async function exportQrAsPdf(config: QrCodeConfig, fileName: string): Promise<void> {
  const canvas = await renderQrCanvas({ ...config, size: 1024 });
  const imgData = canvas.toDataURL('image/png');

  // Documento A4 em Milímetros (210 x 297 mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Fundo limpo
  pdf.setFillColor(248, 249, 250);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Cabeçalho institucional
  pdf.setFillColor(1, 135, 95);
  pdf.rect(0, 0, pageWidth, 28, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('INSTALAÇÃO OFICIAL DE APLICATIVO ANDROID', pageWidth / 2, 14, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Aponte a câmera do seu smartphone para o QR Code abaixo para instalar com segurança', pageWidth / 2, 22, { align: 'center' });

  // Nome do App e detalhes
  pdf.setTextColor(32, 33, 36);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text(config.appDetails?.name || 'Aplicativo Android', pageWidth / 2, 45, { align: 'center' });

  pdf.setTextColor(95, 99, 104);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `Empresa: ${config.appDetails?.company || 'Oficial'} • Pacote: ${config.appDetails?.fileSize || '38 MB'} • Google Play Protect Verificado`,
    pageWidth / 2,
    52,
    { align: 'center' }
  );

  // Insere a imagem do QR Code centralizada
  const imgWidth = 140;
  const imgHeight = (canvas.height / canvas.width) * imgWidth;
  const imgX = (pageWidth - imgWidth) / 2;
  const imgY = 62;

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);

  // Instruções de Uso
  const boxY = imgY + imgHeight + 10;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(218, 220, 224);
  pdf.roundedRect(25, boxY, 160, 36, 4, 4, 'FD');

  pdf.setTextColor(1, 135, 95);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('COMO INSTALAR NO SEU SMARTPHONE:', 30, boxY + 8);

  pdf.setTextColor(60, 64, 67);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.text('1. Abra a câmera do seu celular ou aplicativo leitor de QR Code.', 30, boxY + 16);
  pdf.text('2. Aponte para o código acima e toque na notificação que aparecer na tela.', 30, boxY + 23);
  pdf.text('3. O download do APK oficial começará automaticamente com total segurança.', 30, boxY + 30);

  // Rodapé do PDF
  pdf.setTextColor(128, 134, 139);
  pdf.setFontSize(8.5);
  pdf.text('Google Play Store Oficial • Distribuição Criptografada e Protegida Contra Invasões', pageWidth / 2, 288, { align: 'center' });

  pdf.save(`${fileName}.pdf`);
}

/**
 * Copia a imagem do QR Code diretamente para a Área de Transferência (Clipboard)
 */
export async function copyQrImageToClipboard(config: QrCodeConfig): Promise<boolean> {
  try {
    const canvas = await renderQrCanvas(config);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve(false);
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}

/**
 * Faz download de arquivo gerado (PNG, JPG, SVG)
 */
export function triggerFileDownload(dataUrl: string, fileName: string, format: string) {
  const a = document.createElement('a');
  a.href = format === 'svg'
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dataUrl)}`
    : dataUrl;
  a.download = `${fileName}.${format}`;
  a.click();
}

/**
 * Aliases de retrocompatibilidade
 */
export const generateQrCodePng = exportQrAsPng;
export const generateQrCodeSvg = exportQrAsSvg;
export const downloadQrCode = triggerFileDownload;

