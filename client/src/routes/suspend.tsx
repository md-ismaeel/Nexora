import { Suspense } from "react";
import { PageLoader } from "@/components/custom/page-loader";

export const suspend = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);
