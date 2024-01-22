import { useState, createContext } from "react";

export const HoverContext = createContext();

export function HoverProvider(props) {
  const { children } = props;

  const [user, setUser] = useState("Jesse Hall");

  return (
    <HoverContext.Provider value={[user, setUser]}>
      {children}
    </HoverContext.Provider>
  );
}
