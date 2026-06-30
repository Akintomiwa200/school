"use client";

import type React from "react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGrid, Pencil, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { UserRole } from "@/shared";
import { ROLE_ROUTES } from "@/shared/permissions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getRouteIcon } from "./role-sidebar-icons";

const MAX_FAVORITES = 9;
const STORAGE_PREFIX = "school-lms-app-launcher-favorites";
const HIDDEN_FROM_FAVORITES = new Set(["Settings", "Profile", "Notifications"]);

const APP_TONES = [
  "bg-brand-blue/15 text-brand-blue",
  "bg-brand-purple/15 text-brand-purple",
  "bg-green/15 text-green",
  "bg-brand-orange/15 text-brand-orange",
  "bg-brand-pink/15 text-brand-pink",
  "bg-brand-yellow/20 text-foreground",
] as const;

type RouteItem = { label: string; path: string; icon: string };

function storageKey(role: UserRole) {
  return `${STORAGE_PREFIX}:${role}`;
}

function defaultFavoritePaths(routes: RouteItem[]) {
  return routes
    .filter((route) => !HIDDEN_FROM_FAVORITES.has(route.label))
    .slice(0, MAX_FAVORITES)
    .map((route) => route.path);
}

function loadFavoritePaths(role: UserRole, routes: RouteItem[]) {
  if (typeof window === "undefined") return defaultFavoritePaths(routes);

  try {
    const raw = window.localStorage.getItem(storageKey(role));
    if (!raw) return defaultFavoritePaths(routes);
    const parsed = JSON.parse(raw) as string[];
    const valid = parsed.filter((path) => routes.some((route) => route.path === path));
    return valid.length > 0 ? valid.slice(0, MAX_FAVORITES) : defaultFavoritePaths(routes);
  } catch {
    return defaultFavoritePaths(routes);
  }
}

function toneForPath(path: string) {
  let hash = 0;
  for (let i = 0; i < path.length; i += 1) hash = (hash + path.charCodeAt(i) * (i + 1)) % APP_TONES.length;
  return APP_TONES[hash];
}

function AppTile({
  route,
  editMode,
  isFavorite,
  onToggleFavorite,
  onNavigate,
}: {
  route: RouteItem;
  editMode: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onNavigate: () => void;
}) {
  const Icon = getRouteIcon(route.icon);

  const content = (
    <>
      <span
        className={cn(
          "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-transform",
          toneForPath(route.path),
          editMode && "ring-2 ring-transparent hover:ring-primary/30",
          isFavorite && editMode && "ring-primary/40",
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
        {editMode ? (
          <span
            className={cn(
              "absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
              isFavorite ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {isFavorite ? "★" : "+"}
          </span>
        ) : null}
      </span>
      <span className="line-clamp-2 w-full text-center text-[11px] font-medium leading-tight text-foreground">
        {route.label}
      </span>
    </>
  );

  if (editMode) {
    return (
      <button
        type="button"
        onClick={onToggleFavorite}
        className="flex flex-col items-center gap-2 rounded-xl p-2 transition-colors hover:bg-muted/50"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={route.path}
      onClick={onNavigate}
      className="flex flex-col items-center gap-2 rounded-xl p-2 transition-colors hover:bg-muted/50"
    >
      {content}
    </Link>
  );
}

type AppLauncherProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
};

export function AppLauncher({ open, onOpenChange, trigger }: AppLauncherProps) {
  const { data: session } = useSession();
  const role = (session?.user?.role as UserRole) ?? UserRole.STUDENT;
  const routes = useMemo(() => ROLE_ROUTES[role] ?? [], [role]);
  const [editMode, setEditMode] = useState(false);
  const [favoritePaths, setFavoritePaths] = useState<string[]>(() => defaultFavoritePaths(routes));

  useEffect(() => {
    setFavoritePaths(loadFavoritePaths(role, routes));
    setEditMode(false);
  }, [role, routes]);

  const persistFavorites = useCallback(
    (paths: string[]) => {
      setFavoritePaths(paths);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey(role), JSON.stringify(paths));
      }
    },
    [role],
  );

  const favoriteRoutes = useMemo(
    () =>
      favoritePaths
        .map((path) => routes.find((route) => route.path === path))
        .filter((route): route is RouteItem => route != null),
    [favoritePaths, routes],
  );

  const otherRoutes = useMemo(
    () => routes.filter((route) => !favoritePaths.includes(route.path)),
    [favoritePaths, routes],
  );

  const toggleFavorite = (path: string) => {
    if (favoritePaths.includes(path)) {
      persistFavorites(favoritePaths.filter((item) => item !== path));
      return;
    }
    if (favoritePaths.length >= MAX_FAVORITES) {
      toast.message(`You can pin up to ${MAX_FAVORITES} favorites`);
      return;
    }
    persistFavorites([...favoritePaths, path]);
  };

  const closeLauncher = () => {
    setEditMode(false);
    onOpenChange(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) setEditMode(false);
        onOpenChange(next);
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="w-[min(22rem,calc(100vw-1.5rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            {editMode ? "Edit favorites" : "Your favorites"}
          </h2>
          <button
            type="button"
            onClick={() => setEditMode((value) => !value)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={editMode ? "Done editing favorites" : "Edit favorites"}
          >
            {editMode ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
        </div>

        <div className="max-h-[min(28rem,70vh)] overflow-y-auto px-3 py-3">
          {favoriteRoutes.length > 0 ? (
            <div className="rounded-2xl bg-muted/40 p-3">
              <div className="grid grid-cols-3 gap-1">
                {favoriteRoutes.map((route) => (
                  <AppTile
                    key={route.path}
                    route={route}
                    editMode={editMode}
                    isFavorite
                    onToggleFavorite={() => toggleFavorite(route.path)}
                    onNavigate={closeLauncher}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
              {editMode ? "Tap apps below to add favorites." : "No favorites yet."}
            </div>
          )}

          {otherRoutes.length > 0 ? (
            <div className="mt-3">
              {!editMode && favoriteRoutes.length > 0 ? (
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  More apps
                </p>
              ) : null}
              <div className="grid grid-cols-3 gap-1">
                {otherRoutes.map((route) => (
                  <AppTile
                    key={route.path}
                    route={route}
                    editMode={editMode}
                    isFavorite={false}
                    onToggleFavorite={() => toggleFavorite(route.path)}
                    onNavigate={closeLauncher}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {editMode ? (
            <p className="mt-3 px-1 text-center text-xs text-muted-foreground">
              Tap an app to add or remove it from favorites (max {MAX_FAVORITES}).
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}