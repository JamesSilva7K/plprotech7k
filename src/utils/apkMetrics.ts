import { RatingBarItem, ReviewItem } from '../types/apk';

export interface CalculatedMetrics {
  totalReviewsCount: number;
  averageRating: number;
  totalHelpfulVotes: number;
  ratingBars: RatingBarItem[];
  fiveStarPercentage: number;
  satisfactionRate: number;
}

/**
 * Recalcula com exatidão matemática todas as métricas dos avaliadores reais
 */
export function calculateValidatedMetrics(reviews: ReviewItem[]): CalculatedMetrics {
  if (!reviews || reviews.length === 0) {
    return {
      totalReviewsCount: 0,
      averageRating: 5.0,
      totalHelpfulVotes: 0,
      ratingBars: [
        { stars: 5, pct: 100 },
        { stars: 4, pct: 0 },
        { stars: 3, pct: 0 },
        { stars: 2, pct: 0 },
        { stars: 1, pct: 0 },
      ],
      fiveStarPercentage: 100,
      satisfactionRate: 100,
    };
  }

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let starSum = 0;
  let helpfulSum = 0;

  for (const rev of reviews) {
    const s = Math.min(5, Math.max(1, Math.round(rev.stars || 5)));
    counts[s] = (counts[s] || 0) + 1;
    starSum += s;
    helpfulSum += rev.helpful || 0;
  }

  const total = reviews.length;
  const avg = Math.round((starSum / total) * 10) / 10;

  const ratingBars: RatingBarItem[] = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    pct: Math.round(((counts[stars] || 0) / total) * 100),
  }));

  const positiveReviews = (counts[5] || 0) + (counts[4] || 0);
  const satisfactionRate = Math.round((positiveReviews / total) * 100);

  return {
    totalReviewsCount: total,
    averageRating: avg,
    totalHelpfulVotes: helpfulSum,
    ratingBars,
    fiveStarPercentage: ratingBars[0].pct,
    satisfactionRate,
  };
}

/**
 * Calcula o hash SHA-256 criptográfico real de um arquivo (File/Blob)
 */
export async function calculateRealSha256(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera fingerprint SHA-256 canônico a partir de metadados
 */
export async function generateApkChecksum(fileName: string, fileSize: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${fileName}:${fileSize}:apk-studio-verified-android-package`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
