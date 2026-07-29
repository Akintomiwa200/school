"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, FolderOpen, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAddTeacherMaterial, useTeacherCourses, useTeacherMaterials } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { AdminFormField, adminInputClass, adminSelectClass } from "../admin/admin-workflow-ui";
import { ManagementPanel, ManagementStatCard } from "../management/management-ui";
import { TeacherPageHeader, teacherInitialLoading } from "./teacher-workflow-ui";

type MaterialItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  sharedWith: string;
  classId: string;
  uploaded: string;
};

const COURSES_EMPTY = {
  classes: [] as { id: string; name: string }[],
  courses: [] as never[]
};

function MaterialsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-[20px] bg-muted" />
        ))}
      </div>
      <div className="h-12 w-full max-w-sm animate-pulse rounded-xl bg-muted" />
      <div className="h-96 animate-pulse rounded-[20px] bg-muted" />
    </div>
  );
}

function MaterialsModal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <ManagementPanel className="w-full max-w-md border border-border shadow-xl">
        <h2 className="text-lg font-bold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        <div className="mt-5 space-y-4">{children}</div>
        <div className="mt-6 flex justify-end">
          <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </ManagementPanel>
    </div>
  );
}

export function TeacherMaterials() {
  const { data: coursesData = COURSES_EMPTY, isFetching: coursesFetching } = useTeacherCourses(COURSES_EMPTY);
  const { data: materials = [], isFetching, isFetched } = useTeacherMaterials<MaterialItem[]>([]);
  const addMaterial = useAddTeacherMaterial();
  const pageLoading = usePageLoading();

  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("PDF");
  const [size, setSize] = useState("1.0 MB");
  const [newClassId, setNewClassId] = useState(coursesData.classes[0]?.id ?? "");

  const loading = teacherInitialLoading(pageLoading, isFetching || coursesFetching, isFetched);

  // Get unique material types from existing materials
  const materialTypes = useMemo(() => {
    const types = new Set(materials.map((m) => m.type));
    return Array.from(types);
  }, [materials]);

  // Filter by class if selected
  const classFiltered = useMemo(() => {
    if (!classId) return materials;
    return materials.filter((m) => m.classId === classId);
  }, [materials, classId]);

  // Filter by type if selected
  const typeFiltered = useMemo(() => {
    if (!typeFilter) return classFiltered;
    return classFiltered.filter((m) => m.type === typeFilter);
  }, [classFiltered, typeFilter]);

  // Filter by search term
  const filtered = useMemo(() => {
    if (!search.trim()) return typeFiltered;
    const q = search.toLowerCase();
    return typeFiltered.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.sharedWith.toLowerCase().includes(q)
    );
  }, [typeFiltered, search]);

  const totalMaterials = materials.length;
  const totalSize = useMemo(() => {
    return materials.reduce((total, m) => {
      const sizeStr = m.size.split(" ")[0];
      const sizeNum = parseFloat(sizeStr);
      const unit = m.size.split(" ")[1]?.toUpperCase();
      if (unit === "GB") return total + sizeNum * 1024;
      if (unit === "KB") return total + sizeNum / 1024;
      return total + sizeNum; // MB
    }, 0);
  }, [materials]);

  const pdfCount = materials.filter((m) => m.type === "PDF").length;
  const docCount = materials.filter((m) => m.type === "DOCX").length;
  const pptCount = materials.filter((m) => m.type === "PPTX").length;
  const otherCount = totalMaterials - pdfCount - docCount - pptCount;

  const recentUploads = materials.filter((m) => {
    const uploadDate = new Date(m.uploaded);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return uploadDate >= weekAgo;
  }).length;

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await addMaterial.mutateAsync({ name, classId: newClassId, type, size });
    setOpen(false);
    setName("");
    if (created && typeof created === "object" && "id" in created) {
      window.location.href = `/teacher/materials/${(created as { id: string }).id}`;
    }
  };

  const getFileIcon = (type: string) => {
    const icons: Record<string, string> = {
      PDF: "📄",
      DOCX: "📝",
      PPTX: "📊",
      Video: "🎥",
      Link: "🔗",
    };
    return icons[type] || "📁";
  };

  if (loading) return <MaterialsSkeleton />;

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Materials"
        description={totalMaterials > 0 ? `${totalMaterials} learning resources` : "Upload and share learning resources."}
        isFetching={isFetching}
        action={
          <Button
            className="rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload file
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ManagementStatCard
          label="Total materials"
          value={String(totalMaterials)}
          tone="purple"
        />
        <ManagementStatCard
          label="Storage used"
          value={`${totalSize.toFixed(1)} MB`}
          hint={`${pdfCount} PDFs · ${docCount} Docs · ${pptCount} PPTs`}
          tone="blue"
        />
        <ManagementStatCard
          label="Recent uploads"
          value={String(recentUploads)}
          hint="Last 7 days"
          tone={recentUploads > 0 ? "green" : "orange"}
        />
        <ManagementStatCard
          label="File types"
          value={String(materialTypes.length)}
          hint={otherCount > 0 ? `${otherCount} other formats` : `${materialTypes.length} formats used`}
          tone="green"
        />
      </div>

      <div className="dashboard-filter-bar" data-filter-bar="true">
        <div className="relative min-w-[12rem] flex-1 basis-[14rem]" data-search-field="true">
          <input
            type="text"
            placeholder="Search by name, type, or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="box-border h-10 w-full min-w-0 max-w-full rounded-xl border border-border bg-card px-4 pl-9 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="dashboard-filter-select box-border h-10 w-full min-w-[10.5rem] max-w-full shrink-0 appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:max-w-[16rem]"
        >
          <option value="">All classes</option>
          {coursesData.classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="dashboard-filter-select box-border h-10 w-full min-w-[10.5rem] max-w-full shrink-0 appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:max-w-[16rem]"
        >
          <option value="">All types</option>
          {materialTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <ManagementPanel className="overflow-x-auto border border-border p-0">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">File</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Shared with</th>
              <th className="px-5 py-3">Uploaded</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No materials found</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {search ? "Try a different search term." : "Upload your first learning resource to share with your classes."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((material) => {
                const uploadDate = new Date(material.uploaded);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const isRecent = uploadDate >= weekAgo;

                return (
                  <tr
                    key={material.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                          {getFileIcon(material.type)}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/teacher/materials/${material.id}`}
                            className="font-semibold text-foreground transition-colors hover:text-brand-purple"
                          >
                            {material.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{material.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        material.type === "PDF" ? "bg-red-500/10 text-red-500" :
                        material.type === "DOCX" ? "bg-blue-500/10 text-blue-500" :
                        material.type === "PPTX" ? "bg-orange-500/10 text-orange-500" :
                        material.type === "Video" ? "bg-purple-500/10 text-purple-500" :
                        "bg-green-500/10 text-green-500"
                      )}>
                        {material.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-muted-foreground">{material.sharedWith}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{material.uploaded}</span>
                        {isRecent && (
                          <span className="inline-flex items-center rounded-full bg-green/10 px-2 py-0.5 text-xs font-semibold text-green">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/teacher/materials/${material.id}`}
                        className="text-sm font-semibold text-brand-purple transition-colors hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} of {totalMaterials} materials
          </div>
        )}
      </ManagementPanel>

      <MaterialsModal open={open} title="Upload material" onClose={() => setOpen(false)}>
        <form onSubmit={onUpload} className="space-y-4">
          <AdminFormField label="File name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={adminInputClass}
              placeholder="e.g. Unit 4 slides"
            />
          </AdminFormField>
          <AdminFormField label="Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={adminSelectClass}
            >
              {["PDF", "DOCX", "PPTX", "Video", "Link"].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label="Size">
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className={adminInputClass}
              placeholder="e.g. 2.5 MB"
            />
          </AdminFormField>
          <AdminFormField label="Share with class">
            <select
              value={newClassId}
              onChange={(e) => setNewClassId(e.target.value)}
              className={adminSelectClass}
            >
              {coursesData.classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </AdminFormField>
          <Button
            type="submit"
            className="w-full rounded-full bg-brand-purple text-white hover:bg-brand-purple/90"
            disabled={addMaterial.isPending}
          >
            {addMaterial.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Upload"
            )}
          </Button>
        </form>
      </MaterialsModal>
    </div>
  );
}
