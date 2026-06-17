import { NextRequest, NextResponse } from "next/server";
import { createApiResponse } from "@/shared";
import { requireAuth } from "@/lib/auth";
import { uploadToCloudinary, type UploadFolder } from "@/lib/storage";
import { prisma } from "@/lib/db";

const ALLOWED_FOLDERS: UploadFolder[] = [
  "avatars",
  "course-materials",
  "assignments",
  "documents",
  "receipts",
  "announcements",
  "library",
  "general",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as UploadFolder) ?? "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json(
        { success: false, error: "Invalid upload folder" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadToCloudinary(buffer, {
      folder,
      fileName: `${user.id}-${Date.now()}`,
    });

    const asset = await prisma.fileAsset.create({
      data: {
        publicId: uploadResult.publicId,
        url: uploadResult.secureUrl,
        fileName: file.name,
        fileType: file.type || uploadResult.format,
        fileSize: uploadResult.bytes,
        folder,
        uploadedBy: user.id,
      },
    });

    return NextResponse.json(
      createApiResponse(
        {
          id: asset.id,
          url: asset.url,
          publicId: asset.publicId,
          fileName: asset.fileName,
          fileType: asset.fileType,
          fileSize: asset.fileSize,
        },
        "File uploaded successfully"
      ),
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "File ID required" }, { status: 400 });
    }

    const asset = await prisma.fileAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    if (asset.uploadedBy !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { deleteFromCloudinary } = await import("@/lib/storage");
    const resourceType = asset.fileType.startsWith("video") ? "video" : asset.fileType.startsWith("image") ? "image" : "raw";
    await deleteFromCloudinary(asset.publicId, resourceType);
    await prisma.fileAsset.delete({ where: { id } });

    return NextResponse.json(createApiResponse(null, "File deleted successfully"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
