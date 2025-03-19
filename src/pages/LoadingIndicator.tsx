import React from "react";

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading model...",
}) => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <span>{message}</span>
    </div>
  );
};

export default LoadingIndicator;
