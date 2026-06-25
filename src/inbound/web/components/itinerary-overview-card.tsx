import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import type { TripOverviewViewModel } from "../state/state/view-model";

type ItineraryOverviewCardProps = {
  model: TripOverviewViewModel | null;
  reduceMotion: boolean;
};

export const ItineraryOverviewCard = ({ model, reduceMotion }: ItineraryOverviewCardProps) => {
  if (!model) {
    return (
      <Card className="location-card" shadow="sm">
        <CardBody>
          <p className="location-empty">行程加载中，请稍候。</p>
        </CardBody>
      </Card>
    );
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
            <p className="location-day">行程概览</p>
            <h3>{model.title}</h3>
            <p className="location-city">{model.dateSpanLabel}</p>
          </div>
          <Chip color="primary" variant="flat">
            {model.dayCount} 天
          </Chip>
        </CardHeader>
        <Divider />
        <CardBody className="location-card-body">
          <div className="location-priority-row">
            <p className="location-summary">{model.placeCount} 个地点等待探索</p>
          </div>
          <section className="location-tips-grid">
            <div>
              <h4>提示</h4>
              <ul>
                <li>{model.hint}</li>
              </ul>
            </div>
          </section>
        </CardBody>
      </Card>
    </motion.div>
  );
};