import React from "react";
import { useLoading } from "@/services/LoadingService";

const LoadingOverlay: React.FC = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-t-4 border-t-transparent border-white rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingOverlay;
