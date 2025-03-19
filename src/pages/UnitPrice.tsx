import React, { useState } from "react";

interface UnitPriceProps {
  onSettingsChange: (settings: {
    materialCostPerCubicCm: number;
    PLACostPerCubicCm: number;
  }) => void;
}

const UnitPrice = ({ onSettingsChange }: UnitPriceProps) => {
  const [materialCostPerCubicCm, setMaterialCostPerCubicCm] = useState<number>(0.05); // Default cost per cubic cm
  const [PLACostPerCubicCm, setPLACostPerCubicCm] = useState<number>(1.25);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (e.target.name === "materialCost") {
      setMaterialCostPerCubicCm(value);
    } else if (e.target.name === "PLACost") {
      setPLACostPerCubicCm(value);
    }
    onSettingsChange({
      materialCostPerCubicCm,
      PLACostPerCubicCm,
    });
  };

  return (
    <div>
      <h3>Cost Settings</h3>
      <form>
        <label>
          Material Cost per Cubic Centimeter (USD):
          <input
            type="number"
            step="0.01"
            name="materialCost"
            value={materialCostPerCubicCm}
            onChange={handleSettingsChange}
          />
        </label>
        <label>
          PLA Cost per Cubic Centimeter (USD):
          <input
            type="number"
            step="0.01"
            value={PLACostPerCubicCm}
            name="PLACost"
            onChange={handleSettingsChange}
          />
        </label>
        {/* Add other input fields for additional cost variables here */}
      </form>
    </div>
  );
};

export default UnitPrice;
