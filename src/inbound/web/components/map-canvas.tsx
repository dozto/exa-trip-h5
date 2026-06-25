import { Chip } from "@heroui/react";
import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef } from "react";
import type { RouteStrategy } from "../../../domains/trip-navigation/route-plan";
import type { TripMapViewModel, ViewLevel } from "../state/state/view-model";
import { MapToolbar } from "./map-toolbar";

const formatDurationLabel = (durationMinutes: number): string => {
  if (durationMinutes < 60) {
    return `${durationMinutes} 分钟`;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (minutes === 0) {
    return `${hours} 小时`;
  }

  return `${hours} 小时 ${minutes} 分钟`;
};

const latenessRiskLabel: Record<"low" | "medium" | "high", string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险"
};

const feasibilityLabel: Record<"feasible" | "tight" | "infeasible", string> = {
  feasible: "衔接可行",
  tight: "衔接紧张",
  infeasible: "衔接不足"
};

const strategyLabel: Record<"fastest" | "comfort" | "cheapest", string> = {
  fastest: "最快",
  comfort: "舒适",
  cheapest: "省钱"
};

type MapCanvasProps = {
  model: TripMapViewModel;
  isLoading: boolean;
  reduceMotion: boolean;
  viewLevel: ViewLevel;
  selectedPlaceId: string | null;
  onSelectPoint: (dayId: string) => void;
  onSelectPlace: (placeId: string) => void;
  onSelectStrategy: (strategy: RouteStrategy) => void;
  onSelectHintActivity: (activityId: string) => void;
};

type MapboxPoint = TripMapViewModel["points"][number] & {
  lat: number;
  lng: number;
};

const routeSourceId = "trip-route-source";
const routeLayerId = "trip-route-layer";

const buildRouteFeature = (coordinates: [number, number][]) => {
  if (coordinates.length < 2) {
    return {
      type: "FeatureCollection",
      features: []
    };
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates
        }
      }
    ]
  };
};

const createMarkerElement = (point: MapboxPoint, reduceMotion: boolean): HTMLButtonElement => {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `mapbox-point ${point.isActive ? "is-active" : ""} ${
    reduceMotion ? "is-reduced-motion" : ""
  }`;
  element.setAttribute("aria-label", `${point.label}，${point.address || "地点"}`);

  const pin = document.createElement("span");
  pin.className = "map-point-pin";
  pin.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "map-point-label";
  label.textContent = point.label;

  element.append(pin, label);
  return element;
};

const updateRouteLayer = (map: mapboxgl.Map, coordinates: [number, number][]): void => {
  const source = map.getSource(routeSourceId) as mapboxgl.GeoJSONSource | undefined;
  const feature = buildRouteFeature(coordinates);

  if (!source) {
    map.addSource(routeSourceId, {
      type: "geojson",
      data: feature
    });
    map.addLayer({
      id: routeLayerId,
      type: "line",
      source: routeSourceId,
      paint: {
        "line-color": "#0f766e",
        "line-width": 4,
        "line-opacity": 0.8
      },
      layout: {
        "line-cap": "round",
        "line-join": "round"
      }
    });
    return;
  }

  source.setData(feature);
};

export const MapCanvas = ({
  model,
  isLoading,
  reduceMotion,
  viewLevel,
  selectedPlaceId,
  onSelectPoint,
  onSelectPlace,
  onSelectStrategy,
  onSelectHintActivity
}: MapCanvasProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const mapboxPoints = useMemo<MapboxPoint[]>(() => {
    return model.points.filter(
      (point): point is MapboxPoint => typeof point.lat === "number" && typeof point.lng === "number"
    );
  }, [model.points]);
  const hintSummary = model.decisionHintSummary;

  useEffect(() => {
    if (!accessToken || !mapContainerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [135.5023, 34.6937],
      zoom: 7,
      attributionControl: false
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
    mapRef.current = map;

    return () => {
      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    for (const marker of markersRef.current) {
      marker.remove();
    }
    markersRef.current = [];

    for (const point of mapboxPoints) {
      const element = createMarkerElement(point, reduceMotion);
      const placeId = point.pointId.split(":")[1] ?? point.pointId;
      element.addEventListener("click", () => {
        if (viewLevel === "overview") {
          onSelectPoint(point.dayId);
          return;
        }
        if (viewLevel === "day") {
          onSelectPlace(placeId);
          return;
        }
        onSelectPlace(placeId);
      });

      const marker = new mapboxgl.Marker({
        element,
        anchor: "bottom"
      })
        .setLngLat([point.lng, point.lat])
        .addTo(map);

      markersRef.current.push(marker);
    }

    if (mapboxPoints.length > 0) {
      const focusPoint =
        viewLevel === "place" && selectedPlaceId
          ? mapboxPoints.find((point) => point.pointId.endsWith(`:${selectedPlaceId}`))
          : null;

      if (focusPoint) {
        map.flyTo({
          center: [focusPoint.lng, focusPoint.lat],
          zoom: 14,
          duration: reduceMotion ? 0 : 700
        });
      } else {
        const bounds = new mapboxgl.LngLatBounds();
        for (const point of mapboxPoints) {
          bounds.extend([point.lng, point.lat]);
        }
        map.fitBounds(bounds, {
          padding: { top: 160, right: 64, bottom: 120, left: 64 },
          duration: reduceMotion ? 0 : 700,
          maxZoom: viewLevel === "overview" ? 9 : 12
        });
      }
    }
  }, [mapboxPoints, onSelectPoint, onSelectPlace, reduceMotion, viewLevel, selectedPlaceId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const applyRoute = () => {
      updateRouteLayer(map, model.routeCoordinates);
    };

    if (map.isStyleLoaded()) {
      applyRoute();
      return;
    }

    map.once("load", applyRoute);
  }, [model.routeCoordinates]);

  const shouldShowTokenHint = !accessToken;

  return (
    <section className="map-background-layer-inner" aria-label="行程地图背景">
      <div className="map-floating-panel">
        <div>
          <p className="map-eyebrow">{model.title}</p>
          <h2>{model.subtitle}</h2>
        </div>
        <div className="map-meta-row">
          <Chip size="sm" variant="flat" color="primary">
            {model.points.length} 个地点
          </Chip>
          <Chip size="sm" variant="flat">
            {model.activeDayId ? "已定位当前日期" : model.viewLevel === "overview" ? "概览模式" : "等待日期选择"}
          </Chip>
          {model.routeSummary ? (
            <>
              <Chip size="sm" variant="flat" color="success">
                预计 {formatDurationLabel(model.routeSummary.durationMinutes)}
              </Chip>
              <Chip size="sm" variant="flat">
                约 {model.routeSummary.distanceKm} km
              </Chip>
              <Chip size="sm" variant="flat" color="secondary">
                策略：{strategyLabel[model.selectedStrategy]}
              </Chip>
            </>
          ) : null}
          {hintSummary ? (
            <>
              {hintSummary.recommendedDepartureTime ? (
                <button
                  type="button"
                  className="map-meta-action"
                  onClick={() => onSelectHintActivity(hintSummary.activityId)}
                  aria-label="跳转到建议出发时间对应活动"
                >
                  <Chip size="sm" variant="flat" color="secondary">
                    建议 {hintSummary.recommendedDepartureTime} 出发
                  </Chip>
                </button>
              ) : null}
              <Chip
                size="sm"
                variant="flat"
                color={
                  hintSummary.latenessRiskLevel === "high"
                    ? "danger"
                    : hintSummary.latenessRiskLevel === "medium"
                      ? "warning"
                      : "success"
                }
              >
                迟到{latenessRiskLabel[hintSummary.latenessRiskLevel]}
              </Chip>
              {hintSummary.feasibility ? (
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    hintSummary.feasibility === "infeasible"
                      ? "danger"
                      : hintSummary.feasibility === "tight"
                        ? "warning"
                        : "success"
                  }
                >
                  {feasibilityLabel[hintSummary.feasibility]}
                </Chip>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="map-toolbar-dock">
        <MapToolbar
          disabled={isLoading || model.points.length === 0 || model.viewLevel === "overview"}
          selectedStrategy={model.selectedStrategy}
          walkOnlyDay={model.walkOnlyDay}
          onSelectStrategy={onSelectStrategy}
        />
      </div>

      <div className="map-stage" role="img" aria-label="行程地图预览">
        <div ref={mapContainerRef} className="mapbox-canvas" />
        {model.points.length === 0 ? (
          <p className="map-empty">暂无地点数据，稍后将自动展示地图点位。</p>
        ) : null}
        {shouldShowTokenHint ? (
          <p className="map-empty map-empty-token">未检测到 Mapbox Token，当前仅显示占位地图容器。</p>
        ) : null}
      </div>

      <div className="map-legend" aria-hidden>
        {model.routeSummary?.isFallback ? (
          <span className="map-legend-note">路线来自缓存 · {new Date(model.routeSummary.updatedAt).toLocaleTimeString()}</span>
        ) : null}
      </div>
    </section>
  );
};
