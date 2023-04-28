import { useState, createContext } from "react";

export const TooltipContext = createContext();

export function TooltipProvider(props) {
  const { children } = props;
  const [tooltipText, setTooltipText] = useState();
  const [tooltipMode, setTooltipMode] = useState();
  const [tooltipPosition, setTooltipPosition] = useState();

  const setTooltip = (text, mode, position) => {
    setTooltipText(text);
    setTooltipMode(mode);
    setTooltipPosition(position);
  };

  return (
    <TooltipContext.Provider
      value={{
        tooltipText,
        setTooltipText,
        tooltipPosition,
        setTooltipPosition,
        tooltipMode,
        setTooltipMode,
        setTooltip
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
