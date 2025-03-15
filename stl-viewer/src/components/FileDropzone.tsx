import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileDropzoneProps {
  onFileLoaded: (url: string, name: string) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileLoaded }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (file) {
        // Check if file is STL
        if (
          file.name.toLowerCase().endsWith(".stl") ||
          file.name.toLowerCase().endsWith(".std")
        ) {
          const url = URL.createObjectURL(file);
          onFileLoaded(url, file.name);
        } else {
          alert("Please upload an STL or STD file");
        }
      }
    },
    [onFileLoaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/stl": [".stl", ".STL"],
      "application/octet-stream": [".std", ".STD"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? "active" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="dropzone-content">
        <p>Drag and drop an STL or STD file here, or click to select a file</p>
        <p className="small">Supported formats: .STL, .STD</p>
      </div>
    </div>
  );
};

export default FileDropzone;
