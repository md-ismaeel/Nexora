import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";

export const suspend = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);
