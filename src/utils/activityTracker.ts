// src/utils/activityTracker.ts
let lastActivity = Date.now();

export const setupActivityListeners = () => {
  const resetTimer = () => (lastActivity = Date.now());

  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keydown', resetTimer);
  window.addEventListener('scroll', resetTimer);
  window.addEventListener('click', resetTimer);
};

export const isUserInactive = (timeoutMs: number) => {
  return Date.now() - lastActivity > timeoutMs;
};
