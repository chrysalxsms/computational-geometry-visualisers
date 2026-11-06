export const themeFor = {
  "Jarvis March": "jarvis",
  "Graham Scan": "graham",
  "Manhattan Skyline": "skyline",
};
export const slugFor = {
  "Jarvis March": "jarvis-march",
  "Graham Scan": "graham-scan",
  "Manhattan Skyline": "manhattan-skyline",
};
export function algorithmFromHash() {
  return Object.keys(slugFor).find(
    (a) => `#${slugFor[a]}` === window.location.hash,
  );
}
