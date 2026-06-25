import { Card, CardBody } from "@heroui/react";

type ErrorMessageCardProps = {
  message: string | null;
  title?: string;
  tone?: "danger" | "warning";
};

export const ErrorMessageCard = ({
  message,
  title,
  tone = "danger"
}: ErrorMessageCardProps) => {
  if (!message) {
    return null;
  }

  return (
    <Card className={`status-card status-card-${tone}`} shadow="sm">
      <CardBody>
        {title ? <p className="status-card-title">{title}</p> : null}
        <p>{message}</p>
      </CardBody>
    </Card>
  );
};
