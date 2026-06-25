import { Button, Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import type { PlaceFocusCardViewModel } from "../state/state/view-model";

type ItineraryPlaceFocusCardProps = {
  model: PlaceFocusCardViewModel | null;
  reduceMotion: boolean;
  onClose: () => void;
};

const formatDurationLabel = (durationMinutes: number): string => {
  if (durationMinutes < 60) {
    return `${durationMinutes} 分钟`;
  }
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return minutes === 0 ? `${hours} 小时` : `${hours} 小时 ${minutes} 分钟`;
};

const riskLabel: Record<"low" | "medium" | "high", string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险"
};

const modeLabel: Record<string, string> = {
  walk: "步行",
  transit: "公交",
  drive: "驾车"
};

const LegRow = ({
  leg,
  direction
}: {
  leg: NonNullable<PlaceFocusCardViewModel["incomingLeg"]>;
  direction: "incoming" | "outgoing";
}) => {
  const title = direction === "incoming" ? `来自 ${leg.fromName}` : `前往 ${leg.toName}`;
  return (
    <article className="location-item">
      <div className="location-item-top">
        <h4>{title}</h4>
        <Chip size="sm" variant="flat">
          {modeLabel[leg.mode ?? "walk"] ?? "未知方式"}
        </Chip>
      </div>
      <div className="location-item-meta">
        <span>预计 {formatDurationLabel(leg.durationMinutes)}</span>
        <span>约 {leg.distanceKm} km</span>
      </div>
    </article>
  );
};

export const ItineraryPlaceFocusCard = ({
  model,
  reduceMotion,
  onClose
}: ItineraryPlaceFocusCardProps) => {
  if (!model) {
    return null;
  }

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="location-card-wrap is-expanded"
    >
      <Card className="location-card" shadow="sm">
        <CardHeader className="location-card-header">
          <div>
            <p className="location-day">景点聚焦</p>
            <h3>{model.name}</h3>
            <p className="location-city">{model.address}</p>
          </div>
          <Button
            size="sm"
            radius="full"
            variant="flat"
            aria-label="关闭景点聚焦"
            onPress={onClose}
            className="map-tool-button"
          >
            关闭
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="location-card-body">
          {model.highlight ? (
            <div className="location-priority-row">
              <p className="location-summary">{model.highlight}</p>
            </div>
          ) : null}

          <section className="location-items">
            {model.incomingLeg ? <LegRow leg={model.incomingLeg} direction="incoming" /> : null}
            {model.outgoingLeg ? <LegRow leg={model.outgoingLeg} direction="outgoing" /> : null}
            {!model.incomingLeg && !model.outgoingLeg ? (
              <p className="location-summary">
                {model.isFirstInDay && model.isLastInDay
                  ? "当日仅有此景点，无需路线衔接。"
                  : model.isFirstInDay
                    ? "起点景点 · 从这里开始当天的行程。"
                    : model.isLastInDay
                      ? "终点景点 · 当天行程到此结束。"
                      : "该景点在路线计算时未关联到相邻地点。"}
              </p>
            ) : null}
          </section>

          {model.eventEstimate ? (
            <>
              <Divider className="location-divider" />
              <section className="location-tips-grid">
                <div>
                  <h4>出发建议</h4>
                  <ul>
                    {model.eventEstimate.recommendedDepartureTime ? (
                      <li>建议 {model.eventEstimate.recommendedDepartureTime} 出发</li>
                    ) : (
                      <li>建议预留弹性出发时间</li>
                    )}
                    <li>迟到{riskLabel[model.eventEstimate.latenessRiskLevel]}</li>
                    <li>缓冲 {model.eventEstimate.bufferMinutes} 分钟</li>
                    <li>通行 {model.eventEstimate.travelMinutes} 分钟</li>
                  </ul>
                </div>
              </section>
            </>
          ) : null}

          <p className="location-city">{model.closeHint}</p>
        </CardBody>
      </Card>
    </motion.div>
  );
};