import { useEffect, useRef, useState } from "react";

interface UseAutosaveOptions<T> {
  value: T;
  onSave: (value: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  value,
  onSave,
  delay = 800,
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValueRef = useRef(value);
  const onSaveRef = useRef(onSave);
  const isFirstRender = useRef(true);

  latestValueRef.current = value;
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      setError(null);

      try {
        await onSaveRef.current(latestValueRef.current);
        setLastSavedAt(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, enabled]);

  return { isSaving, lastSavedAt, error };
}
