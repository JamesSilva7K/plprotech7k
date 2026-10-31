import { ApkItem } from '../types/apk';
import { ICON_NIO_FIBRA } from './appIcons';

export const INITIAL_APKS: ApkItem[] = [
  {
    id: 'apk-nio',
    name: 'NIO Fibra Internet',
    company: 'NIO Fibra LTDA.',
    category: 'Ferramentas & Conectividade',
    downloads: '10K+',
    description: `O aplicativo oficial da NIO Fibra Internet oferece acesso rápido à sua conexão ultra-veloz, faturas digitais, suporte técnico e acompanhamento de sinal em tempo real.

RECURSOS E VANTAGENS EXCLUSIVAS:
• Gerenciamento completo da conexão e velocidade em tempo real.
• Emissão de faturas, código PIX e histórico de pagamentos.
• Teste de velocidade integrado e suporte técnico dedicado.
• Notificações de manutenção e melhorias na sua rede.

SEGURANÇA E CONFIABILIDADE:
• Pacote oficial verificado e autenticado pelo Google Play Protect.
• Criptografia de ponta a ponta para proteção dos seus dados.`,
    fileName: 'NIO Fibra Internet.apk',
    fileSize: '28.7 MB',
    uploadedAt: '30/10/2026 às 21:05',
    createdAt: '30/10/2026 às 21:05',
    iconSrc: ICON_NIO_FIBRA,
    ratingAvg: 4.9,
    ratingTotal: '28 avaliações validadas',
    packageName: 'br.com.niofibra.app',
    versionName: '2.4.0',
    versionCode: 240,
    minSdk: 'Android 8.0 (API 26)',
    targetSdk: 'Android 14 (API 34)',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    verifiedByPlayProtect: true,
    themeColor: '#14D855',
    ratingBars: [
      { stars: 5, pct: 92 },
      { stars: 4, pct: 8 },
      { stars: 3, pct: 0 },
      { stars: 2, pct: 0 },
      { stars: 1, pct: 0 },
    ],
    reviews: [
      {
        name: 'Carlos Mendes',
        initials: 'CM',
        color: '#14D855',
        date: 'Hoje',
        stars: 5,
        text: 'Excelente aplicativo! Internet ultra-rápida e app fácil de usar.',
        helpful: 14,
      },
      {
        name: 'Fernanda Lima',
        initials: 'FL',
        color: '#27B9F2',
        date: 'Ontem',
        stars: 5,
        text: 'Muito prático para emitir a 2ª via e consultar o status da fibra.',
        helpful: 9,
      },
    ],
  },
];
