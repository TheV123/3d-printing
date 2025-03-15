import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import ModelViewer from "./components/ModelViewer";
import FileDropzone from "./components/FileDropzone";
import ViewerToolbox from "./components/ViewerToolbox";
import "./App.css";

function App() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [activeTool, setActiveTool] = useState<string>("rotate");

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

      <main>
        {!modelUrl ? (
          <FileDropzone onFileLoaded={handleFileLoaded} />
        ) : (
          <div className="viewer-container">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 10]} intensity={1} />
              <ModelViewer url={modelUrl} activeTool={activeTool} />
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
    </div>
  );
}

export default App;
