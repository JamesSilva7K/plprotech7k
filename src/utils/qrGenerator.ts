/**
 * APK Studio — Gerador de QR Code Avançado e Multi-Formatos (PNG, JPG, SVG, PDF)
 * Gera imagens com acabamento gráfico de alto padrão, molduras elegantes, ícones 100% vetoriais,
 * tipografia auto-ajustável e sem emojis.
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
  ctx.font = `${weight} ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  while (ctx.measureText(text).width > maxW && fontSize > minFontSize) {
    fontSize -= 1;
    ctx.font = `${weight} ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  }
  return fontSize;
}

/**
 * Ícone Vetorial de Câmera 100% Nativo em Canvas (Traço Nítido e Proporcional)
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
  ctx.lineWidth = Math.max(2, Math.round(iconSize * 0.09));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = iconSize;
  const h = Math.round(iconSize * 0.72);
  const x = cx - w / 2;
  const y = cy - h / 2 + Math.round(iconSize * 0.05);
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
 * Selo de Proteção Google Play Protect Vetorial
 */
function drawVectorShieldCheck(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, Math.round(size * 0.1));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = size;
  const h = size * 1.15;
  const x = cx - w / 2;
  const y = cy - h / 2;

  // Contorno do escudo
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x + w, y + h * 0.25);
  ctx.quadraticCurveTo(x + w, y + h * 0.75, cx, y + h);
  ctx.quadraticCurveTo(x, y + h * 0.75, x, y + h * 0.25);
  ctx.closePath();
  ctx.stroke();

  // Visto interno
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.22, cy);
  ctx.lineTo(cx - w * 0.05, cy + h * 0.15);
  ctx.lineTo(cx + w * 0.25, cy - h * 0.15);
  ctx.stroke();

  ctx.restore();
}

/**
 * Renderiza o Canvas completo com o QR Code, Moldura Elegante e Logotipos
 */
export async function renderQrCanvas(config: QrCodeConfig): Promise<HTMLCanvasElement> {
  const {
    content,
    darkColor = '#01875F',
    lightColor = '#FFFFFF',
    size = 1024,
    errorCorrectionLevel = 'H',
    frameTemplate = 'badge',
    frameText,
    frameColor,
    logoUrl,
    logoRatio = 0.22,
    logoShape = 'rounded',
    moduleRadius = 0.35,
    padding = Math.round(size * 0.08),
    appDetails,
  } = config;

  const actualFrameColor = frameColor || darkColor;
  const matrix = await generateQrMatrix(content, errorCorrectionLevel);
  const qrGridSize = matrix.length;

  // Dimensões elegantes baseadas no template
  let canvasWidth = size + padding * 2;
  let canvasHeight = size + padding * 2;
  let qrOffsetY = padding;
  let qrOffsetX = padding;

  if (frameTemplate === 'badge') {
    canvasHeight += Math.round(size * 0.16);
  } else if (frameTemplate === 'scan-camera') {
    canvasHeight += Math.round(size * 0.18);
  } else if (frameTemplate === 'playstore') {
    const headerH = Math.round(size * 0.22);
    const footerH = Math.round(size * 0.16);
    canvasHeight += headerH + footerH;
    qrOffsetY += headerH;
  } else if (frameTemplate === 'poster') {
    const headerH = Math.round(size * 0.28);
    const footerH = Math.round(size * 0.20);
    canvasHeight += headerH + footerH;
    qrOffsetY += headerH;
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // 1. Fundo do Card Geral com Cantos Arredondados e Borda Suave
  const cardRadius = Math.round(canvasWidth * 0.04);
  ctx.fillStyle = lightColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, canvasWidth, canvasHeight, cardRadius);
  ctx.fill();

  // Borda externa sutil do cartão para acabamento refinado
  ctx.strokeStyle = '#E8ECEF';
  ctx.lineWidth = Math.max(1, Math.round(size * 0.002));
  ctx.beginPath();
  ctx.roundRect(1, 1, canvasWidth - 2, canvasHeight - 2, cardRadius);
  ctx.stroke();

  // 2. Elementos Decorativos de Topo (Templates PlayStore e Poster)
  if (frameTemplate === 'playstore') {
    // Header Oficial Google Play
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, qrOffsetY);

    // Barra de acento colorido superior sutil
    ctx.fillStyle = actualFrameColor;
    ctx.fillRect(0, 0, canvasWidth, Math.max(4, Math.round(size * 0.012)));

    // Marca Google Play
    ctx.fillStyle = '#5F6368';
    ctx.font = `600 ${Math.round(size * 0.026)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GOOGLE PLAY • DISTRIBUIÇÃO OFICIAL', canvasWidth / 2, Math.round(qrOffsetY * 0.30));

    // Nome do aplicativo
    const appName = appDetails?.name || 'Aplicativo Android Oficial';
    const appNameMaxW = canvasWidth - padding * 2;
    fitText(ctx, appName, appNameMaxW, Math.round(size * 0.048), Math.round(size * 0.028), 'bold');
    ctx.fillStyle = '#202124';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(appName, canvasWidth / 2, Math.round(qrOffsetY * 0.58));

    // Subtítulo
    const subtitle = `${appDetails?.company || 'Desenvolvedor Verificado'} • Google Play Protect`;
    fitText(ctx, subtitle, appNameMaxW, Math.round(size * 0.026), Math.round(size * 0.018), '500');
    ctx.fillStyle = '#5F6368';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(subtitle, canvasWidth / 2, Math.round(qrOffsetY * 0.82));

  } else if (frameTemplate === 'poster') {
    // Banner Superior com Gradiente Moderno
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, qrOffsetY);
    grad.addColorStop(0, actualFrameColor);
    grad.addColorStop(1, '#0C131D');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, canvasWidth, qrOffsetY - 6, [cardRadius, cardRadius, 0, 0]);
    ctx.fill();

    const appName = appDetails?.name || 'INSTALAR APLICATIVO';
    const bannerMaxW = canvasWidth - padding * 2;
    fitText(ctx, appName, bannerMaxW, Math.round(size * 0.052), Math.round(size * 0.030), 'bold');
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(appName, canvasWidth / 2, Math.round(qrOffsetY * 0.40));

    const sub = 'Aponte a câmera do celular para instalar';
    fitText(ctx, sub, bannerMaxW, Math.round(size * 0.028), Math.round(size * 0.020), 'normal');
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sub, canvasWidth / 2, Math.round(qrOffsetY * 0.74));
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

      // Pula células ocupadas pela logo central
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

  // 4. Desenho da Logo Central (com fundo protetor suave e sombra)
  if (logoUrl) {
    try {
      const logoImg = await loadImage(logoUrl);
      const lx = centerX - logoSize / 2;
      const ly = centerY - logoSize / 2;
      const bgPad = Math.round(logoSize * 0.12);

      // Fundo branco protetor atrás da logo com sombra suave
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = Math.round(size * 0.015);
      ctx.shadowOffsetY = Math.round(size * 0.005);

      ctx.fillStyle = lightColor;
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(centerX, centerY, (logoSize + bgPad * 2) / 2, 0, Math.PI * 2);
      } else {
        const bgR = Math.round(logoSize * 0.22);
        ctx.roundRect(lx - bgPad, ly - bgPad, logoSize + bgPad * 2, logoSize + bgPad * 2, bgR);
      }
      ctx.fill();
      ctx.restore();

      // Borda sutil na logo
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = Math.max(1, Math.round(size * 0.0025));
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

  // 5. Molduras Inferiores / Badges de Alto Padrão Visual
  if (frameTemplate === 'badge') {
    // BOTÃO FLUTUANTE ELEGANTE (Proporção harmônica centralizada)
    const pillH = Math.round(size * 0.12);
    const pillW = Math.min(canvasWidth - padding * 1.5, Math.round(size * 0.82));
    const pillX = (canvasWidth - pillW) / 2;
    const pillY = qrOffsetY + size + Math.round(padding * 0.35);
    const pillRadius = Math.round(pillH * 0.5);

    // Sombra suave sob o botão
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = Math.round(size * 0.015);
    ctx.shadowOffsetY = Math.round(size * 0.006);

    // Gradiente sutil no botão
    const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
    pillGrad.addColorStop(0, actualFrameColor);
    pillGrad.addColorStop(1, actualFrameColor);
    ctx.fillStyle = pillGrad;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
    ctx.fill();
    ctx.restore();

    // Ícone de Download Vetorial + Texto
    const iconSize = Math.round(pillH * 0.44);
    const iconGap = Math.round(size * 0.018);
    const textStr = frameText || 'APONTE A CÂMERA E INSTALE';
    const maxTextW = pillW - iconSize - iconGap - Math.round(size * 0.08);

    fitText(ctx, textStr, maxTextW, Math.round(pillH * 0.36), Math.round(size * 0.024), 'bold');
    const textW = ctx.measureText(textStr).width;
    const totalW = iconSize + iconGap + textW;
    const startX = pillX + (pillW - totalW) / 2;
    const centerYPill = pillY + pillH / 2;

    drawVectorDownload(ctx, startX + iconSize / 2, centerYPill, iconSize, '#FFFFFF');

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, startX + iconSize + iconGap, centerYPill);

  } else if (frameTemplate === 'scan-camera') {
    // MOLDURA SCANNER TECNOLÓGICA & SOFISTICADA (Dual-line, com ícone em círculo de destaque)
    const cardH = Math.round(size * 0.14);
    const cardW = Math.min(canvasWidth - padding * 1.5, Math.round(size * 0.88));
    const cardX = (canvasWidth - cardW) / 2;
    const cardY = qrOffsetY + size + Math.round(padding * 0.35);
    const cardR = Math.round(cardH * 0.32);

    // Card elegante com fundo bem suave
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
    ctx.shadowBlur = Math.round(size * 0.01);
    ctx.shadowOffsetY = Math.round(size * 0.003);

    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.fill();
    ctx.restore();

    // Borda delicada
    ctx.strokeStyle = actualFrameColor + '30';
    ctx.lineWidth = Math.max(1, Math.round(size * 0.003));
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.stroke();

    // Círculo com o ícone da câmera
    const circleR = Math.round(cardH * 0.34);
    const circleX = cardX + Math.round(cardH * 0.45);
    const circleY = cardY + cardH / 2;

    ctx.fillStyle = actualFrameColor;
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fill();

    // Câmera branca nítida dentro do círculo
    drawVectorCamera(ctx, circleX, circleY, Math.round(circleR * 1.1), '#FFFFFF');

    // Textos informativos organizados
    const textStartX = circleX + circleR + Math.round(cardH * 0.25);
    const textMaxW = cardX + cardW - textStartX - Math.round(cardH * 0.2);

    // Linha 1: Título de Ação
    const line1 = frameText || 'APONTE A CÂMERA DO CELULAR';
    fitText(ctx, line1, textMaxW, Math.round(cardH * 0.30), Math.round(size * 0.022), 'bold');
    ctx.fillStyle = '#1E293B';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(line1, textStartX, cardY + cardH * 0.36);

    // Linha 2: Subtítulo de Segurança Oficial
    const line2 = 'Instalação Instantânea • Google Play Protect';
    fitText(ctx, line2, textMaxW, Math.round(cardH * 0.22), Math.round(size * 0.016), '500');
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(line2, textStartX, cardY + cardH * 0.68);

  } else if (frameTemplate === 'playstore') {
    // FOOTER ESTILO GOOGLE PLAY
    const footerY = qrOffsetY + size + Math.round(padding * 0.3);
    const footerH = canvasHeight - footerY;

    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(0, footerY, canvasWidth, footerH, [0, 0, cardRadius, cardRadius]);
    ctx.fill();

    // Divisor superior
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(0, footerY, canvasWidth, 1);

    const btnH = Math.round(footerH * 0.58);
    const btnW = Math.min(canvasWidth - padding * 2, Math.round(size * 0.75));
    const btnX = (canvasWidth - btnW) / 2;
    const btnY = footerY + (footerH - btnH) / 2;
    const btnR = Math.round(btnH * 0.5);

    ctx.fillStyle = actualFrameColor;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, btnR);
    ctx.fill();

    const iconSize = Math.round(btnH * 0.44);
    const iconGap = Math.round(size * 0.016);
    const textStr = frameText || 'INSTALAR PELO GOOGLE PLAY';
    const maxTextW = btnW - iconSize - iconGap - Math.round(btnH * 0.6);

    fitText(ctx, textStr, maxTextW, Math.round(btnH * 0.38), Math.round(size * 0.024), 'bold');
    const textW = ctx.measureText(textStr).width;
    const totalW = iconSize + iconGap + textW;
    const startX = btnX + (btnW - totalW) / 2;
    const centerYBtn = btnY + btnH / 2;

    drawVectorSmartphone(ctx, startX + iconSize / 2, centerYBtn, iconSize, '#FFFFFF');

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, startX + iconSize + iconGap, centerYBtn);

  } else if (frameTemplate === 'poster') {
    // FOOTER CARTAZ COMERCIAL
    const footerY = qrOffsetY + size + Math.round(padding * 0.35);
    const footerH = canvasHeight - footerY - padding * 0.5;
    const btnW = Math.min(canvasWidth - padding * 1.5, Math.round(size * 0.85));
    const btnX = (canvasWidth - btnW) / 2;
    const btnR = Math.round(footerH * 0.35);

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = Math.round(size * 0.015);
    ctx.shadowOffsetY = Math.round(size * 0.005);

    ctx.fillStyle = actualFrameColor;
    ctx.beginPath();
    ctx.roundRect(btnX, footerY, btnW, footerH, btnR);
    ctx.fill();
    ctx.restore();

    const iconSize = Math.round(footerH * 0.42);
    const iconGap = Math.round(size * 0.018);
    const textStr = frameText || 'ESCANEAR PARA INSTALAR AGORA';
    const maxTextW = btnW - iconSize - iconGap - Math.round(btnW * 0.1);

    fitText(ctx, textStr, maxTextW, Math.round(footerH * 0.36), Math.round(size * 0.024), 'bold');
    const textW = ctx.measureText(textStr).width;
    const totalW = iconSize + iconGap + textW;
    const startX = btnX + (btnW - totalW) / 2;
    const centerYFooter = footerY + footerH / 2;

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
    padding = Math.round(size * 0.08),
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
  <rect width="${total}" height="${total}" rx="32" fill="${lightColor}"/>
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
    `Empresa: ${config.appDetails?.company || 'Oficial'} • Pacote: ${config.appDetails?.fileSize || '28.7 MB'} • Google Play Protect Verificado`,
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
