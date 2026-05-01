import React from "react";

export const ThemeModeContext = React.createContext({
  mode: "light",
  toggleMode: () => {},
});
