import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Button, Chip } from "@heroui/react";
import type { TripDateStripViewModel } from "../state/state/view-model";

type ItineraryDateStripProps = {
  model: TripDateStripViewModel;
  isLoading: boolean;
  onSwitchDay: (dayId: string) => void;
};

const mobileQuery = "(max-width: 900px)";

const ChevronIcon = ({ direction }: { direction: "left" | "right" }) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden>
    <path
      d={direction === "left" ? "M11.5 4.5L6 10L11.5 15.5" : "M8.5 4.5L14 10L8.5 15.5"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ItineraryDateStrip = ({
  model,
  isLoading,
  onSwitchDay
}: ItineraryDateStripProps) => {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(mobileQuery).matches;
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const maxVisibleCount = isMobile ? 3 : 5;
  const activeDayId = useMemo(
    () => model.items.find((item) => item.isActive)?.dayId ?? null,
    [model.items]
  );
  const shouldShowArrows = model.items.length > maxVisibleCount;
  const visibleCount = Math.max(1, Math.min(model.items.length, maxVisibleCount));
  const dateStripStyle = {
    "--visible-count": String(visibleCount)
  } as CSSProperties;

  const updateScrollState = useCallback(() => {
    const stripElement = stripRef.current;
    if (!stripElement || !shouldShowArrows) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const maxScrollLeft = stripElement.scrollWidth - stripElement.clientWidth;
    setCanScrollPrev(stripElement.scrollLeft > 2);
    setCanScrollNext(stripElement.scrollLeft < maxScrollLeft - 2);
  }, [shouldShowArrows]);

  const scrollByStep = useCallback(
    (direction: "prev" | "next") => {
      const stripElement = stripRef.current;
      if (!stripElement) {
        return;
      }

      const firstItem = stripElement.querySelector<HTMLElement>(".date-pill");
      const stepBase = firstItem?.offsetWidth ?? 180;
      const stripGap = Number.parseFloat(getComputedStyle(stripElement).columnGap || "0") || 0;
      const step = stepBase + stripGap;
      const delta = direction === "prev" ? -step : step;

      stripElement.scrollBy({ left: delta, behavior: "smooth" });
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(mobileQuery);
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(media.matches);
    media.addEventListener("change", handleMediaChange);
    return () => {
      media.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    const stripElement = stripRef.current;
    if (!stripElement) {
      return;
    }

    if (!shouldShowArrows) {
      stripElement.scrollTo({ left: 0, behavior: "auto" });
      updateScrollState();
      return;
    }

    if (!activeDayId) {
      updateScrollState();
      return;
    }

    const activeElement = stripElement.querySelector<HTMLElement>(`[data-day-id="${activeDayId}"]`);
    if (!activeElement) {
      updateScrollState();
      return;
    }

    const targetLeft = activeElement.offsetLeft - (stripElement.clientWidth - activeElement.clientWidth) / 2;
    const maxScrollLeft = stripElement.scrollWidth - stripElement.clientWidth;
    const clampedTarget = Math.max(0, Math.min(targetLeft, maxScrollLeft));

    stripElement.scrollTo({ left: clampedTarget, behavior: "smooth" });
    const timer = window.setTimeout(updateScrollState, 240);
    return () => {
      window.clearTimeout(timer);
    };
  }, [activeDayId, model.items.length, shouldShowArrows, updateScrollState]);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState, model.items.length, maxVisibleCount]);

  return (
    <section
      className={`date-strip-shell ${shouldShowArrows ? "has-controls" : ""}`}
      style={dateStripStyle}
      aria-label="日期切换"
    >
      {shouldShowArrows ? (
        <Button
          isIconOnly
          size="sm"
          radius="full"
          variant="flat"
          className="date-strip-arrow is-left"
          isDisabled={!canScrollPrev || isLoading}
          aria-label="查看前一天"
          onPress={() => scrollByStep("prev")}
        >
          <span className="date-strip-arrow-icon">
            <ChevronIcon direction="left" />
          </span>
        </Button>
      ) : null}

      <div className="date-strip" ref={stripRef} onScroll={updateScrollState}>
        {model.items.map((item) => (
          <Button
            key={item.dayId}
            className={`date-pill ${item.isActive ? "is-active" : ""}`}
            variant={item.isActive ? "solid" : "flat"}
            color={item.isActive ? "primary" : "default"}
            onPress={() => onSwitchDay(item.dayId)}
            isDisabled={isLoading}
            data-day-id={item.dayId}
          >
            <span className="date-pill-day">{item.dayLabel}</span>
            <span className="date-pill-date">{item.dateLabel}</span>
            <Chip size="sm" variant="flat" className="date-pill-city">
              {item.cityLabel}
            </Chip>
          </Button>
        ))}
      </div>

      {shouldShowArrows ? (
        <Button
          isIconOnly
          size="sm"
          radius="full"
          variant="flat"
          className="date-strip-arrow is-right"
          isDisabled={!canScrollNext || isLoading}
          aria-label="查看后一天"
          onPress={() => scrollByStep("next")}
        >
          <span className="date-strip-arrow-icon">
            <ChevronIcon direction="right" />
          </span>
        </Button>
      ) : null}
    </section>
  );
};
