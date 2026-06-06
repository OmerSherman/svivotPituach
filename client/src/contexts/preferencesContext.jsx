import { createContext } from "react";

// holds the current display preferences (theme, font size, card density)
// any component that needs to read or change them uses this via useContext
const preferencesContext = createContext({
    preferences: { theme: "light", fontSize: "medium", density: "normal" },
    setPreferences: function() {}
});

export default preferencesContext;
