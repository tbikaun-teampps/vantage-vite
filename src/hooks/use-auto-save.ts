

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseAutoSaveOptions {
  delay?: number;
  onSave: () => Promise<void>;
  enabled?: boolean;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export function useAutoSave<T>(
  data: T,
  { delay = 2000, onSave, enabled = true }: UseAutoSaveOptions
) {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef(data);
  const savePromiseRef = useRef<Promise<void> | null>(null);

  const save = useCallback(async () => {
    if (!enabled) return;

    setState((prev) => {
      if (prev.isSaving) return prev;
      return { ...prev, isSaving: true };
    });

    try {
      savePromiseRef.current = onSave();
      await savePromiseRef.current;

      setState((prev) => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, isSaving: false }));
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to auto-save changes. Please save manually."
      );
    }
  }, [enabled, onSave]);

  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    save();
  }, [save]);

  // Detect changes and schedule auto-save
  useEffect(() => {
    if (!enabled) return;

    const hasChanged =
      JSON.stringify(data) !== JSON.stringify(previousDataRef.current);

    if (hasChanged) {
      previousDataRef.current = data;
      setState((prev) => ({ ...prev, hasUnsavedChanges: true }));

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule new save
      timeoutRef.current = setTimeout(() => {
        save();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    forceSave,
  };
}
