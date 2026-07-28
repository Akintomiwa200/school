export const TEACHER_AVATAR_TONES = {
  purple: "bg-brand-purple/15 text-brand-purple ring-brand-purple/20",
  blue: "bg-brand-blue/15 text-brand-blue ring-brand-blue/20",
  green: "bg-green/15 text-green ring-green/20",
  orange: "bg-brand-orange/15 text-brand-orange ring-brand-orange/20",
} as const;

export const TEACHER_SCORE_BAR_TONES = {
  low: "bg-brand-orange",
  mid: "bg-brand-yellow",
  high: "bg-green",
} as const;

export function getTeacherScoreBarTone(score: number) {
  if (score >= 70) return TEACHER_SCORE_BAR_TONES.high;
  if (score >= 45) return TEACHER_SCORE_BAR_TONES.mid;
  return TEACHER_SCORE_BAR_TONES.low;
}

export const TEACHER_MASTERY_TONES = {
  attention: "bg-brand-orange/15 text-brand-orange",
  working: "bg-brand-blue/15 text-brand-blue",
  mastered: "bg-green/15 text-green",
} as const;

export type TeacherPerformanceTier = "mastered" | "working" | "attention";

export type TeacherStudentProficiency = {
  id: string;
  name: string;
  initials: string;
  avatarTone: "purple" | "blue" | "green" | "orange";
  rowTone: TeacherPerformanceTier;
  workCompleted: number;
  workTotal: number;
  averageScore: number;
  needingAttention: number;
  workingTowards: number;
  mastered: number;
};
