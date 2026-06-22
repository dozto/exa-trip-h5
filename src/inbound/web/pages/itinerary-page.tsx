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
    <div className="page-shell">
      <header className="map-header">
        <p className="map-header-eyebrow">Trip View</p>
        <h1>{pageModel.headerModel.title}</h1>
        <p>{pageModel.headerModel.subtitle}</p>
      </header>

      <ItineraryDateStrip
        model={pageModel.dateStripModel}
        isLoading={pageModel.isLoading}
        onSwitchDay={pageModel.onSwitchDay}
      />

      <ErrorMessageCard message={pageModel.errorMessage} />

      <section className="map-layout">
        <div className="map-stage-stack">
          <MapCanvas
            model={pageModel.mapModel}
            isLoading={pageModel.isLoading}
            onSelectPoint={pageModel.onSelectMapPoint}
            reduceMotion={Boolean(prefersReducedMotion)}
          />

          <div className="map-overlay-card">
            <ItineraryLocationCard
              model={pageModel.currentCardModel}
              reduceMotion={Boolean(prefersReducedMotion)}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
