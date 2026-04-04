import { Suspense } from "react";
import { PageLoader } from "@/components/custom/page-loader";

/**
 * suspend() — wraps a lazy-loaded element in <Suspense> with PageLoader fallback.
 *
 * Used in routes.tsx so every lazy route shows the full-page loader
 * while its chunk is downloading.
 */
export const suspend = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);