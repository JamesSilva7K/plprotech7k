/**
 * APK Studio — Gerador de QR Code Avançado
 * Gera QR Codes customizáveis com logo central, cores, moldura e estilos.
 * Usa a library `qrcode` (pure JS, sem serviço externo).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Interface de configuração do QR Code
// ─────────────────────────────────────────────────────────────────────────────
export interface QrCodeConfig {
  /** Texto/URL a ser codificado */
  content: string;
  /** Cor dos módulos do QR (foreground). Default: #000000 */
  darkColor: string;
  /** Cor de fundo do QR. Default: #FFFFFF */
  lightColor: string;
  /** Tamanho em pixels do QR Code. Default: 512 */
  size: number;
  /** Nível de correção de erro. Default: 'H' (alta, necessário para logo) */
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  /** URL de uma logo/imagem para centralizar no QR */
  logoUrl?: string;
  /** Tamanho da logo como fração do QR (0.15 a 0.30). Default: 0.22 */
  logoRatio?: number;
  /** Raio das bordas dos módulos (0 = quadrado, 1 = circular). Default: 0 */
  moduleRadius?: number;
  /** Adicionar moldura com texto abaixo. Default: false */
  showFrame?: boolean;
  /** Texto da moldura. Default: 'Baixar App' */
  frameText?: string;
  /** Cor da moldura. Default: igual a darkColor */
  frameColor?: string;
  /** Padding externo. Default: 16 */
  padding?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos internos do QR Code
// ─────────────────────────────────────────────────────────────────────────────
type QrMatrix = boolean[][];

/**
 * Gera a matriz binária do QR Code usando a lib qrcode
 * Retorna um array 2D de boolean (true = módulo escuro)
 */
async function generateQrMatrix(content: string, ecl: string): Promise<QrMatrix> {
  // Dynamic import da lib qrcode
  const QRCode = await import('qrcode');
  // Gera como canvas e captura os dados — mas preferimos usar o método interno
  // Usamos create() para obter a matriz direta
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
 * Desenha um módulo com bordas arredondadas no canvas
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
 * Carrega uma imagem a partir de uma URL (base64 ou http)
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
 * Gera o QR Code como Data URL PNG
 */
export async function generateQrCodePng(config: QrCodeConfig): Promise<string> {
  const {
    content,
    darkColor = '#000000',
    lightColor = '#FFFFFF',
    size = 512,
    errorCorrectionLevel = 'H',
    logoUrl,
    logoRatio = 0.22,
    moduleRadius = 0,
    showFrame = false,
    frameText = 'Baixar App',
    frameColor,
    padding = 16,
  } = config;

  const matrix = await generateQrMatrix(content, errorCorrectionLevel);
  const qrSize = matrix.length;

  // Canvas total: QR + padding + moldura opcional
  const frameHeight = showFrame ? 44 : 0;
  const totalSize = size + padding * 2;
  const canvasHeight = totalSize + frameHeight;

  const canvas = document.createElement('canvas');
  canvas.width = totalSize;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // Fundo
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, totalSize, canvasHeight);

  // Cada módulo
  const cellSize = size / qrSize;

  // Área que vai ser coberta pela logo (para não desenhar módulos lá)
  const logoSize = logoUrl ? size * logoRatio : 0;
  const logoPad = logoSize / 2;
  const centerX = padding + size / 2;
  const centerY = padding + size / 2;

  ctx.fillStyle = darkColor;

  for (let r = 0; r < qrSize; r++) {
    for (let c = 0; c < qrSize; c++) {
      if (!matrix[r][c]) continue;

      const x = padding + c * cellSize;
      const y = padding + r * cellSize;

      // Pula módulos na área da logo
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

  // Desenha logo centralizada
  if (logoUrl) {
    try {
      const logoImg = await loadImage(logoUrl);
      const lx = centerX - logoSize / 2;
      const ly = centerY - logoSize / 2;

      // Fundo branco atrás da logo
      const bgPad = logoSize * 0.08;
      ctx.fillStyle = lightColor;
      const bgR = logoSize * 0.12;
      ctx.beginPath();
      ctx.roundRect(lx - bgPad, ly - bgPad, logoSize + bgPad * 2, logoSize + bgPad * 2, bgR);
      ctx.fill();

      // Desenha logo
      ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
    } catch {
      // logo falhou — ignora silenciosamente
    }
  }

  // Moldura com texto
  if (showFrame) {
    const fc = frameColor || darkColor;
    const frameY = totalSize;

    // Borda da moldura
    ctx.strokeStyle = fc;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, totalSize - 2, canvasHeight - 2);

    // Texto
    ctx.fillStyle = fc;
    ctx.font = `bold ${Math.round(frameHeight * 0.45)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameText, totalSize / 2, frameY + frameHeight / 2);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Gera o QR Code como SVG string
 */
export async function generateQrCodeSvg(config: QrCodeConfig): Promise<string> {
  const {
    content,
    darkColor = '#000000',
    lightColor = '#FFFFFF',
    size = 512,
    errorCorrectionLevel = 'H',
    moduleRadius = 0,
    padding = 16,
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
 * Faz download do QR Code como arquivo
 */
export function downloadQrCode(dataUrl: string, fileName: string, format: 'png' | 'svg' = 'png') {
  const a = document.createElement('a');
  a.href = format === 'svg'
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dataUrl)}`
    : dataUrl;
  a.download = `${fileName}.${format}`;
  a.click();
}

