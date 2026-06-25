import { Button } from "@heroui/react";
import type { TravelMode } from "../../../domains/trip-navigation/route-plan";

type MapToolbarProps = {
  disabled: boolean;
  selectedMode: TravelMode;
  onSelectMode: (mode: TravelMode) => void;
};

const modeActions: Array<{ id: TravelMode; label: string }> = [
  { id: "walk", label: "步行" },
  { id: "transit", label: "公交" },
  { id: "drive", label: "驾车" }
];

export const MapToolbar = ({ disabled, selectedMode, onSelectMode }: MapToolbarProps) => {
  return (
    <div className="map-toolbar" role="toolbar" aria-label="出行方式切换">
      {modeActions.map((action) => (
        <Button
          key={action.id}
          size="sm"
          radius="full"
          variant={selectedMode === action.id ? "solid" : "flat"}
          color={selectedMode === action.id ? "primary" : "default"}
          className="map-tool-button"
          isDisabled={disabled}
          aria-label={action.label}
          onPress={() => onSelectMode(action.id)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};
