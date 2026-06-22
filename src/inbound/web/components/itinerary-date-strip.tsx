import { Button, Chip } from "@heroui/react";
import type { TripDateStripViewModel } from "../state/state/view-model";

type ItineraryDateStripProps = {
  model: TripDateStripViewModel;
  isLoading: boolean;
  onSwitchDay: (dayId: string) => void;
};

export const ItineraryDateStrip = ({
  model,
  isLoading,
  onSwitchDay
}: ItineraryDateStripProps) => {
  return (
    <section className="date-strip" aria-label="日期切换">
      {model.items.map((item) => (
        <Button
          key={item.dayId}
          className={`date-pill ${item.isActive ? "is-active" : ""}`}
          variant={item.isActive ? "solid" : "flat"}
          color={item.isActive ? "primary" : "default"}
          onPress={() => onSwitchDay(item.dayId)}
          isDisabled={isLoading}
        >
          <span className="date-pill-day">{item.dayLabel}</span>
          <span className="date-pill-date">{item.dateLabel}</span>
          <Chip size="sm" variant="flat" className="date-pill-city">
            {item.cityLabel}
          </Chip>
        </Button>
      ))}
    </section>
  );
};
