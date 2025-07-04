// Version management for Vantage application
import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
export const APP_NAME = packageJson.name;

// Helper to get version info
export function getVersionInfo() {
  const [major, minor, patch] = APP_VERSION.split('.').map(Number);
  
  return {
    version: APP_VERSION,
    major,
    minor, 
    patch,
    name: APP_NAME,
    displayVersion: `v${APP_VERSION}`,
    buildDate: import.meta.env.VITE_BUILD_DATE || new Date().toISOString().split('T')[0]
  };
}

// Version comparison helpers
export function isVersionNewer(currentVersion: string, compareVersion: string): boolean {
  const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.').map(Number);
  const [compareMajor, compareMinor, comparePatch] = compareVersion.split('.').map(Number);
  
  if (currentMajor !== compareMajor) return currentMajor > compareMajor;
  if (currentMinor !== compareMinor) return currentMinor > compareMinor;
  return currentPatch > comparePatch;
}

export default {
  APP_VERSION,
  APP_NAME,
  getVersionInfo,
  isVersionNewer
};