export const ADMIN_PASSWORD = "admin"; // Default password as requested

export const isAdminMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("admin_mode") === "true";
};

export const setAdminMode = (value: boolean) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin_mode", value ? "true" : "false");
  // Dispatch a custom event to notify other parts of the app
  window.dispatchEvent(new Event("adminModeChanged"));
};
