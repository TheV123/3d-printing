import React, { useEffect, useState, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { Center } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  url: string;
  activeTool: string;
  setDimensions: (dimensions: { width: number; height: number; depth: number }) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ url, activeTool, setDimensions }) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { scene, gl, camera } = useThree();

  const modelRef = useRef<THREE.Mesh>(null);
  const modelGroupRef = useRef<THREE.Group>(null);

  const controlsRef = useRef({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    zoomLevel: 5,
    modelCenter: new THREE.Vector3(),
    cameraTarget: new THREE.Vector3(),
  });

  useEffect(() => {
    setIsLoading(true);
    const loader = new STLLoader();

    loader.load(
      url,
      (loadedGeometry) => {
        loadedGeometry.computeBoundingBox();

        if (loadedGeometry.boundingBox) {
          const box = loadedGeometry.boundingBox;
          const size = box.getSize(new THREE.Vector3());
          const sizeLength = size.length();

          const dimensions = {
            width: size.x,
            height: size.y,
            depth: size.z
          };
          setDimensions(dimensions)
          

          controlsRef.current.modelCenter = box.getCenter(new THREE.Vector3());

          if (camera instanceof THREE.PerspectiveCamera) {
            camera.position.set(0, 0, sizeLength * 2);
            camera.near = sizeLength / 100;
            camera.far = sizeLength * 100;
            controlsRef.current.zoomLevel = sizeLength * 2;
            camera.updateProjectionMatrix();
          }
        }

        setGeometry(loadedGeometry);
        setIsLoading(false);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error happened while loading the STL file:", error);
        setIsLoading(false);
      }
    );

    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, [url, camera]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();

      controlsRef.current.isDragging = true;
      controlsRef.current.previousMousePosition = {
        x: e.clientX,
        y: e.clientY,
      };

      if (activeTool === "zoomIn") {
        handleZoom(-1);
      } else if (activeTool === "zoomOut") {
        handleZoom(1);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!controlsRef.current.isDragging) return;

      const deltaMove = {
        x: e.clientX - controlsRef.current.previousMousePosition.x,
        y: e.clientY - controlsRef.current.previousMousePosition.y,
      };

      const isAltPressed = e.altKey;
      const isShiftPressed = e.shiftKey;

      if ((activeTool === "rotate" || isAltPressed) && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += deltaMove.x * 0.01;
        modelGroupRef.current.rotation.x += deltaMove.y * 0.01;
      } else if (
        (activeTool === "pan" || isShiftPressed) &&
        modelGroupRef.current
      ) {
        const aspectRatio = canvas.width / canvas.height;
        const panSpeed = 0.01;
        const distance = controlsRef.current.zoomLevel;

        const panX = (deltaMove.x * panSpeed * distance) / 10;
        const panY = (deltaMove.y * panSpeed * distance) / 10 / aspectRatio;

        modelGroupRef.current.position.x += panX;
        modelGroupRef.current.position.y -= panY;
      }

      controlsRef.current.previousMousePosition = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleMouseUp = () => {
      controlsRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      handleZoom(delta);
    };

    const handleZoom = (delta: number) => {
      if (camera instanceof THREE.PerspectiveCamera) {
        const zoomSpeed = 0.1;
        const distance = controlsRef.current.zoomLevel;

        controlsRef.current.zoomLevel += delta * distance * zoomSpeed;
        controlsRef.current.zoomLevel = Math.max(
          0.1,
          Math.min(controlsRef.current.zoomLevel, 1000)
        );

        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);

        const target = new THREE.Vector3().copy(
          controlsRef.current.modelCenter
        );
        camera.position
          .copy(target)
          .addScaledVector(dir, -controlsRef.current.zoomLevel);

        camera.updateProjectionMatrix();
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    const toolCursor =
      tools.find((t) => t.id === activeTool)?.cursor || "default";
    canvas.style.cursor = toolCursor;

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [gl, camera, activeTool]);

  const tools = [
    {
      id: "rotate",
      cursor:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 4.5V4a2 2 0 0 0-4 0v3.5'/%3E%3Cpath d='M5.5 7h8'/%3E%3Cpath d='M7 19.5V20a2 2 0 0 0 4 0v-3.5'/%3E%3Cpath d='M18.5 17h-8'/%3E%3Cpath d='M18.5 7h2.5a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2h-6'/%3E%3Cpath d='M5.5 17h-2.5a2 2 0 0 1-2-2v-9.5a2 2 0 0 1 2-2h6'/%3E%3C/svg%3E\") 12 12, auto",
    },
    {
      id: "pan",
      cursor:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 9l-3 3 3 3'/%3E%3Cpath d='M9 5l3-3 3 3'/%3E%3Cpath d='M15 19l-3 3-3-3'/%3E%3Cpath d='M19 9l3 3-3 3'/%3E%3Cpath d='M2 12h20'/%3E%3Cpath d='M12 2v20'/%3E%3C/svg%3E\") 12 12, move",
    },
    {
      id: "zoomIn",
      cursor: "zoom-in",
    },
    {
      id: "zoomOut",
      cursor: "zoom-out",
    },
  ];

  if (!geometry) {
    return null;
  }

  return (
    <group ref={modelGroupRef}>
      <Center>
        <mesh ref={modelRef} geometry={geometry}>
          <meshStandardMaterial color="gray" />
        </mesh>
      </Center>
    </group>
  );
};

export default ModelViewer;
