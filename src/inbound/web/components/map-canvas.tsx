import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import type { TripMapViewModel } from "../state/state/view-model";
import { MapToolbar } from "./map-toolbar";

type ClusterMeta = {
  pointId: string;
  nearbyCount: number;
  shiftX: number;
  shiftY: number;
};

const clusterDistance = 11;

const buildClusterMeta = (points: TripMapViewModel["points"]): ClusterMeta[] => {
  return points.map((point, pointIndex) => {
    let nearbyCount = 0;
    for (let index = 0; index < points.length; index += 1) {
      if (index === pointIndex) {
        continue;
      }

      const other = points[index];
      const deltaX = point.x - other.x;
      const deltaY = point.y - other.y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance < clusterDistance) {
        nearbyCount += 1;
      }
    }

    const angle = ((pointIndex * 73) % 360) * (Math.PI / 180);
    const shiftStrength = nearbyCount > 0 ? Math.min(nearbyCount * 4, 12) : 0;

    return {
      pointId: point.pointId,
      nearbyCount,
      shiftX: Math.cos(angle) * shiftStrength,
      shiftY: Math.sin(angle) * shiftStrength
    };
  });
};

type MapCanvasProps = {
  model: TripMapViewModel;
  isLoading: boolean;
  reduceMotion: boolean;
  onSelectPoint: (dayId: string) => void;
};

export const MapCanvas = ({
  model,
  isLoading,
  reduceMotion,
  onSelectPoint
}: MapCanvasProps) => {
  const clusterMeta = buildClusterMeta(model.points);
  const clusterMetaById = new Map(clusterMeta.map((meta) => [meta.pointId, meta]));

  return (
    <Card className="map-card" shadow="sm">
      <CardHeader className="map-card-header">
        <div>
          <p className="map-eyebrow">{model.title}</p>
          <h2>{model.subtitle}</h2>
          <div className="map-meta-row">
            <Chip size="sm" variant="flat" color="primary">
              {model.points.length} 个地点
            </Chip>
            <Chip size="sm" variant="flat">
              {model.activeDayId ? "已定位当前日期" : "等待日期选择"}
            </Chip>
          </div>
        </div>
        <MapToolbar disabled={isLoading || model.points.length === 0} />
      </CardHeader>

      <CardBody>
        <div className="map-stage" role="img" aria-label="行程地图预览">
          <div className="map-grid" aria-hidden />
          <div className="map-glow" aria-hidden />
          <div className="map-route" aria-hidden />

          {model.points.length === 0 ? (
            <p className="map-empty">暂无地点数据，稍后将自动展示地图点位。</p>
          ) : (
            model.points.map((point) => {
              const pointCluster = clusterMetaById.get(point.pointId);
              const nearbyCount = pointCluster?.nearbyCount ?? 0;
              const markerStyle = {
                left: `${point.x}%`,
                top: `${point.y}%`,
                marginLeft: `${pointCluster?.shiftX ?? 0}px`,
                marginTop: `${pointCluster?.shiftY ?? 0}px`
              };

              return (
                <motion.button
                  key={point.pointId}
                  type="button"
                  className={`map-point ${point.isActive ? "is-active" : ""} ${
                    nearbyCount > 0 ? "is-clustered" : ""
                  } ${reduceMotion ? "is-reduced-motion" : ""}`}
                  style={markerStyle}
                  onClick={() => onSelectPoint(point.dayId)}
                  initial={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
                  animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.24 }}
                  aria-label={`${point.label}，${point.address || "地点"}`}
                >
                  <span className="map-point-pin" aria-hidden />
                  <span className="map-point-label">{point.label}</span>
                  {nearbyCount > 0 ? (
                    <span className="map-cluster-count" aria-hidden>
                      +{nearbyCount}
                    </span>
                  ) : null}
                </motion.button>
              );
            })
          )}
        </div>

        <div className="map-legend" aria-hidden>
          <span className="legend-dot legend-dot-active" /> 当前日期
          <span className="legend-dot" /> 其他日期
        </div>
      </CardBody>
    </Card>
  );
};
