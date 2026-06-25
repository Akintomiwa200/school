"use client";

import { createContext, useContext } from "react";
import { DEFAULT_ONLINE_CLASSES_BASE } from "./online-classes-data";

const OnlineClassesContext = createContext({ basePath: DEFAULT_ONLINE_CLASSES_BASE });

export function OnlineClassesProvider({
  basePath,
  children,
}: {
  basePath: string;
  children: React.ReactNode;
}) {
  return (
    <OnlineClassesContext.Provider value={{ basePath }}>{children}</OnlineClassesContext.Provider>
  );
}

export function useOnlineClassesBase() {
  return useContext(OnlineClassesContext).basePath;
}
