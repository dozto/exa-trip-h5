import { useEffect, useRef, useState } from "react";
import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import type { TripCurrentCardViewModel } from "../state/state/view-model";

type ItineraryLocationCardProps = {
  model: TripCurrentCardViewModel | null;
  focusedItemId: string | null;
  onFocusedItemSettled: () => void;
  reduceMotion: boolean;
};

export const ItineraryLocationCard = ({
  model,
  focusedItemId,
  onFocusedItemSettled,
  reduceMotion
}: ItineraryLocationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemRefMap = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!focusedItemId || !model) {
      return;
    }

    setIsExpanded(true);

    const target = itemRefMap.current[focusedItemId];
    if (target) {
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center"
      });
    }

    onFocusedItemSettled();
  }, [focusedItemId, model, onFocusedItemSettled, reduceMotion]);

  if (!model) {
    return (
      <Card className="location-card" shadow="sm">
        <CardBody>
          <p className="location-empty">暂无行程详情，请先选择日期。</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      key={model.dayId}
      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={`location-card-wrap ${isExpanded ? "is-expanded" : "is-collapsed"}`}
    >
      <Card className="location-card" shadow="sm">
        <button
          type="button"
          className="location-sheet-toggle"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "收起行程详情" : "展开行程详情"}
        >
          <span className="location-sheet-handle" aria-hidden />
          <span className="location-sheet-text">{isExpanded ? "收起详情" : "展开详情"}</span>
        </button>

        <CardHeader className="location-card-header">
          <div>
            <p className="location-day">{model.dayLabel}</p>
            <h3>{model.dateLabel}</h3>
            <p className="location-city">{model.cityLabel}</p>
          </div>
          <Chip color="primary" variant="flat">
            {model.primaryLocation}
          </Chip>
        </CardHeader>
        <Divider />
        <CardBody className="location-card-body">
          <div className="location-priority-row">
            <p className="location-summary">{model.summary}</p>
            <p className="location-focus">重点地点: {model.primaryLocation}</p>
          </div>

          <section className="location-items">
            {model.items.map((item, index) => (
              <article
                key={item.itemId}
                className={`location-item ${focusedItemId === item.itemId ? "is-focused" : ""}`}
                ref={(node) => {
                  itemRefMap.current[item.itemId] = node;
                }}
              >
                <div className="location-item-top">
                  <h4>
                    <span className="location-item-index">{index + 1}</span>
                    {item.title}
                  </h4>
                  <Chip size="sm" variant="flat">
                    {item.locationLabel}
                  </Chip>
                </div>
                <p>{item.content}</p>
                <div className="location-item-meta">
                  <span>{item.timeLabel}</span>
                  <span>{item.durationLabel}</span>
                </div>
              </article>
            ))}
          </section>

          {model.legSummaries.length > 0 ? (
            <>
              <Divider className="location-divider" />
              <section className="location-items">
                {model.legSummaries.map((leg) => (
                  <article key={leg.legId} className="location-item">
                    <div className="location-item-top">
                      <h4>{leg.fromName} → {leg.toName}</h4>
                      <Chip size="sm" variant="flat">
                        {{ walk: "步行", transit: "公交", drive: "驾车" }[leg.mode ?? "walk"] ?? leg.mode}
                      </Chip>
                    </div>
                    <div className="location-item-meta">
                      <span>预计 {leg.durationMinutes} 分钟</span>
                      <span>约 {leg.distanceKm} km</span>
                    </div>
                  </article>
                ))}
              </section>
            </>
          ) : null}

          <Divider className="location-divider" />

          <section className="location-tips-grid">
            <div>
              <h4>准备事项</h4>
              <ul>
                {model.preparations.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>出行提示</h4>
              <ul>
                {model.decisionHints.length > 0 ? (
                  model.decisionHints.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))
                ) : (
                  <li>当前日期暂无出行风险提示</li>
                )}
              </ul>
            </div>
            <div>
              <h4>建议</h4>
              <ul>
                {model.suggestions.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        </CardBody>
      </Card>
    </motion.div>
  );
};
