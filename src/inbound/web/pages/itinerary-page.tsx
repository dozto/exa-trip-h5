import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { useItineraryPageModel } from "../state/state/itinerary-page-model";
import { ErrorMessageCard } from "../components/error-message-card";
import { ItineraryDateStrip } from "../components/itinerary-date-strip";
import { ItineraryLocationCard } from "../components/itinerary-location-card";
import { ItineraryOverviewCard } from "../components/itinerary-overview-card";
import { ItineraryPlaceFocusCard } from "../components/itinerary-place-focus-card";
import { MapCanvas } from "../components/map-canvas";

export const ItineraryPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const pageModel = useItineraryPageModel();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      pageModel.onViewEscape();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pageModel]);

  return (
    <div className="itinerary-stage">
      <div className="map-background-layer">
        <MapCanvas
          model={pageModel.mapModel}
          isLoading={pageModel.isLoading}
          viewLevel={pageModel.viewLevel}
          selectedPlaceId={pageModel.selectedPlaceId}
          onSelectPoint={pageModel.onSelectMapPoint}
          onSelectPlace={pageModel.onSelectPlace}
          onSelectStrategy={pageModel.onSelectStrategy}
          onSelectHintActivity={pageModel.onSelectHintActivity}
          reduceMotion={Boolean(prefersReducedMotion)}
        />
      </div>

      <div className="itinerary-overlay itinerary-overlay-top">
        <header className="map-header">
          <p className="map-header-eyebrow">Trip View</p>
          <h1>{pageModel.headerModel.title}</h1>
          <p>{pageModel.headerModel.subtitle}</p>
        </header>
      </div>

      <div className="itinerary-overlay itinerary-overlay-status">
        <ErrorMessageCard message={pageModel.errorMessage} />
        {pageModel.viewLevel !== "overview" ? (
          <>
            <ErrorMessageCard
              message={pageModel.navigationPlanWarning}
              title="路线提示"
              tone="warning"
            />
            <ErrorMessageCard
              message={pageModel.decisionHintsWarning}
              title="预估提示"
              tone="warning"
            />
          </>
        ) : null}
      </div>

      <div className="itinerary-overlay itinerary-overlay-right">
        {pageModel.viewLevel === "place" ? (
          <ItineraryPlaceFocusCard
            model={pageModel.placeFocusCardModel}
            reduceMotion={Boolean(prefersReducedMotion)}
            onClose={pageModel.onClosePlaceFocus}
          />
        ) : null}
        {pageModel.viewLevel === "day" ? (
          <ItineraryLocationCard
            model={pageModel.currentCardModel}
            focusedItemId={pageModel.focusedActivityId}
            onFocusedItemSettled={pageModel.onClearFocusedActivity}
            reduceMotion={Boolean(prefersReducedMotion)}
          />
        ) : null}
        {pageModel.viewLevel === "overview" ? (
          <ItineraryOverviewCard
            model={pageModel.overviewModel}
            reduceMotion={Boolean(prefersReducedMotion)}
          />
        ) : null}
      </div>

      <div className="itinerary-overlay itinerary-overlay-bottom">
        {pageModel.viewLevel !== "overview" ? (
          <ItineraryDateStrip
            model={pageModel.dateStripModel}
            isLoading={pageModel.isLoading}
            onSwitchDay={pageModel.onSwitchDay}
          />
        ) : null}
      </div>
    </div>
  );
};