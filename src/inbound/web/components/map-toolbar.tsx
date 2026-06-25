import { Button } from "@heroui/react";
import type { RouteStrategy } from "../../../domains/trip-navigation/route-plan";

type MapToolbarProps = {
  disabled: boolean;
  selectedStrategy: RouteStrategy;
  walkOnlyDay: boolean;
  onSelectStrategy: (strategy: RouteStrategy) => void;
};

const allActions: Array<{ id: RouteStrategy; label: string }> = [
  { id: "fastest", label: "最快" },
  { id: "comfort", label: "舒适" },
  { id: "cheapest", label: "省钱" }
];

export const MapToolbar = ({
  disabled,
  selectedStrategy,
  walkOnlyDay,
  onSelectStrategy
}: MapToolbarProps) => {
  const actions = walkOnlyDay ? allActions.slice(0, 1) : allActions;

  return (
    <div className="map-toolbar" role="toolbar" aria-label="路线策略切换">
      {actions.map((action) => (
        <Button
          key={action.id}
          size="sm"
          radius="full"
          variant={selectedStrategy === action.id ? "solid" : "flat"}
          color={selectedStrategy === action.id ? "primary" : "default"}
          className="map-tool-button"
          isDisabled={disabled}
          aria-label={action.label}
          aria-pressed={selectedStrategy === action.id}
          onPress={() => onSelectStrategy(action.id)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};