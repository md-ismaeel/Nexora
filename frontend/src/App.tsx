import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/routes";
import { ToastContainer } from "@/components/custom/toast";

export default function App() {
  return <>
    <RouterProvider router={router} />
    <ToastContainer />
  </>
}
