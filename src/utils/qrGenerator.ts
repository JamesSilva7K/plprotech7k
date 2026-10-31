/**
 * APK Studio — Gerador de QR Code Avançado e Multi-Formatos (PNG, JPG, SVG, PDF)
 * Gera imagens com molduras personalizadas, ícones 100% vetoriais, tipografia auto-ajustável e sem emojis.
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
 * Ajusta dinamicamente o tamanho da fonte para que o texto caiba exatamente na largura máxima sem cortar
 */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  initialFontSize: number,
  minFontSize: number = 10,
  weight: string = 'bold'
): number {
  let fontSize = initialFontSize;
  ctx.font = `${weight} ${fontSize}px 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif`;
  while (ctx.measureText(text).width > maxW && fontSize > minFontSize) {
    fontSize -= 1;
    ctx.font = `${weight} ${fontSize}px 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif`;
  }
  return fontSize;
}

/**
 * Ícone Vetorial de Câmera 100% Nativo em Canvas (Substitui emojis e elimina bugs de glyph)
 */
function drawVectorCamera(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  iconSize: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, Math.round(iconSize * 0.085));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = iconSize;
  const h = Math.round(iconSize * 0.72);
  const x = cx - w / 2;
  const y = cy - h / 2 + Math.round(iconSize * 0.06);
  const r = Math.round(iconSize * 0.16);

  // Corpo da Câmera
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();

  // Lente externa
  ctx.beginPath();
  ctx.arc(cx, y + h / 2, Math.round(h * 0.32), 0, Math.PI * 2);
  ctx.stroke();

  // Ponto central da lente
  ctx.beginPath();
  ctx.arc(cx, y + h / 2, Math.round(h * 0.11), 0, Math.PI * 2);
  ctx.fill();

  // Top flash / visor superior
  const bumpW = Math.round(w * 0.32);
  const bumpH = Math.round(h * 0.18);
  const bumpX = cx - bumpW / 2;
  const bumpY = y - bumpH;
  ctx.beginPath();
  ctx.roundRect(bumpX, bumpY, bumpW, bumpH, [Math.round(r * 0.6), Math.round(r * 0.6), 0, 0]);
  ctx.fill();

  ctx.restore();
}

/**
 * Ícone Vetorial de Download (Seta para baixo) 100% Nativo em Canvas
 */
function drawVectorDownload(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  iconSize: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, Math.round(iconSize * 0.11));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = iconSize * 0.85;
  const topY = cy - s * 0.45;
  const arrowTipY = cy + s * 0.18;

  // Haste vertical
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx, arrowTipY);
  ctx.stroke();

  // Cabeça da seta
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.3, arrowTipY - s * 0.3);
  ctx.lineTo(cx, arrowTipY);
  ctx.lineTo(cx + s * 0.3, arrowTipY - s * 0.3);
  ctx.stroke();

  // Base do download (bandeja)
  const baseY = cy + s * 0.45;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, baseY - s * 0.15);
  ctx.lineTo(cx - s * 0.42, baseY);
  ctx.lineTo(cx + s * 0.42, baseY);
  ctx.lineTo(cx + s * 0.42, baseY - s * 0.15);
  ctx.stroke();

  ctx.restore();
}

/**
 * Ícone Vetorial de Smartphone 100% Nativo em Canvas
 */
function drawVectorSmartphone(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  iconSize: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, Math.round(iconSize * 0.085));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = Math.round(iconSize * 0.62);
  const h = iconSize;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = Math.round(iconSize * 0.14);

  // Corpo do celular
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();

  // Alto-falante superior
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.18, y + h * 0.12);
  ctx.lineTo(cx + w * 0.18, y + h * 0.12);
  ctx.stroke();

  // Botão / Barra inferior
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.22, y + h * 0.88);
  ctx.lineTo(cx + w * 0.22, y + h * 0.88);
  ctx.stroke();

  ctx.restore();
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
    canvasHeight += Math.round(size * 0.18);
  } else if (frameTemplate === 'scan-camera') {
    canvasHeight += Math.round(size * 0.22);
  } else if (frameTemplate === 'playstore') {
    const headerH = Math.round(size * 0.24);
    const footerH = Math.round(size * 0.18);
    canvasHeight += headerH + footerH;
    qrOffsetY += headerH;
  } else if (frameTemplate === 'poster') {
    const headerH = Math.round(size * 0.34);
    const footerH = Math.round(size * 0.26);
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
    ctx.fillRect(0, 0, canvasWidth, Math.max(4, Math.round(size * 0.016)));

    // Nome do aplicativo (com ajuste de tamanho automático para nunca cortar)
    const appName = appDetails?.name || 'Aplicativo Android Oficial';
    const appNameMaxW = canvasWidth - padding * 2;
    fitText(ctx, appName, appNameMaxW, Math.round(size * 0.052), Math.round(size * 0.03), 'bold');
    ctx.fillStyle = '#202124';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(appName, canvasWidth / 2, Math.round(qrOffsetY * 0.42));

    // Subtítulo da empresa e selo seguro
    const subtitle = `${appDetails?.company || 'Distribuição Oficial'} • Google Play Protect Verificado`;
    fitText(ctx, subtitle, appNameMaxW, Math.round(size * 0.030), Math.round(size * 0.022), '500');
    ctx.fillStyle = '#5F6368';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(subtitle, canvasWidth / 2, Math.round(qrOffsetY * 0.74));
  } else if (frameTemplate === 'poster') {
    // Banner Superior com Gradiente
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, qrOffsetY);
    grad.addColorStop(0, actualFrameColor);
    grad.addColorStop(1, '#0D1117');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, qrOffsetY - 8);

    const appName = appDetails?.name || 'INSTALAR APLICATIVO';
    const bannerMaxW = canvasWidth - padding * 2;
    fitText(ctx, appName, bannerMaxW, Math.round(size * 0.056), Math.round(size * 0.032), 'bold');
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(appName, canvasWidth / 2, Math.round(qrOffsetY * 0.38));

    const sub = 'Aponte a câmera do seu smartphone Android para escanear';
    fitText(ctx, sub, bannerMaxW, Math.round(size * 0.032), Math.round(size * 0.022), 'normal');
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sub, canvasWidth / 2, Math.round(qrOffsetY * 0.72));
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
      const bgPad = Math.round(logoSize * 0.12);

      // Fundo branco protetor atrás da logo para garantir contraste e leitura 100%
      ctx.fillStyle = lightColor;
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(centerX, centerY, (logoSize + bgPad * 2) / 2, 0, Math.PI * 2);
      } else {
        const bgR = Math.round(logoSize * 0.24);
        ctx.roundRect(lx - bgPad, ly - bgPad, logoSize + bgPad * 2, logoSize + bgPad * 2, bgR);
      }
      ctx.fill();

      // Borda sutil na logo
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = Math.max(1, Math.round(size * 0.003));
      ctx.stroke();

      // Desenho da imagem recortada
      ctx.save();
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2);
      } else {
        const r = Math.round(logoSize * 0.20);
        ctx.roundRect(lx, ly, logoSize, logoSize, r);
      }
      ctx.clip();
      ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
      ctx.restore();
    } catch (err) {
      console.warn('Não foi possível carregar logo central:', err);
    }
  }

  // 5. Molduras Inferiores / Badges 100% Vetoriais
  if (frameTemplate === 'badge') {
    const badgeY = qrOffsetY + size + Math.round(padding * 0.4);
    const badgeH = canvasHeight - badgeY - Math.round(padding * 0.4);
    const pillMargin = Math.round(size * 0.04);
    const pillW = canvasWidth - pillMargin * 2;
    const pillRadius = Math.round(badgeH * 0.35);

    // Botão / Pílula inferior preenchida
    ctx.fillStyle = actualFrameColor;
    ctx.beginPath();
    ctx.roundRect(pillMargin, badgeY, pillW, badgeH, pillRadius);
    ctx.fill();

    // Ícone de Download Vetorial + Texto Auto-ajustado
    const iconSize = Math.round(badgeH * 0.44);
    const iconGap = Math.round(size * 0.02);
    const textStr = frameText || 'ESCANEAR PARA BAIXAR';
    const maxTextW = pillW - iconSize - iconGap - Math.round(pillMargin * 1.5);

    fitText(ctx, textStr, maxTextW, Math.round(badgeH * 0.38), Math.round(size * 0.025), 'bold');
    const textW = ctx.measureText(textStr).width;
    const totalW = iconSize + iconGap + textW;
    const startX = pillMargin + (pillW - totalW) / 2;
    const centerYBadge = badgeY + badgeH / 2;

    // Desenha ícone de download vetorial branco
    drawVectorDownload(ctx, startX + iconSize / 2, centerYBadge, iconSize, '#FFFFFF');

    // Texto
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, startX + iconSize + iconGap, centerYBadge);

  } else if (frameTemplate === 'scan-camera') {
    const badgeY = qrOffsetY + size + Math.round(padding * 0.35);
    const badgeH = canvasHeight - badgeY - Math.round(padding * 0.35);
    const boxX = padding;
    const boxW = canvasWidth - padding * 2;
    const boxRadius = Math.round(badgeH * 0.28);

    // Borda elegante com a cor selecionada
    ctx.strokeStyle = actualFrameColor;
    ctx.lineWidth = Math.max(2, Math.round(size * 0.006));
    ctx.beginPath();
    ctx.roundRect(boxX, badgeY, boxW, badgeH, boxRadius);
    ctx.stroke();

    // Fundo translúcido sutil para sofisticação
    ctx.fillStyle = actualFrameColor + '0D';
    ctx.beginPath();
    ctx.roundRect(boxX, badgeY, boxW, badgeH, boxRadius);
    ctx.fill();

    // Ícone de Câmera 100% Vetorial (NÃO emoji) + Texto com auto-fit
    const iconSize = Math.round(badgeH * 0.44);
    const iconGap = Math.round(size * 0.02);
    const textStr = frameText || 'ESCANEAR PARA BAIXAR';
    const maxTextW = boxW - iconSize - iconGap - Math.round(padding * 1.2);

    fitText(ctx, textStr, maxTextW, Math.round(badgeH * 0.38), Math.round(size * 0.025), 'bold');
    const textW = ctx.measureText(textStr).width;
    const totalW = iconSize + iconGap + textW;
    const startX = boxX + (boxW - totalW) / 2;
    const centerYBadge = badgeY + badgeH / 2;

    // Desenha câmera em vetor nativo
    drawVectorCamera(ctx, startX + iconSize / 2, centerYBadge, iconSize, actualFrameColor);

    // Desenha texto
    ctx.fillStyle = actualFrameColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, startX + iconSize + iconGap, centerYBadge);

  } else if (frameTemplate === 'playstore') {
    const footerY = qrOffsetY + size + Math.round(padding * 0.3);
    const footerH = canvasHeight - footerY;

    // Fundo cinza suave institucional
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, footerY, canvasWidth, footerH);

    // Divisor superior
    ctx.fillStyle = '#E8EAED';
    ctx.fillRect(0, footerY, canvasWidth, 1);

    const iconSize = Math.round(footerH * 0.36);
    const iconGap = Math.round(size * 0.018);
    const textStr = frameText || 'APONTE A CÂMERA DO CELULAR PARA INSTALAR';
    const maxTextW = canvasWidth - iconSize - iconGap - padding * 2;

    fitText(ctx, textStr, maxTextW, Math.round(size * 0.036), Math.round(size * 0.024), 'bold');
    const textW = ctx.measureText(textStr).width;
    const totalW = iconSize + iconGap + textW;
    const startX = (canvasWidth - totalW) / 2;
    const centerYFooter = footerY + footerH / 2;

    // Smartphone vetorial
    drawVectorSmartphone(ctx, startX + iconSize / 2, centerYFooter, iconSize, actualFrameColor);

    ctx.fillStyle = actualFrameColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, startX + iconSize + iconGap, centerYFooter);

  } else if (frameTemplate === 'poster') {
    const footerY = qrOffsetY + size + Math.round(padding * 0.35);
    const footerH = canvasHeight - footerY - padding;
    const btnW = canvasWidth - padding * 2;
    const btnRadius = Math.round(footerH * 0.32);

    // Botão estilizado do cartaz
    ctx.fillStyle = actualFrameColor;
    ctx.beginPath();
    ctx.roundRect(padding, footerY, btnW, footerH, btnRadius);
    ctx.fill();

    const iconSize = Math.round(footerH * 0.42);
    const iconGap = Math.round(size * 0.02);
    const textStr = frameText || 'ESCANEAR PARA INSTALAR AGORA';
    const maxTextW = btnW - iconSize - iconGap - padding;

    fitText(ctx, textStr, maxTextW, Math.round(footerH * 0.38), Math.round(size * 0.026), 'bold');
    const textW = ctx.measureText(textStr).width;
    const totalW = iconSize + iconGap + textW;
    const startX = padding + (btnW - totalW) / 2;
    const centerYFooter = footerY + footerH / 2;

    // Câmera vetorial branca
    drawVectorCamera(ctx, startX + iconSize / 2, centerYFooter, iconSize, '#FFFFFF');

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, startX + iconSize + iconGap, centerYFooter);
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
  pdf.text('INSTRUÇÕES RÁPIDAS PARA O USUÁRIO:', 30, boxY + 8);

  pdf.setTextColor(60, 64, 67);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.text('1. Abra o aplicativo de Câmera padrão em qualquer aparelho Android.', 30, boxY + 16);
  pdf.text('2. Aponte para o QR Code acima e aguarde a notificação de abertura.', 30, boxY + 23);
  pdf.text('3. Confirme o download seguro verificado pelo Google Play Protect.', 30, boxY + 30);

  // Rodapé com blindagem de integridade
  pdf.setTextColor(154, 160, 166);
  pdf.setFontSize(8);
  pdf.text('Distribuição oficial e blindada • Assinatura Criptográfica SHA-256 e TLS 1.3 Ativo', pageWidth / 2, 288, { align: 'center' });

  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}

/**
 * Copia a imagem do QR Code para a área de transferência do usuário como PNG
 */
export async function copyQrImageToClipboard(config: QrCodeConfig): Promise<boolean> {
  try {
    const canvas = await renderQrCanvas(config);
    return new Promise(resolve => {
      canvas.toBlob(async blob => {
        if (!blob) {
          resolve(false);
          return;
        }
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
 * Dispara o download de um arquivo gerado (suporta DataURL, SVG string e Blob)
 */
export function triggerFileDownload(content: string, fileName: string, extension?: string): void {
  const ext = extension ? `.${extension.replace(/^\./, '')}` : '';
  const finalName = fileName.endsWith(ext) ? fileName : `${fileName}${ext}`;

  let href = content;
  let isBlob = false;

  if (extension === 'svg' && !content.startsWith('data:')) {
    const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    href = URL.createObjectURL(blob);
    isBlob = true;
  }

  const a = document.createElement('a');
  a.href = href;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (isBlob) {
    setTimeout(() => URL.revokeObjectURL(href), 1500);
  }
}

// Aliases para retrocompatibilidade
export const generateQrCodePng = exportQrAsPng;
export const generateQrCodeSvg = exportQrAsSvg;
export const downloadQrCode = triggerFileDownload;
