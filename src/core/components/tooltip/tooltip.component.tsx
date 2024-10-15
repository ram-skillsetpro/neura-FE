import { FunctionComponent, ReactNode, useState } from "react";
import "./tooltip.scss";

interface TooltipProps {
  delay?: number;
  direction?: "top" | "left" | "right" | "bottom";
  content: ReactNode;
  children: ReactNode;
}

const Tooltip: FunctionComponent<TooltipProps> = (props) => {
  let timeout: NodeJS.Timeout;
  const [active, setActive] = useState<boolean>(false);

  const showTip = () => {
    timeout = setTimeout(() => {
      setActive(true);
    }, props.delay || 400);
  };

  const hideTip = () => {
    clearInterval(timeout);
    setActive(false);
  };

  return (
    <div
      className="Tooltip-Wrapper"
      // When to show the tooltip
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      role="tooltip"
    >
      {/* Wrapping */}
      {props.children}
      {active && (
        <div className={`Tooltip-Tip ${props.direction || "top"}`}>
          {/* Content */}
          {props.content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
