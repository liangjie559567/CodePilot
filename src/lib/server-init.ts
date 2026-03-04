import { codeParseManager } from './code-parse-manager';

let initialized = false;

export function initializeServices(): void {
  if (initialized) return;

  console.log('[Server Init] Initializing Code Parse Service...');
  initialized = true;
  console.log('[Server Init] Code Parse Service ready');
}

export function shutdownServices(): void {
  console.log('[Server Shutdown] Stopping Code Parse Service...');
  codeParseManager.stopAll();
  initialized = false;
}
