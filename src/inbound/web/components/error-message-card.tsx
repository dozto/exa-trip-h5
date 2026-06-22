import { Card, CardBody } from "@heroui/react";

type ErrorMessageCardProps = {
  message: string | null;
};

export const ErrorMessageCard = ({ message }: ErrorMessageCardProps) => {
  if (!message) {
    return null;
  }

  return (
    <Card className="status-card" shadow="sm">
      <CardBody>
        <p>{message}</p>
      </CardBody>
    </Card>
  );
};
