import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { typographyClasses, surfaceClasses, buttonClasses } from "@/utils/styles";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { typographyClasses, surfaceClasses, buttonClasses };
