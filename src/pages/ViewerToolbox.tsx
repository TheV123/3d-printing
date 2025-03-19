import React, { useState } from "react";

interface Tool {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  cursor: string;
}

interface ViewerToolboxProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

const ViewerToolbox: React.FC<ViewerToolboxProps> = ({
  activeTool,
  setActiveTool,
}) => {
  const [hoverTooltip, setHoverTooltip] = useState<string | null>(null);

  const tools: Tool[] = [
    {
      id: "rotate",
      name: "Rotate",
      icon: "↻",
      shortcut: "1",
      cursor:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 4.5V4a2 2 0 0 0-4 0v3.5'/%3E%3Cpath d='M5.5 7h8'/%3E%3Cpath d='M7 19.5V20a2 2 0 0 0 4 0v-3.5'/%3E%3Cpath d='M18.5 17h-8'/%3E%3Cpath d='M18.5 7h2.5a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2h-6'/%3E%3Cpath d='M5.5 17h-2.5a2 2 0 0 1-2-2v-9.5a2 2 0 0 1 2-2h6'/%3E%3C/svg%3E\") 12 12, auto",
    },
    {
      id: "pan",
      name: "Pan",
      icon: "⇄",
      shortcut: "2",
      cursor:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 9l-3 3 3 3'/%3E%3Cpath d='M9 5l3-3 3 3'/%3E%3Cpath d='M15 19l-3 3-3-3'/%3E%3Cpath d='M19 9l3 3-3 3'/%3E%3Cpath d='M2 12h20'/%3E%3Cpath d='M12 2v20'/%3E%3C/svg%3E\") 12 12, move",
    },
    {
      id: "zoomIn",
      name: "Zoom In",
      icon: "🔍+",
      shortcut: "3",
      cursor: "zoom-in",
    },
    {
      id: "zoomOut",
      name: "Zoom Out",
      icon: "🔍-",
      shortcut: "4",
      cursor: "zoom-out",
    },
  ];

  return (
    <div className="viewer-toolbox">
      <div className="tools-wrapper">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="tool-container"
            onMouseEnter={() => setHoverTooltip(tool.id)}
            onMouseLeave={() => setHoverTooltip(null)}
          >
            <button
              className={`tool-item ${activeTool === tool.id ? "active" : ""}`}
              onClick={() => setActiveTool(tool.id)}
              aria-label={tool.name}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-name">{tool.name}</span>
              <span className="tool-shortcut">{tool.shortcut}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewerToolbox;
