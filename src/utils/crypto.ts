/**
 * APK Studio — Sistema de Criptografia e Links Inteligentes Blindados
 * Gera tokens HMAC-SHA256, URLs amigáveis com nome do APK e proteção anti-adulteração.
 */

const APP_SECRET = import.meta.env.VITE_APP_SECRET || 'apk-studio-secure-key-2026';

/**
 * Converte ArrayBuffer em string hexadecimal
 */
function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Cria uma chave HMAC-SHA256 usando Web Crypto API nativa do browser
 */
async function makeHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Sanitiza o nome do APK para slug elegante e profissional na URL
 * Ex: "Braspress Transportadora" -> "braspress-transportadora"
 */
export function sanitizeAppNameForUrl(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'app';
}

/**
 * Gera assinatura HMAC blindada vinculando o nome do APK, canal e timestamp
 */
export async function generateBlindSignature(appName: string, channel: 'link' | 'qrcode', apkId: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await makeHmacKey(APP_SECRET);
  const canonicalPayload = `${sanitizeAppNameForUrl(appName)}:${channel}:${apkId}:verified-android-package`;
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(canonicalPayload));
  return bufToHex(sig).slice(0, 20); // 20 hex chars de blindagem
}

/**
 * Gera um token HMAC-SHA256 único para um APK
 */
export async function generateDownloadToken(apkId: string, fileName: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await makeHmacKey(APP_SECRET);
  const timestamp = Date.now().toString(36);
  const nonce = crypto.getRandomValues(new Uint8Array(6));
  const nonceHex = bufToHex(nonce.buffer);
  const payload = `${apkId}:${fileName}:${timestamp}:${nonceHex}`;
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const sigHex = bufToHex(sig);
  return `${btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')}.${sigHex.slice(0, 16)}`;
}

/**
 * Gera um slug alfanumérico único para a sessão
 */
export function generateQrSlug(apkId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => chars[b % chars.length]).join('');
}

/**
 * Monta URL de instalação inteligente e blindada com nome explícito do APK
 * Ex: https://seu-app.vercel.app/?app=braspress-transportadora&channel=qrcode&sig=a4f938c9...
 */
export function buildIntelligentUrl(
  baseUrl: string,
  appName: string,
  channel: 'link' | 'qrcode',
  signature: string,
  slug: string
): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const appSlug = sanitizeAppNameForUrl(appName);
  return `${cleanBase}/?app=${encodeURIComponent(appSlug)}&channel=${channel}&sig=${signature}&id=${slug}`;
}

/**
 * Calcula SHA-256 real de um arquivo usando Web Crypto API
 */
export async function calculateFileSha256(file: File | Blob): Promise<string> {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return bufToHex(hashBuf);
}

/**
 * Valida se uma assinatura HMAC do link corresponde ao nome do APK e canal
 */
export async function verifyBlindSignature(
  appName: string,
  channel: 'link' | 'qrcode',
  apkId: string,
  signature: string
): Promise<boolean> {
  const expectedSig = await generateBlindSignature(appName, channel, apkId);
  return expectedSig.toLowerCase() === signature.toLowerCase();
}
