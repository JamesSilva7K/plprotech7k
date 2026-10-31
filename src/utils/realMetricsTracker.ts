/**
 * Rastreador de Métricas Reais, Leads e Conversão por APK
 * 100% Real, Sincronizado via LocalStorage e Eventos em Tempo Real.
 * Zero métricas inventadas: contadores começam em 0 e incrementam exclusivamente com ações reais de leads.
 */

export interface ApkLiveMetrics {
  views: number;
  downloads: number;
  conversionRate: number;
  lastLeadAt: string | null;
  createdAt: string;
}

const STORAGE_PREFIX = 'apk_studio_real_metrics_';

export function getApkRealMetrics(apkId: string, fallbackCreatedAt?: string): ApkLiveMetrics {
  const defaultCreatedAt = fallbackCreatedAt || formatCurrentDateTime();

  if (typeof window === 'undefined') {
    return {
      views: 0,
      downloads: 0,
      conversionRate: 0,
      lastLeadAt: null,
      createdAt: defaultCreatedAt,
    };
  }

  const key = `${STORAGE_PREFIX}${apkId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const views = Number(parsed.views) || 0;
      const downloads = Number(parsed.downloads) || 0;
      const conversionRate = views > 0 ? Number(((downloads / views) * 100).toFixed(1)) : 0;
      return {
        views,
        downloads,
        conversionRate,
        lastLeadAt: parsed.lastLeadAt || null,
        createdAt: parsed.createdAt || defaultCreatedAt,
      };
    }
  } catch (err) {
    console.warn('Erro ao ler métricas do APK:', err);
  }

  // Inicializa com dados 100% reais em zero para novo APK
  const initialData: ApkLiveMetrics = {
    views: 0,
    downloads: 0,
    conversionRate: 0,
    lastLeadAt: null,
    createdAt: defaultCreatedAt,
  };

  try {
    localStorage.setItem(key, JSON.stringify(initialData));
  } catch {
    // Ignore localStorage quota errors
  }

  return initialData;
}

export function recordLeadVisit(apkId: string): ApkLiveMetrics {
  const current = getApkRealMetrics(apkId);
  const nowStr = formatCurrentDateTime();

  const newViews = current.views + 1;
  const rate = newViews > 0 ? Number(((current.downloads / newViews) * 100).toFixed(1)) : 0;

  const updated: ApkLiveMetrics = {
    ...current,
    views: newViews,
    lastLeadAt: nowStr,
    conversionRate: rate,
  };

  saveMetrics(apkId, updated);
  return updated;
}

export function recordLeadDownload(apkId: string): ApkLiveMetrics {
  const current = getApkRealMetrics(apkId);
  const nowStr = formatCurrentDateTime();

  const newDownloads = current.downloads + 1;
  const newViews = Math.max(current.views, newDownloads);
  const rate = Number(((newDownloads / newViews) * 100).toFixed(1));

  const updated: ApkLiveMetrics = {
    ...current,
    views: newViews,
    downloads: newDownloads,
    conversionRate: rate,
    lastLeadAt: nowStr,
  };

  saveMetrics(apkId, updated);
  return updated;
}

export function resetApkRealMetrics(apkId: string, createdAt?: string): ApkLiveMetrics {
  const resetData: ApkLiveMetrics = {
    views: 0,
    downloads: 0,
    conversionRate: 0,
    lastLeadAt: null,
    createdAt: createdAt || formatCurrentDateTime(),
  };
  saveMetrics(apkId, resetData);
  return resetData;
}

function saveMetrics(apkId: string, data: ApkLiveMetrics): void {
  if (typeof window === 'undefined') return;
  const key = `${STORAGE_PREFIX}${apkId}`;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('apk_studio_metrics_changed', { detail: { apkId, metrics: data } }));
  } catch (err) {
    console.warn('Erro ao salvar métricas:', err);
  }
}

export function formatCurrentDateTime(): string {
  const now = new Date();
  return `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}
