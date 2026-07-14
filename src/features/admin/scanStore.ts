import { useSyncExternalStore } from "react";
import type { OcrResult } from "./matching";

interface ScanState {
  ocr: OcrResult | null;
  scannedAt: number | null;
}

let state: ScanState = { ocr: null, scannedAt: null };
const subs = new Set<() => void>();

function emit() {
  subs.forEach((s) => s());
}

export const scanStore = {
  setScan(ocr: OcrResult) {
    state = { ocr, scannedAt: Date.now() };
    emit();
  },
  clear() {
    state = { ocr: null, scannedAt: null };
    emit();
  },
  get(): ScanState {
    return state;
  },
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => subs.delete(fn);
  },
};

export function useScan(): ScanState {
  return useSyncExternalStore(
    scanStore.subscribe,
    scanStore.get,
    () => ({ ocr: null, scannedAt: null }) as ScanState,
  );
}