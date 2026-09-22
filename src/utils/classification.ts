/**
 * Chỉ tiêu xếp loại đánh giá theo quy định PCVT (cập nhật mới):
 * - Đạt điểm chấm ≥ 90 điểm, Xếp loại Hoàn thành xuất sắc nhiệm vụ.
 * - Đạt điểm chấm ≥ 70 đến < 90 điểm, Xếp loại Hoàn thành tốt nhiệm vụ.
 * - Đạt điểm chấm ≥ 50 đến < 70 điểm, Xếp loại hoàn thành nhiệm vụ.
 * - Đạt điểm chấm < 50 điểm, Xếp loại không hoàn thành nhiệm vụ.
 */

export interface ClassificationTier {
  key: 'xuat_sac' | 'tot' | 'hoan_thanh' | 'khong_hoan_thanh';
  rank: string;
  shortRank: string;
  fullTitle: string;
  condition: string;
  minScore: number;
  maxScore: number | null;
  badgeClass: string;
  textClass: string;
  bgLight: string;
  borderClass: string;
}

export const CLASSIFICATION_TIERS: ClassificationTier[] = [
  {
    key: 'xuat_sac',
    rank: 'Hoàn thành xuất sắc nhiệm vụ',
    shortRank: 'Xuất sắc',
    fullTitle: 'Xếp loại Hoàn thành xuất sắc nhiệm vụ',
    condition: 'Đạt điểm chấm ≥ 90 điểm',
    minScore: 90,
    maxScore: null,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    textClass: 'text-emerald-700',
    bgLight: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200'
  },
  {
    key: 'tot',
    rank: 'Hoàn thành tốt nhiệm vụ',
    shortRank: 'Tốt',
    fullTitle: 'Xếp loại Hoàn thành tốt nhiệm vụ',
    condition: 'Đạt điểm chấm ≥ 70 đến < 90 điểm',
    minScore: 70,
    maxScore: 90,
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    textClass: 'text-blue-700',
    bgLight: 'bg-blue-50/70',
    borderClass: 'border-blue-200'
  },
  {
    key: 'hoan_thanh',
    rank: 'Hoàn thành nhiệm vụ',
    shortRank: 'Hoàn thành NV',
    fullTitle: 'Xếp loại hoàn thành nhiệm vụ',
    condition: 'Đạt điểm chấm ≥ 50 đến < 70 điểm',
    minScore: 50,
    maxScore: 70,
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    textClass: 'text-amber-700',
    bgLight: 'bg-amber-50/70',
    borderClass: 'border-amber-200'
  },
  {
    key: 'khong_hoan_thanh',
    rank: 'Không hoàn thành nhiệm vụ',
    shortRank: 'Không hoàn thành',
    fullTitle: 'Xếp loại không hoàn thành nhiệm vụ',
    condition: 'Đạt điểm chấm < 50 điểm',
    minScore: 0,
    maxScore: 50,
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    textClass: 'text-rose-700',
    bgLight: 'bg-rose-50/70',
    borderClass: 'border-rose-200'
  }
];

export function getClassification(score: number): ClassificationTier {
  if (score >= 90) {
    return CLASSIFICATION_TIERS[0]; // Hoàn thành xuất sắc nhiệm vụ (≥ 90)
  }
  if (score >= 70) {
    return CLASSIFICATION_TIERS[1]; // Hoàn thành tốt nhiệm vụ (≥ 70 đến < 90)
  }
  if (score >= 50) {
    return CLASSIFICATION_TIERS[2]; // Hoàn thành nhiệm vụ (≥ 50 đến < 70)
  }
  return CLASSIFICATION_TIERS[3];   // Không hoàn thành nhiệm vụ (< 50)
}
