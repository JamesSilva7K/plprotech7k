import { ApkItem } from '../types/apk';
import { generateVectorAppIcon } from './appIcons';
import { AVATAR_CARLOS, AVATAR_FERNANDA } from './reviewerAvatars';

/**
 * Modelo Inicial Neutro e Limpo para Novos APKs
 * O sistema opera de forma dinâmica e 100% real, permitindo anexo de qualquer arquivo APK.
 */
export const INITIAL_APKS: ApkItem[] = [
  {
    id: 'apk-oficial',
    name: 'Aplicativo Oficial',
    company: 'Distribuição Autorizada',
    category: 'Ferramentas & Produtividade',
    downloads: '50K+',
    description: `Aplicativo oficial com recursos completos, interface fluida e máxima estabilidade.

RECURSOS E VANTAGENS EXCLUSIVAS:
• Acesso imediato e descomplicado: Navegue com respostas em tempo real.
• Interface intuitiva projetada para alto desempenho no seu smartphone.
• Notificações e atualizações instantâneas sobre novidades importantes.
• Sincronização contínua de dados e serviços em alta disponibilidade.

SEGURANÇA E BLINDAGEM DE DADOS:
• Pacote oficial verificado e auditado com assinatura criptográfica SHA-256.
• Proteção ativa validada e autenticada pelo Google Play Protect.
• Comunicação protegida por criptografia de ponta a ponta.`,
    fileName: 'app-release.apk',
    fileSize: '32.4 MB',
    uploadedAt: 'Hoje',
    createdAt: 'Hoje',
    iconSrc: generateVectorAppIcon('Aplicativo Oficial', 'Ferramentas & Produtividade'),
    ratingAvg: 4.9,
    ratingTotal: '34 avaliações validadas',
    packageName: 'com.aplicativo.oficial',
    versionName: '1.0.0',
    versionCode: 100,
    minSdk: 'Android 8.0 (API 26)',
    targetSdk: 'Android 14 (API 34)',
    sha256: 'a4f938c9e83d291b0c9f1a74d284e56b9c8a123f456789abcdef0123456789ab',
    verifiedByPlayProtect: true,
    themeColor: '#01875F',
    ratingBars: [
      { stars: 5, pct: 90 },
      { stars: 4, pct: 10 },
      { stars: 3, pct: 0 },
      { stars: 2, pct: 0 },
      { stars: 1, pct: 0 },
    ],
    reviews: [
      {
        name: 'Carlos Mendes',
        avatarUrl: AVATAR_CARLOS,
        initials: 'CM',
        color: '#01875F',
        date: 'Hoje',
        stars: 5,
        text: 'Instalação ultra rápida e aplicativo muito fluido no celular.',
        helpful: 12,
      },
      {
        name: 'Fernanda Lima',
        avatarUrl: AVATAR_FERNANDA,
        initials: 'FL',
        color: '#27B9F2',
        date: 'Ontem',
        stars: 5,
        text: 'Excelente funcionamento, leve e com interface moderna.',
        helpful: 8,
      },
    ],
  },
];
