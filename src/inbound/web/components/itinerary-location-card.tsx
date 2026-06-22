import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import type { TripCurrentCardViewModel } from "../state/state/view-model";

type ItineraryLocationCardProps = {
  model: TripCurrentCardViewModel | null;
  reduceMotion: boolean;
};

export const ItineraryLocationCard = ({
  model,
  reduceMotion
}: ItineraryLocationCardProps) => {
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
      className="location-card-wrap"
    >
      <Card className="location-card" shadow="sm">
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
              <article key={item.itemId} className="location-item">
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
