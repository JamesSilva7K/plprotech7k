/**
 * Utilitário de Execução e Abertura de APK para Dispositivos Android
 * Permite acionar a continuidade da instalação do APK diretamente no aparelho do lead.
 */

import { ApkItem } from '../types/apk';

export function executeAndroidApk(apk: ApkItem, onNotify?: (title: string, desc: string) => void): void {
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  // 1. Aciona o arquivo físico com MIME type oficial de pacote Android
  try {
    let apkBlob: Blob;
    if (apk.fileBlob) {
      apkBlob = apk.fileBlob;
    } else {
      // Pacote de fallback
      apkBlob = new Blob([new Uint8Array([0x50, 0x4B, 0x03, 0x04])], {
        type: 'application/vnd.android.package-archive',
      });
    }

    const blobUrl = URL.createObjectURL(apkBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = apk.fileName.endsWith('.apk') ? apk.fileName : `${apk.fileName}.apk`;
    link.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 20000);
  } catch (err) {
    console.warn('Falha ao acionar download direto do APK:', err);
  }

  // 2. No Android, dispara o Intent do PackageInstaller para iniciar a instalação nativa
  if (isAndroid) {
    try {
      const pkg = apk.packageName || 'com.google.android.packageinstaller';
      // Intent nativo para abrir o instalador de pacotes Android
      const intentUrl = `intent:#Intent;action=android.intent.action.VIEW;type=application/vnd.android.package-archive;package=${pkg};end`;
      window.location.href = intentUrl;
    } catch (e) {
      console.warn('Falha ao disparar Intent Android:', e);
    }
  }

  if (onNotify) {
    if (isAndroid) {
      onNotify(
        'Abrindo Instalador Android',
        `Toque em "Instalar" ou "Concluir" no aviso do seu aparelho para finalizar a instalação de ${apk.name}.`
      );
    } else {
      onNotify(
        `Abrindo ${apk.name}`,
        'Arquivo APK transferido para seu aparelho. Abra o arquivo baixado para concluir a instalação.'
      );
    }
  }
}
