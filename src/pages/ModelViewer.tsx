import React, { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three-stdlib";

interface ModelViewerProps {
  url: string;
  setDimensions: (dimensions: {
    width: number;
    height: number;
    depth: number;
  }) => void;
  material: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  url,
  setDimensions,
  material,
}) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const modelGroupRef = useRef<THREE.Group>(null);

  const getMaterialProperties = (material: string) => {
    switch (material) {
      case "PLA":
        return { color: "#FFFAFA", roughness: 0.7, metalness: 0.1 };
      case "ABS":
        return { color: "#F0E68C", roughness: 0.5, metalness: 0.2 };
      case "PETG":
        return { color: "#87CEEB", roughness: 0.4, metalness: 0.3 };
      case "Nylon":
        return { color: "#FFFFFF", roughness: 0.3, metalness: 0.4 };
      case "Resin":
        return { color: "#FFD700", roughness: 0.2, metalness: 0.6 };
      default:
        return { color: "#cccccc", roughness: 0.5, metalness: 0.5 };
    }
  };

  const materialProps = getMaterialProperties(material);
  useFrame(() => {
    if (controlsRef.current?.enabled) {
      controlsRef.current.update();
    }
  });

  useEffect(() => {
    const loader = new STLLoader();
    loader.load(
      url,
      (geometry) => {
        geometry.computeBoundingSphere();
        geometry.center();
        const box = new THREE.Box3().setFromBufferAttribute(
          geometry.attributes.position as THREE.BufferAttribute
        );

        if (box) {
          const size = box.getSize(new THREE.Vector3());
          setDimensions({ width: size.x, height: size.y, depth: size.z });
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const cameraDistance = maxDim * 2;

          if (controlsRef.current) {
            controlsRef.current.target.copy(center);
            controlsRef.current.maxDistance = maxDim * 5;
            controlsRef.current.update();
          }

          camera.position
            .copy(center)
            .add(new THREE.Vector3(0, 0, cameraDistance));
          camera.lookAt(center);
          camera.near = maxDim / 100;
          camera.far = maxDim * 100;
          camera.updateProjectionMatrix();
        }
        setGeometry(geometry);
      },
      undefined,
      (error) => console.error("STL loading error:", error)
    );

    return () => geometry?.dispose();
  }, [url]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.15}
        rotateSpeed={0.4}
        zoomSpeed={0.8}
        panSpeed={0.5}
        minDistance={0.1}
        screenSpacePanning={false}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />

      <group ref={modelGroupRef}>
        {geometry && (
          <Center>
            <mesh geometry={geometry}>
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </Center>
        )}
      </group>

      <perspectiveCamera
        fov={45}
        aspect={gl.domElement.width / gl.domElement.height}
        near={0.01}
        far={100000}
      />
    </>
  );
};

export default ModelViewer;
