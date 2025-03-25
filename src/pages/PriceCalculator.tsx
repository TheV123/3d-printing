import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Define the props interface
interface PriceCalculatorProps {
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  } | null;
  setMaterial: (material: string) => void;
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  dimensions,
  setMaterial,
}) => {
  // Calculated values (not directly editable)
  const [volume, setVolume] = useState<number>(0);
  const [surfaceArea, setSurfaceArea] = useState<number>(0);
  const [boundingBox, setBoundingBox] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

  // Editable constants
  const [materialType, setMaterialType] = useState<string>("PLA");
  const [densityMultiplier, setDensityMultiplier] = useState<number>(0.6); // For volume estimation
  const [surfaceFinishFactor, setSurfaceFinishFactor] = useState<number>(0.001); // $/cm²
  const [overheadRate, setOverheadRate] = useState<number>(0.0005); // $/cm³
  const [laborBaseFee, setLaborBaseFee] = useState<number>(5); // $
  const [laborVolumeRate, setLaborVolumeRate] = useState<number>(0.01); // $/cm³
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    setMaterial(materialType);
  }, [materialType, setMaterial]);
  // Material properties
  const [materials, setMaterials] = useState({
    PLA: { multiplier: 1.0, density: 1.24, pricePerGram: 0.03 },
    ABS: { multiplier: 1.2, density: 1.04, pricePerGram: 0.03 },
    PETG: { multiplier: 1.3, density: 1.27, pricePerGram: 0.04 },
    Nylon: { multiplier: 1.8, density: 1.14, pricePerGram: 0.05 },
    Resin: { multiplier: 2.5, density: 1.1, pricePerGram: 0.08 },
  });

  // Update calculated values when dimensions change
  useEffect(() => {
    if (dimensions) {
      // Calculate bounding box volume in cm³ (convert from mm³)
      const boundingBoxVolume =
        (dimensions.width * dimensions.height * dimensions.depth) / 1000;
      setBoundingBox(boundingBoxVolume);

      // Estimate actual volume using the density multiplier
      setVolume(boundingBoxVolume * densityMultiplier);

      // Estimate surface area
      const estimatedSurfaceArea =
        (2 *
          (dimensions.width * dimensions.height +
            dimensions.width * dimensions.depth +
            dimensions.height * dimensions.depth)) /
        100;
      setSurfaceArea(estimatedSurfaceArea);
    }
  }, [dimensions, densityMultiplier]);

  // Calculate price whenever inputs change
  useEffect(() => {
    calculatePrice();
  }, [
    volume,
    surfaceArea,
    boundingBox,
    materialType,
    surfaceFinishFactor,
    overheadRate,
    laborBaseFee,
    laborVolumeRate,
    materials,
    quantity,
  ]);

  // Update material properties
  const updateMaterialProperty = (
    material: string,
    property: string,
    value: number
  ) => {
    setMaterials((prevMaterials) => {
      // Create a completely new object
      const newMaterials = { ...prevMaterials };
      // Create a new object for the specific material
      newMaterials[material as keyof typeof prevMaterials] = {
        ...prevMaterials[material as keyof typeof prevMaterials],
        [property]: value,
      };
      return newMaterials;
    });
  };

  const calculatePrice = () => {
    // Get material properties
    const material = materials[materialType as keyof typeof materials];

    // Calculate material cost
    const materialCost =
      volume * material.density * material.pricePerGram +
      surfaceArea * surfaceFinishFactor;

    // Calculate overhead cost
    const overheadCost = boundingBox * overheadRate * material.multiplier;

    // Calculate labor cost
    const laborCost = laborBaseFee + volume * laborVolumeRate;

    // Calculate total cost for one item
    const singleItemCost = materialCost + overheadCost + laborCost;

    // Multiply by quantity
    const totalCost = singleItemCost * quantity;

    // Update price state
    setPrice(Number(totalCost));
  };

  return (
    <Card className="w-[600px] overflow-auto max-h-[750px]">
      <CardHeader>
        <CardTitle>3D Print Cost Calculator</CardTitle>
        <CardDescription>
          Estimate the price to print your STL file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost Equation */}
        <div className="bg-slate-50 p-3 rounded-md">
          <h3 className="text-lg font-semibold mb-2">
            Cost Estimation Formula
          </h3>
          <div className="text-sm space-y-2 font-mono">
            <p className="font-semibold">
              Total Cost = Material Cost + Labor Cost + Overhead Cost
            </p>
            <p>
              Material Cost = (Volume × Density × Price/g) + (Surface Area ×
              Finish Factor)
            </p>
            <p>Labor Cost = Base Fee + (Volume × Rate)</p>
            <p>Overhead Cost = Bounding Box × Rate × Material Multiplier</p>
          </div>
        </div>

        {/* Model Dimensions */}
        {dimensions && (
          <div className="bg-slate-100 p-3 rounded-md">
            <h3 className="text-md font-semibold mb-2">Model Dimensions</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-sm text-gray-500">Width</p>
                <p className="font-medium">{dimensions.width.toFixed(2)} mm</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Height</p>
                <p className="font-medium">{dimensions.height.toFixed(2)} mm</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Depth</p>
                <p className="font-medium">{dimensions.depth.toFixed(2)} mm</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <p className="text-sm text-gray-500">Bounding Box</p>
                <p className="font-medium">{boundingBox.toFixed(2)} cm³</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Est. Volume</p>
                <p className="font-medium">{volume.toFixed(2)} cm³</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Est. Surface Area</p>
                <p className="font-medium">{surfaceArea.toFixed(2)} cm²</p>
              </div>
            </div>
          </div>
        )}

        <Separator className="my-2" />

        {/* Material Settings */}
        <div>
          <h3 className="text-md font-semibold mb-2">Material Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="materialType">Material Type</Label>
              <Select value={materialType} onValueChange={setMaterialType}>
                <SelectTrigger className="text-white">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLA">PLA</SelectItem>
                  <SelectItem value="ABS">ABS</SelectItem>
                  <SelectItem value="PETG">PETG</SelectItem>
                  <SelectItem value="Nylon">Nylon</SelectItem>
                  <SelectItem value="Resin">Resin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="densityMultiplier">
                Volume Density Multiplier
              </Label>
              <Input
                id="densityMultiplier"
                type="number"
                min="0.1"
                max="1"
                step="0.05"
                value={densityMultiplier}
                onChange={(e) =>
                  setDensityMultiplier(parseFloat(e.target.value) || 0.6)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="materialDensity">Material Density (g/cm³)</Label>
              <Input
                id="materialDensity"
                type="number"
                min="0.1"
                step="0.01"
                value={
                  materials[materialType as keyof typeof materials].density
                }
                onChange={(e) =>
                  updateMaterialProperty(
                    materialType,
                    "density",
                    parseFloat(e.target.value) || 1.0
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialPrice">Price per Gram ($/g)</Label>
              <Input
                id="materialPrice"
                type="number"
                min="0.01"
                step="0.01"
                value={
                  materials[materialType as keyof typeof materials].pricePerGram
                }
                onChange={(e) =>
                  updateMaterialProperty(
                    materialType,
                    "pricePerGram",
                    parseFloat(e.target.value) || 0.03
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialMultiplier">Material Multiplier</Label>
              <Input
                id="materialMultiplier"
                type="number"
                min="0.1"
                step="0.1"
                value={
                  materials[materialType as keyof typeof materials].multiplier
                }
                onChange={(e) =>
                  updateMaterialProperty(
                    materialType,
                    "multiplier",
                    parseFloat(e.target.value) || 1.0
                  )
                }
              />
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Cost Factors */}
        <div>
          <h3 className="text-md font-semibold mb-2">Cost Factors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surfaceFinishFactor">
                Surface Finish Factor ($/cm²)
              </Label>
              <Input
                id="surfaceFinishFactor"
                type="number"
                min="0"
                step="0.0001"
                value={surfaceFinishFactor}
                onChange={(e) =>
                  setSurfaceFinishFactor(parseFloat(e.target.value) || 0.001)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overheadRate">Overhead Rate ($/cm³)</Label>
              <Input
                id="overheadRate"
                type="number"
                min="0"
                step="0.0001"
                value={overheadRate}
                onChange={(e) =>
                  setOverheadRate(parseFloat(e.target.value) || 0.0005)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="laborBaseFee">Labor Base Fee ($)</Label>
              <Input
                id="laborBaseFee"
                type="number"
                min="0"
                step="0.5"
                value={laborBaseFee}
                onChange={(e) =>
                  setLaborBaseFee(parseFloat(e.target.value) || 5)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="laborVolumeRate">Labor Volume Rate ($/cm³)</Label>
              <Input
                id="laborVolumeRate"
                type="number"
                min="0"
                step="0.001"
                value={laborVolumeRate}
                onChange={(e) =>
                  setLaborVolumeRate(parseFloat(e.target.value) || 0.01)
                }
              />
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            className="w-[80px]"
            id="quantity"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>

        {/* Price Display */}
        <div className="bg-slate-100 p-4 rounded-md">
          <Label>Estimated Price:</Label>
          <div className="text-3xl font-bold">${price.toFixed(2)}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          className="text-white"
          variant="outline"
          onClick={() => {
            setDensityMultiplier(0.6);
            setSurfaceFinishFactor(0.001);
            setOverheadRate(0.0005);
            setLaborBaseFee(5);
            setLaborVolumeRate(0.01);
            setQuantity(1);
            setMaterials({
              PLA: { multiplier: 1.0, density: 1.24, pricePerGram: 0.03 },
              ABS: { multiplier: 1.2, density: 1.04, pricePerGram: 0.03 },
              PETG: { multiplier: 1.3, density: 1.27, pricePerGram: 0.04 },
              Nylon: { multiplier: 1.8, density: 1.14, pricePerGram: 0.05 },
              Resin: { multiplier: 2.5, density: 1.1, pricePerGram: 0.08 },
            });
          }}
        >
          Reset Constants
        </Button>
        <Button onClick={calculatePrice}>Calculate</Button>
      </CardFooter>
    </Card>
  );
};

export default PriceCalculator;
