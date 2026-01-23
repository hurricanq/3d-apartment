import React from "react";
import { Spinner } from "./ui/spinner";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded shadow">
      <p className="text-white">Loading...</p>
      <Spinner />
    </div>
  );
};

export default LoadingSpinner;
