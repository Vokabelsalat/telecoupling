import { useState, createContext } from "react";

export const TooltipContext = createContext();

export function TooltipProvider(props) {
  const { children } = props;
  const [tooltipText, setTooltipText] = useState();
  const [tooltipMode, setTooltipMode] = useState();
  const [tooltipPosition, setTooltipPosition] = useState();
  const [tooltipOptions, setTooltipOptions] = useState();

  const setTooltip = (text, mode, position, options = {}) => {
    setTooltipText(text);
    setTooltipMode(mode);
    setTooltipPosition(position);
    setTooltipOptions(options);
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
        setTooltip,
        tooltipOptions,
        setTooltipOptions
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
