import React from "react";
import { useRouter } from "next/navigation";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import LoadingSpinner from "../LoadingSpinner";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading } = useAdminAccess();
  const router = useRouter();

  if (loading) return <LoadingSpinner />;
  if (!isAdmin) router.push("/");

  return <>{children}</>;
};

export default AdminRoute;
