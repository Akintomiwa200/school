export interface FileAsset {
  id: string;
  publicId: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  folder?: string;
  uploadedBy: string;
  createdAt: Date;
}
