import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken } from "./authStore";
import type { JSX } from "react";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const token = getAccessToken();
  const loc = useLocation();

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: loc.pathname }} />;
  }

  return children;
}
