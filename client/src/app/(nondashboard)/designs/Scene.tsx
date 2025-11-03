"use client";

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three';

const Scene = () => {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 5;
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mount.appendChild(renderer.domElement);

        // Rendering a cube (Geometry + Material)
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffff
        }); // standard material - need lighting to be visible
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube)

        // Lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 5);
        scene.add(light);

        const animate = () => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
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
