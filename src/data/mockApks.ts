import { ApkItem } from '../types/apk';
import {
  AVATAR_CARLOS,
  AVATAR_FERNANDA,
  AVATAR_ROBERTO,
  AVATAR_JULIANA,
  AVATAR_MARCOS,
  AVATAR_LUCIANA,
  AVATAR_THIAGO,
  AVATAR_CAMILA,
} from './reviewerAvatars';
import { ICON_BRASPRESS, ICON_NOVASPHERE, ICON_FINTRACK } from './appIcons';

export const INITIAL_APKS: ApkItem[] = [
  {
    id: 'apk-1',
    name: 'Braspress Transportadora',
    company: 'Braspress Transportes Urgentes',
    category: 'Negócios',
    downloads: '100K+',
    description: `O aplicativo oficial da Braspress Transportes Urgentes conecta você diretamente à maior malha logística rodoviária e aérea do Brasil com alta segurança e tecnologia.

RECURSOS E FUNCIONALIDADES PRINCIPAIS:
• Rastreamento em tempo real: Monitore encomendas de ponta a ponta com status minuto a minuto.
• Cotação instantânea de frete: Calcule prazos e valores de envio com agilidade corporativa.
• Localizador inteligente de filiais: Encontre a unidade mais próxima com rotas e contatos.
• Gestão centralizada de remessas: Acompanhe históricos de envios e comprovantes de entrega digitais.

SEGURANÇA E CONFIABILIDADE:
• Validação rigorosa de integridade do pacote oficial braspress.apk (38.4 MB).
• Conexões com criptografia TLS de 256 bits para todas as consultas de carga.
• Dados protegidos em conformidade com as normas de privacidade vigentes.

COMPATIBILIDADE E DESEMPENHO:
• Aplicativo ultra-leve otimizado para baixo consumo de bateria e dados móveis.
• Compatível com smartphones Android 8.0 ou superior.`,
    fileName: 'braspress.apk',
    fileSize: '38.4 MB',
    uploadedAt: '28/10/2026 às 17:42',
    createdAt: '28/10/2026 às 17:42',
    iconSrc: ICON_BRASPRESS,
    ratingAvg: 4.8,
    ratingTotal: '1.248 avaliações validadas',
    packageName: 'br.com.braspress.app',
    versionName: '4.2.1',
    versionCode: 421,
    minSdk: 'Android 8.0 (API 26)',
    targetSdk: 'Android 14 (API 34)',
    sha256: 'a4f938c9e83d291b0c9f1a74d284e56b9c8a123f456789abcdef0123456789ab',
    verifiedByPlayProtect: true,
    ratingBars: [
      { stars: 5, pct: 80 },
      { stars: 4, pct: 20 },
      { stars: 3, pct: 0 },
      { stars: 2, pct: 0 },
      { stars: 1, pct: 0 },
    ],
    reviews: [
      {
        name: 'Carlos Mendes',
        avatarUrl: AVATAR_CARLOS,
        initials: 'CM',
        color: '#1a73e8',
        date: '12 de março de 2026',
        stars: 5,
        text: 'Ótimo aplicativo! Facilita muito o rastreamento de cargas. Interface limpa e intuitiva. Recomendo para quem usa os serviços da Braspress.',
        helpful: 34,
      },
      {
        name: 'Fernanda Lima',
        avatarUrl: AVATAR_FERNANDA,
        initials: 'FL',
        color: '#e91e63',
        date: '8 de março de 2026',
        stars: 4,
        text: 'Funciona com extrema rapidez nas notificações de despacho. Cumpre rigorosamente os prazos exibidos.',
        helpful: 18,
      },
      {
        name: 'Roberto Alves',
        avatarUrl: AVATAR_ROBERTO,
        initials: 'RA',
        color: '#f57c00',
        date: '1 de março de 2026',
        stars: 5,
        text: 'Excelente! Atualiza o status das entregas em tempo real. Muito útil para acompanhar as remessas da empresa.',
        helpful: 52,
      },
      {
        name: 'Juliana Costa',
        avatarUrl: AVATAR_JULIANA,
        initials: 'JC',
        color: '#7b1fa2',
        date: '22 de fevereiro de 2026',
        stars: 5,
        text: 'Interface profissional e objetiva. Muito fácil solicitar coletas e visualizar notas fiscais de transporte.',
        helpful: 27,
      },
      {
        name: 'Thiago Silva',
        avatarUrl: AVATAR_THIAGO,
        initials: 'TS',
        color: '#01875f',
        date: '18 de fevereiro de 2026',
        stars: 5,
        text: 'Aplicativo leve e estável. Roda sem nenhum travamento no meu aparelho corporativo.',
        helpful: 15,
      },
    ],
  },
  {
    id: 'apk-2',
    name: 'Novasphere IPTV Pro',
    company: 'Novasphere Media Corp',
    category: 'Entretenimento',
    downloads: '500K+',
    description: `Central de streaming para reprodução de listas IPTV, suporte a múltiplos perfis, canais em alta resolução e guia EPG integrado.

RECURSOS E FUNCIONALIDADES PRINCIPAIS:
• Suporte multi-protocolo e reprodução 4K HDR de alta fluidez.
• Guia EPG interativo com programação de grade minuto a minuto.
• Gerenciamento de múltiplos perfis familiares com bloqueio parental.

SEGURANÇA E DESEMPENHO:
• Criptografia de streams e decodificação acelerada por hardware.
• Consumo balanceado de memória e processamento otimizado.`,
    fileName: 'novasphere-iptv-v3.4.apk',
    fileSize: '48.6 MB',
    uploadedAt: '27/10/2026 às 11:20',
    createdAt: '27/10/2026 às 11:20',
    iconSrc: ICON_NOVASPHERE,
    ratingAvg: 4.7,
    ratingTotal: '640 avaliações validadas',
    packageName: 'com.novasphere.iptv.pro',
    versionName: '3.4.0',
    versionCode: 340,
    minSdk: 'Android 7.0 (API 24)',
    targetSdk: 'Android 14 (API 34)',
    sha256: '9b2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f708192a3b4c5d6e7f8091',
    verifiedByPlayProtect: true,
    ratingBars: [
      { stars: 5, pct: 75 },
      { stars: 4, pct: 25 },
      { stars: 3, pct: 0 },
      { stars: 2, pct: 0 },
      { stars: 1, pct: 0 },
    ],
    reviews: [
      {
        name: 'Marcos Vinicius',
        avatarUrl: AVATAR_MARCOS,
        initials: 'MV',
        color: '#01875f',
        date: '15 de outubro de 2026',
        stars: 5,
        text: 'Excelente player, roda super liso e o carregamento dos canais é instantâneo.',
        helpful: 28,
      },
      {
        name: 'Camila Duarte',
        avatarUrl: AVATAR_CAMILA,
        initials: 'CD',
        color: '#7c3aed',
        date: '10 de outubro de 2026',
        stars: 4,
        text: 'Interface muito intuitiva para organizar listas e canais favoritos.',
        helpful: 12,
      },
    ],
  },
  {
    id: 'apk-3',
    name: 'FinTrack Digital Wallet',
    company: 'FinTrack Tech S.A.',
    category: 'Finanças',
    downloads: '1M+',
    description: `Aplicativo para controle financeiro empresarial, emissão de extratos seguros e pagamentos instantâneos com certificação bancária.

RECURSOS E FUNCIONALIDADES PRINCIPAIS:
• Conciliação bancária automática com exportação de extratos.
• Gestão de fluxo de caixa em tempo real com relatórios executivos.
• Autenticação biométrica multifatorial e token de segurança integrado.`,
    fileName: 'fintrack-wallet-v2.1.apk',
    fileSize: '36.2 MB',
    uploadedAt: '25/10/2026 às 09:15',
    createdAt: '25/10/2026 às 09:15',
    iconSrc: ICON_FINTRACK,
    ratingAvg: 4.9,
    ratingTotal: '980 avaliações validadas',
    packageName: 'com.fintrack.wallet.enterprise',
    versionName: '2.1.4',
    versionCode: 214,
    minSdk: 'Android 8.1 (API 27)',
    targetSdk: 'Android 14 (API 34)',
    sha256: '718293a4b5c6d7e8f901a2b3c4d5e6f708192a3b4c5d6e7f8091a4f938c9e83d',
    verifiedByPlayProtect: true,
    ratingBars: [
      { stars: 5, pct: 100 },
      { stars: 4, pct: 0 },
      { stars: 3, pct: 0 },
      { stars: 2, pct: 0 },
      { stars: 1, pct: 0 },
    ],
    reviews: [
      {
        name: 'Luciana Ramos',
        avatarUrl: AVATAR_LUCIANA,
        initials: 'LR',
        color: '#1a73e8',
        date: '20 de outubro de 2026',
        stars: 5,
        text: 'Melhor app financeiro corporativo que já utilizei. Segurança nota 10 e conciliação perfeita.',
        helpful: 41,
      },
    ],
  },
];
