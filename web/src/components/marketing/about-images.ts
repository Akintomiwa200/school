/** Verified Unsplash URLs for the About page (HEAD-checked). */
export const ABOUT_IMAGES = {
  heroClassroom:
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=960&fit=crop",
  teacherStudent:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop",
  studentsCollaborating:
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&h=700&fit=crop",
  principalSarah:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=560&h=720&fit=crop",
  principalDavid:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=560&h=720&fit=crop",
  highlightStudents:
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=320&h=200&fit=crop",
  highlightLearning:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=320&h=200&fit=crop",
  highlightStudy:
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=320&h=200&fit=crop",
} as const;

export const ABOUT_HIGHLIGHT_IMAGES = [
  ABOUT_IMAGES.highlightStudents,
  ABOUT_IMAGES.highlightLearning,
  ABOUT_IMAGES.highlightStudy,
] as const;
