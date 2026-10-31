export interface ReviewItem {
  name: string;
  avatarUrl?: string;
  initials: string;
  color: string;
  date: string;
  stars: number;
  text: string;
  helpful: number;
}

export interface RatingBarItem {
  stars: number;
  pct: number;
}

export interface QrCustomization {
  darkColor: string;
  lightColor: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  includeLogo: boolean;
  moduleRadius: number;
  showFrame: boolean;
  frameText: string;
  frameColor: string;
  downloadToken: string;
  slug: string;
  customDomain?: string;
  directLinkSig?: string;
  qrCodeSig?: string;
}

export interface ApkLiveMetrics {
  views: number;
  downloads: number;
  conversionRate: number;
  lastLeadAt: string | null;
  createdAt: string;
}

export interface ApkItem {
  id: string;
  name: string;
  company: string;
  category: string;
  downloads: string;
  description: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  createdAt?: string; // Data e horário de criação da tela/APK
  metrics?: ApkLiveMetrics; // Métricas reais de visitantes e downloads por APK
  iconSrc: string;
  ratingAvg: number;
  ratingTotal: string;
  ratingBars: RatingBarItem[];
  reviews: ReviewItem[];
  fileBlob?: Blob;
  apkDownloadUrl?: string;
  packageName?: string;
  versionName?: string;
  versionCode?: number;
  minSdk?: string;
  targetSdk?: string;
  sha256?: string;
  verifiedByPlayProtect?: boolean;
  themeColor?: string; // Cor de destaque única da marca
  qrSettings?: QrCustomization;
}
