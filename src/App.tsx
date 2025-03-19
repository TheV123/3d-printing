import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import ModelViewer from "./pages/ModelViewer";
import FileDropzone from "./pages/FileDropzone";
import ViewerToolbox from "./pages/ViewerToolbox";
import "./App.css";
import UnitPrice from "./pages/UnitPrice";

function App() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [activeTool, setActiveTool] = useState<string>("rotate");
  const [dimensions, setDimensions] = useState<{ width: number; height: number; depth: number } | null>(null);
  const [costSettings, setCostSettings] = useState({
    materialCostPerCubicCm: 0.05,
    PLACostPerCubicCm: 1.25,
  });

  const handleFileLoaded = (url: string, name: string) => {
    setModelUrl(url);
    setFileName(name);
  };

  const handleSettingsChange = (newSettings: {
    materialCostPerCubicCm: number;
    PLACostPerCubicCm: number;
  }) => {
    setCostSettings(newSettings);
  };

  // STL files are unitless so we need the user to specify units
  const estimateCost = (dimensions: { width: number; height: number; depth: number }) => {
    // Calculate volume (using bounding box for simplicity)
    const volumeInCubicCm = dimensions.width * dimensions.height * dimensions.depth / 1000;

    // Use cost settings from state
    const materialCostPerCubicCm = costSettings.materialCostPerCubicCm;
    const materialDensityPerCubicCm = costSettings.PLACostPerCubicCm; // Note: This seems to be a misnomer; it should represent density or another factor affecting cost

    // Calculate cost
    const cost = volumeInCubicCm * materialCostPerCubicCm * materialDensityPerCubicCm;

    return cost;
  };

  return (
    <div className="App">
      <header>
        <h1>3D STL Viewer</h1>
        <p>
          {fileName
            ? `Viewing: ${fileName}`
            : "Drag & drop an STL file to view"}
        </p>
      </header>

      <main>
        {!modelUrl ? (
          <FileDropzone onFileLoaded={handleFileLoaded} />
        ) : (
          <div className="viewer-container">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 10]} intensity={1} />
              <ModelViewer url={modelUrl} activeTool={activeTool} setDimensions={setDimensions} />
            </Canvas>

            <ViewerToolbox
              activeTool={activeTool}
              setActiveTool={setActiveTool}
            />

            <button className="reset-button" onClick={() => setModelUrl(null)}>
              Load Another Model
            </button>
          </div>
        )}
      </main>

      <UnitPrice onSettingsChange={handleSettingsChange} />

      {dimensions !== null && (
        <div>
          <h3>Estimated Cost:</h3>
          <p>height: {dimensions.height.toFixed(2)} mm</p>
          <p>width: {dimensions.width.toFixed(2)} mm</p>
          <p>length: {dimensions.depth.toFixed(2)} mm</p>
          <p>Approximately ${estimateCost(dimensions).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

export default App;
