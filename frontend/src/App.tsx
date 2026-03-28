
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Button } from "@heroui/react";

const Xyz = () => {
  return (
    <div>
      <Button variant="primary">Click me</Button>
    </div>
  )
}
const router = createBrowserRouter([
  {
    path: "/",
    element: <Xyz />,
  },
  {
    path: "/about",
    element: <div>About</div>,
  },
  {
    path: "/contact",
    element: <div>Contact</div>,
  },
]);
export default function App() {
  return <RouterProvider router={router} />
}
