import { useReducedMotion } from "framer-motion";
import { useItineraryPageModel } from "../state/state/itinerary-page-model";
import { ErrorMessageCard } from "../components/error-message-card";
import { ItineraryDateStrip } from "../components/itinerary-date-strip";
import { ItineraryLocationCard } from "../components/itinerary-location-card";
import { MapCanvas } from "../components/map-canvas";

export const ItineraryPage = () => {
  const prefersReducedMotion = useReducedMotion();
  const pageModel = useItineraryPageModel();

  return (
    <div className="itinerary-stage">
      <div className="map-background-layer">
        <MapCanvas
          model={pageModel.mapModel}
          isLoading={pageModel.isLoading}
          onSelectPoint={pageModel.onSelectMapPoint}
          onSelectTravelMode={pageModel.onSelectTravelMode}
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
      </div>

      <div className="itinerary-overlay itinerary-overlay-right">
        <ItineraryLocationCard
          model={pageModel.currentCardModel}
          focusedItemId={pageModel.focusedActivityId}
          onFocusedItemSettled={pageModel.onClearFocusedActivity}
          reduceMotion={Boolean(prefersReducedMotion)}
        />
      </div>

      <div className="itinerary-overlay itinerary-overlay-bottom">
        <ItineraryDateStrip
          model={pageModel.dateStripModel}
          isLoading={pageModel.isLoading}
          onSwitchDay={pageModel.onSwitchDay}
        />
      </div>
    </div>
  );
};
