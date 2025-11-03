"use client";

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

const Scene = () => {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        // Texture
        const loader = new THREE.TextureLoader();
        const texture = loader.load("/earth.jpg")

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 5;
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mount.appendChild(renderer.domElement);

        // Rendering a cube (geometry + material)
        const geometry = new THREE.SphereGeometry(1, 64, 32);
        const material = new THREE.MeshBasicMaterial({
            map: texture
        }); // standard material - need lighting to be visible
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube)

        // Orbit controls (allow the camera to orbit around the object)
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true // smooth inertia when stop dragging
        controls.dampingFactor = 0.05
        controls.enablePan = true
        controls.enableZoom = true
        controls.target.set(0, 0, 0)

        const animate = () => {
            controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        // Handle resize screen
        const handleResize = () => {
            if (!mount) return;
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            mount.removeChild(renderer.domElement);
            window.removeEventListener('resize', handleResize);
            controls.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
            }}
        />
    )
}

export default Scene
