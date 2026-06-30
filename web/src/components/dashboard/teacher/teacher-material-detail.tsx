"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  useDeleteTeacherMaterial,
  useShareTeacherMaterial,
  useTeacherCourses,
  useTeacherMaterial,
} from "@/hooks/use-dashboard-data";
import { usePageLoading } from "@/hooks/use-page-loading";
import { AdminBackLink, AdminFormField, adminSelectClass } from "../admin/admin-workflow-ui";
import { ManagementPageHeader, ManagementPanel } from "../management/management-ui";
import { TEACHER_MATERIALS, buildTeacherCoursesFallback } from "./teacher-data";
import { TeacherDetailSkeleton, TeacherNotFound } from "./teacher-workflow-ui";
type MaterialDetail = {
  id: string;
  name: string;
  type: string;
  size: string;
  classId: string;
  sharedWith: string;
  uploaded: string;
  sharedClasses: string[];
};

export function TeacherMaterialDetail({ materialId }: { materialId: string }) {
  const router = useRouter();
  const pageLoading = usePageLoading();
  const fallback = TEACHER_MATERIALS.find((m) => m.id === materialId);
  const { data: material, isFetching, isError, isFetched } = useTeacherMaterial<MaterialDetail | null>(
    materialId,
    fallback ? { ...fallback, classId: "class-a", sharedClasses: ["class-a"] } : undefined,
  );  const { data: coursesData } = useTeacherCourses(buildTeacherCoursesFallback());
  const shareMaterial = useShareTeacherMaterial(materialId);
  const deleteMaterial = useDeleteTeacherMaterial();
  const [shareClassId, setShareClassId] = useState("");

  const classLabel = (id: string) => coursesData.classes.find((c) => c.id === id)?.name ?? id;

  if ((pageLoading && isFetching) || (isFetching && !isFetched)) {
    return <TeacherDetailSkeleton />;
  }

  if (isFetched && (isError || !material)) {
    return (
      <TeacherNotFound
        title="Material not found"
        description="This file may have been deleted or the link is invalid."
        backHref="/teacher/materials"
        backLabel="Back to materials"
      />
    );
  }

  if (!material) return <TeacherDetailSkeleton />;
  const onShare = async () => {
    if (!shareClassId) return;
    await shareMaterial.mutateAsync([shareClassId]);
    setShareClassId("");
  };

  const onDelete = async () => {
    await deleteMaterial.mutateAsync(materialId);
    router.push("/teacher/materials");
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/teacher/materials" label="Back to materials" />
      <ManagementPageHeader title={material.name} description={`${material.type} · ${material.size} · Uploaded ${material.uploaded}`} />

      <ManagementPanel className="border border-border space-y-4">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">Shared with</p>
          <p className="mt-1 font-semibold">{material.sharedWith}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {material.sharedClasses.map((sharedClassId) => (
            <Link
              key={sharedClassId}
              href={`/teacher/classes/${sharedClassId}`}
              className="rounded-full bg-muted px-3 py-1 text-xs font-semibold hover:text-brand-purple"
            >
              {classLabel(sharedClassId)}
            </Link>
          ))}
        </div>      </ManagementPanel>

      <ManagementPanel className="border border-border">
        <h3 className="font-bold">Share with another class</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <AdminFormField label="Class" className="flex-1">
            <select value={shareClassId} onChange={(e) => setShareClassId(e.target.value)} className={adminSelectClass}>
              <option value="">Select class</option>
              {coursesData.classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </AdminFormField>
          <Button className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90" disabled={shareMaterial.isPending || !shareClassId} onClick={onShare}>
            {shareMaterial.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share"}
          </Button>
        </div>
      </ManagementPanel>

      <Button variant="outline" className="rounded-full text-destructive hover:text-destructive" disabled={deleteMaterial.isPending} onClick={onDelete}>
        <Trash2 className="mr-2 h-4 w-4" />
        {deleteMaterial.isPending ? "Deleting…" : "Delete material"}
      </Button>
    </div>
  );
}
