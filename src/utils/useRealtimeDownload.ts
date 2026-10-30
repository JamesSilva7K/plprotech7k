import { useState, useRef, useEffect, useCallback } from 'react';
import { ApkItem } from '../types/apk';

export type DownloadStage = 'idle' | 'downloading' | 'verifying' | 'installed';

interface UseRealtimeDownloadOptions {
  apk: ApkItem;
  onDownloadApk?: (apk: ApkItem) => void;
  onToast?: (msg: string) => void;
}

export function useRealtimeDownload({
  apk,
  onDownloadApk,
  onToast,
}: UseRealtimeDownloadOptions) {
  const [stage, setStage] = useState<DownloadStage>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [downloadedMb, setDownloadedMb] = useState<number>(0);
  const [speedMbPerSec, setSpeedMbPerSec] = useState<number>(0);
  const [etaSeconds, setEtaSeconds] = useState<number>(0);

  const timerRef = useRef<number | null>(null);
  const verifyTimerRef = useRef<number | null>(null);

  // Parse total size in MB (defaults to 38.4 MB if not parsed)
  const parseTotalMb = useCallback((sizeStr?: string): number => {
    if (!sizeStr) return 38.4;
    const match = sizeStr.match(/([0-9]+([.,][0-9]+)?)/);
    if (!match) return 38.4;
    const parsed = parseFloat(match[1].replace(',', '.'));
    return isNaN(parsed) || parsed <= 0 ? 38.4 : parsed;
  }, []);

  const totalMb = parseTotalMb(apk.fileSize);

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (verifyTimerRef.current !== null) {
      window.clearTimeout(verifyTimerRef.current);
      verifyTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Cancel download and reset
  const cancelDownload = useCallback(() => {
    cleanup();
    setStage('idle');
    setProgressPercent(0);
    setDownloadedMb(0);
    setSpeedMbPerSec(0);
    setEtaSeconds(0);
    if (onToast) onToast('Download cancelado');
  }, [cleanup, onToast]);

  // Uninstall app and reset
  const uninstallApp = useCallback(() => {
    cleanup();
    setStage('idle');
    setProgressPercent(0);
    setDownloadedMb(0);
    setSpeedMbPerSec(0);
    setEtaSeconds(0);
    if (onToast) onToast('Aplicativo desinstalado');
  }, [cleanup, onToast]);

  // Start real-time download
  const startDownload = useCallback(() => {
    if (stage === 'downloading' || stage === 'verifying') return;

    cleanup();
    setStage('downloading');
    setProgressPercent(2);
    setDownloadedMb(0.8);

    const initialSpeed = 4.2;
    setSpeedMbPerSec(initialSpeed);
    setEtaSeconds(Math.max(1, Math.round((totalMb - 0.8) / initialSpeed)));

    if (onToast) {
      onToast(`Iniciando download de ${apk.fileName}...`);
    }

    // Trigger physical binary APK download in user browser
    if (onDownloadApk) {
      onDownloadApk(apk);
    }

    let currentMb = 0.8;
    let step = 0;

    // Tick every 85ms for high smoothness and realistic jitter
    const intervalMs = 85;
    timerRef.current = window.setInterval(() => {
      step++;
      // Organic speed fluctuation around 4.5 - 6.8 MB/s
      const jitter = Math.sin(step / 3) * 0.9 + (Math.random() * 0.6 - 0.3);
      const currentSpeed = Math.max(2.4, 5.2 + jitter);
      setSpeedMbPerSec(parseFloat(currentSpeed.toFixed(1)));

      const deltaMb = (currentSpeed * intervalMs) / 1000;
      currentMb = Math.min(totalMb, currentMb + deltaMb);
      setDownloadedMb(parseFloat(currentMb.toFixed(1)));

      const pct = Math.min(100, Math.floor((currentMb / totalMb) * 100));
      setProgressPercent(pct);

      const remainingMb = Math.max(0, totalMb - currentMb);
      const remainingTime = Math.max(1, Math.round(remainingMb / currentSpeed));
      setEtaSeconds(remainingTime);

      if (currentMb >= totalMb || pct >= 100) {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Move to Google Play Protect verification phase
        setStage('verifying');
        setProgressPercent(100);
        setDownloadedMb(totalMb);
        setSpeedMbPerSec(0);

        if (onToast) {
          onToast('Verificando segurança com Play Protect...');
        }

        // Verifying delay simulates Google Play Protect signature & package scanner
        verifyTimerRef.current = window.setTimeout(() => {
          setStage('installed');
          if (onToast) {
            onToast(`${apk.name} instalado com sucesso!`);
          }
        }, 1300);
      }
    }, intervalMs);
  }, [stage, cleanup, totalMb, onToast, onDownloadApk, apk]);

  const openApp = useCallback(() => {
    if (onToast) {
      onToast(`Abrindo ${apk.name}...`);
    }
  }, [apk.name, onToast]);

  return {
    stage,
    progressPercent,
    downloadedMb,
    totalMb,
    speedMbPerSec,
    etaSeconds,
    startDownload,
    cancelDownload,
    uninstallApp,
    openApp,
  };
}
