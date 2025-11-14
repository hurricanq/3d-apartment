"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function FPSCamera() {
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());

    // Keyboard states
    const keys = useRef({
        w: false,
        a: false,
        s: false,
        d: false,
        space: false,
    });

    // Listen for keyboard presses
    const handleKey = (e: KeyboardEvent, pressed: boolean) => {
        switch (e.code) {
        case "KeyW":
            keys.current.w = pressed;
            break;
        case "KeyA":
            keys.current.a = pressed;
            break;
        case "KeyS":
            keys.current.s = pressed;
            break;
        case "KeyD":
            keys.current.d = pressed;
            break;
        case "Space":
            keys.current.space = pressed;
            break;
        }
    };

    // Add events once
    if (typeof window !== "undefined") {
        window.addEventListener("keydown", (e) => handleKey(e, true));
        window.addEventListener("keyup", (e) => handleKey(e, false));
    }

    useFrame(({ camera }, delta) => {
        const speed = 5; // walking speed

        // Reset direction
        direction.current.set(0, 0, 0);

        if (keys.current.w) direction.current.z += 1;
        if (keys.current.s) direction.current.z -= 1;
        if (keys.current.a) direction.current.x += 1;
        if (keys.current.d) direction.current.x -= 1;

        direction.current.normalize();

        // Move in the direction relative to camera rotation
        const cam = camera as THREE.PerspectiveCamera;
        const forward = new THREE.Vector3();
        cam.getWorldDirection(forward);

        const sideways = new THREE.Vector3();
        sideways.crossVectors(cam.up, forward).normalize();

        velocity.current.set(
        sideways.x * direction.current.x * speed * delta +
            forward.x * direction.current.z * speed * delta,
        0,
        sideways.z * direction.current.x * speed * delta +
            forward.z * direction.current.z * speed * delta
        );

        camera.position.add(velocity.current);
    });

    return null;
}
