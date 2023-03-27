import { useState, createContext } from "react";

export const TooltipContext = createContext();

export function TooltipProvider(props) {
  const { children } = props;
  const [tooltipText, setTooltipText] = useState();
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const setTooltip = (text, position) => {
    setTooltipText(text);
    setTooltipPosition(position);
  };

  return (
    <TooltipContext.Provider
      value={{
        tooltipText,
        setTooltipText,
        tooltipPosition,
        setTooltipPosition,
        setTooltip
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
