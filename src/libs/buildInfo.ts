// Expose build metadata provided at build time via VITE_* env vars.
export const COMMIT_SHA = import.meta.env.VITE_COMMIT_SHA ?? '';
export const BUILD_TIME = import.meta.env.VITE_BUILD_TIME ?? '';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '';
export const REPOSITORY = import.meta.env.VITE_REPOSITORY ?? '';

const buildInfo = {
  commit: COMMIT_SHA,
  buildTime: BUILD_TIME,
  version: APP_VERSION,
  repository: REPOSITORY,
};

export default buildInfo;
