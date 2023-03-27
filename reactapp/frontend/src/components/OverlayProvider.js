import { useState, createContext } from "react";

export const OverlayContext = createContext();

export function OverlayProvider(props) {
  const { children } = props;
  const [overlay, setOverlay] = useState();

  return (
    <OverlayContext.Provider value={[overlay, setOverlay]}>
      {children}
    </OverlayContext.Provider>
  );
}
