import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "@/store/store";
import { router } from "@/routes/routes";
import { ContextMenuProvider } from "@/components/custom/context-menu";
import { ModalRoot } from "@/components/modals/modal-root";
import { ToastContainer } from "@/components/custom/toast";

/**
 * App — root component.
 *
 * Layer order (outermost → innermost):
 *   Provider            Redux store (slices + RTK Query cache)
 *   ContextMenuProvider Global right-click menu (renders above everything at z-[9998])
 *   RouterProvider      All routes with lazy-loaded pages
 *   ModalRoot           Overlay portal for createServer, createChannel, etc (z-40/50)
 *   ToastContainer      Fixed bottom-right animated toast stack (z-[9999])
 */
export default function App() {
  return (
    <Provider store={store}>
      <ContextMenuProvider>
        <RouterProvider router={router} />
        <ModalRoot />
        <ToastContainer />
      </ContextMenuProvider>
    </Provider>
  );
}