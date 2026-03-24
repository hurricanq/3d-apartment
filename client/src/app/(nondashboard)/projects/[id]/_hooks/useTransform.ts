import { useCallback, useRef } from "react";
import * as THREE from "three";
import { ModelData } from "../types";

export function useTransform(
  selectedModel: number | null,
  modelRefs: React.MutableRefObject<
    Map<number, React.RefObject<THREE.Group | null>>
  >,
  setModels3D: React.Dispatch<React.SetStateAction<ModelData[]>>,
) {
  const requestRef = useRef<number | null>(null);

  const clampObject = useCallback((obj: THREE.Object3D) => {
    obj.position.x = Math.max(0, Math.min(8, obj.position.x));
    obj.position.y = Math.max(0, Math.min(2.5, obj.position.y));
    obj.position.z = Math.max(0, Math.min(6, obj.position.z));
  }, []);

  const syncModelState = useCallback(
    (obj: THREE.Object3D) => {
      if (selectedModel == null) return;

      setModels3D((prev) =>
        prev.map((m) =>
          m.id === selectedModel
            ? {
                ...m,
                position: [obj.position.x, obj.position.y, obj.position.z],
                rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
                scale: [obj.scale.x, obj.scale.y, obj.scale.z],
              }
            : m,
        ),
      );
    },
    [selectedModel, setModels3D],
  );

  const scheduleSync = useCallback(
    (obj: THREE.Group) => {
      if (requestRef.current) return;

      requestRef.current = requestAnimationFrame(() => {
        syncModelState(obj);
        requestRef.current = null;
      });
    },
    [syncModelState],
  );

  const handleKeyTransform = useCallback(
    (e: KeyboardEvent) => {
      if (selectedModel == null) return;

      const group = modelRefs.current.get(selectedModel)?.current;
      if (!group) return;

      const step = THREE.MathUtils.degToRad(5);

      switch (e.key.toLowerCase()) {
        case "arrowleft":
          group.position.x -= step;
          break;
        case "arrowright":
          group.position.x += step;
          break;
        case "c":
          group.position.y -= step;
          break;
        case "z":
          group.position.y += step;
          break;
        case "arrowup":
          group.position.z -= step;
          break;
        case "arrowdown":
          group.position.z += step;
          break;
        case "a":
          group.rotation.y -= step;
          break;
        case "d":
          group.rotation.y += step;
          break;
        case "m":
          group.scale.multiplyScalar(1.1);
          break;
        case "n":
          group.scale.multiplyScalar(0.9);
          break;
      }

      clampObject(group);
      scheduleSync(group);
    },
    [selectedModel, modelRefs, clampObject, scheduleSync],
  );

  return {
    clampObject,
    syncModelState,
    handleKeyTransform,
  };
}
