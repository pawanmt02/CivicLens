// Reactive Light Source Controller (Pointer X/Y & Device Gyroscope tracking)

let isInitialized = false;

export function initReactiveLighting() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  const maxOffset = 8; // Max pixel displacement for physical depth

  const updateLighting = (xRatio, yRatio) => {
    // Invert to simulate light casting from pointer
    const lightX = (xRatio - 0.5) * -2 * maxOffset;
    const lightY = (yRatio - 0.5) * -2 * maxOffset;
    const blurRadius = 12 + Math.abs(lightX) * 0.5;

    document.documentElement.style.setProperty('--light-x', `${lightX.toFixed(2)}px`);
    document.documentElement.style.setProperty('--light-y', `${lightY.toFixed(2)}px`);
    document.documentElement.style.setProperty('--blur-radius', `${blurRadius.toFixed(2)}px`);
  };

  // Pointer / Mouse Tracking (Desktop)
  window.addEventListener('pointermove', (e) => {
    const xRatio = e.clientX / window.innerWidth;
    const yRatio = e.clientY / window.innerHeight;
    requestAnimationFrame(() => updateLighting(xRatio, yRatio));
  }, { passive: true });

  // Gyroscope Tracking (Mobile Device Orientation)
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma === null || e.beta === null) return;
    const clampedX = Math.max(-45, Math.min(45, e.gamma)) / 90 + 0.5;
    const clampedY = Math.max(-45, Math.min(45, e.beta)) / 90 + 0.5;
    requestAnimationFrame(() => updateLighting(clampedX, clampedY));
  }, { passive: true });
}
