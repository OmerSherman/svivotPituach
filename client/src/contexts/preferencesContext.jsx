import { createContext } from "react";

// holds the current display preferences (theme, font size, density)
// and a setter to update them. used by Settings page + Navbar toggle
const preferencesContext = createContext({
    preferences: { theme: "light", fontSize: "medium", density: "normal" },
    setPreferences: function() {}
});

export default preferencesContext;
