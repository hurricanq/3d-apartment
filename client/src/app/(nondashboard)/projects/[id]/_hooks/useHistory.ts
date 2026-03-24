import { useState, useCallback } from "react";

export function useHistory<T>(initialState: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  // Set new state (push to history)
  const set = useCallback(
    (newState: T) => {
      setPast((prev) => [...prev, present]);
      setPresent(newState);
      setFuture([]); // clear redo stack
    },
    [present],
  );

  // Undo
  const undo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;

      const previous = prev[prev.length - 1];
      setFuture((f) => [present, ...f]);
      setPresent(previous);

      return prev.slice(0, -1);
    });
  }, [present]);

  // Redo
  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;

      const next = prev[0];
      setPast((p) => [...p, present]);
      setPresent(next);

      return prev.slice(1);
    });
  }, [present]);

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
