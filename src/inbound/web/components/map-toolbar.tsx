import { Button } from "@heroui/react";

type MapToolbarProps = {
  disabled: boolean;
};

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden>
    <path
      d="M10 3.2L11.8 7.1L16 7.7L13 10.7L13.8 14.8L10 12.7L6.2 14.8L7 10.7L4 7.7L8.2 7.1L10 3.2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="10" cy="10" r="2" fill="currentColor" />
  </svg>
);

const toolbarActions = [
  { id: "search", label: "搜索", Icon: SearchIcon },
  { id: "favorite", label: "收藏", Icon: StarIcon },
  { id: "center", label: "定位", Icon: TargetIcon }
];

export const MapToolbar = ({ disabled }: MapToolbarProps) => {
  return (
    <div className="map-toolbar" role="toolbar" aria-label="地图工具栏">
      {toolbarActions.map((action) => (
        <Button
          key={action.id}
          isIconOnly
          size="sm"
          radius="full"
          variant="flat"
          className="map-tool-button"
          isDisabled={disabled}
          aria-label={action.label}
        >
          <span className="map-tool-icon" aria-hidden>
            <action.Icon />
          </span>
        </Button>
      ))}
    </div>
  );
};
