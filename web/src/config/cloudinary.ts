export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  apiKey: process.env.CLOUDINARY_API_KEY ?? "",
  apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  publicCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  uploadFolders: [
    "avatars",
    "course-materials",
    "assignments",
    "documents",
    "receipts",
    "announcements",
    "library",
    "general",
  ] as const,
};
