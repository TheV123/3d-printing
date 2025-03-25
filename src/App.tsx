import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import ModelViewer from "./pages/ModelViewer";
import FileDropzone from "./pages/FileDropzone";
import "./App.css";
import PriceCalculator from "./pages/PriceCalculator";

function App() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
    depth: number;
  } | null>(null);

  const handleFileLoaded = (url: string, name: string) => {
    setModelUrl(url);
    setFileName(name);
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

      <div className="main-container">
        {!modelUrl ? (
          <FileDropzone onFileLoaded={handleFileLoaded} />
        ) : (
          <div className="viewer-container">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 10]} intensity={1} />
              <ModelViewer url={modelUrl} setDimensions={setDimensions} />
            </Canvas>

            {/* <ViewerToolbox
              activeTool={activeTool}
              setActiveTool={setActiveTool}
            /> */}

            <button className="reset-button" onClick={() => setModelUrl(null)}>
              Load Another Model
            </button>
          </div>
        )}

        <PriceCalculator dimensions={dimensions} />
      </div>
    </div>
  );
}

export default App;
