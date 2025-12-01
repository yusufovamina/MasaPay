import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function Grid3D() {
    const gridRef = useRef();
    const [hovered, setHovered] = useState(null);
    const { viewport } = useThree();

    const gridSize = useMemo(() => {
        const aspect = viewport.width / viewport.height;

        const baseX = Math.floor(aspect * 35);
        const baseY = Math.floor(50 / aspect);
        return { x: baseX, y: baseY };
    }, [viewport.width, viewport.height]);

    const cellSize = 0.8;
    const spacing = 1.0;

    // Create grid of cells with individual refs for animation
    const cells = useMemo(() => {
        const temp = [];
        for (let x = 0; x < gridSize.x; x++) {
            for (let y = 0; y < gridSize.y; y++) {
                temp.push({
                    id: `${x}-${y}`,
                    position: [
                        (x - gridSize.x / 2) * spacing,
                        (y - gridSize.y / 2) * spacing,
                        0
                    ],
                    offset: Math.random() * Math.PI * 2,
                    elevation: 0,
                    targetElevation: 0,
                    brightness: 0,
                    targetBrightness: 0,
                    rotation: 0,
                    targetRotation: 0
                });
            }
        }
        return temp;
    }, [gridSize.x, gridSize.y]);

    // Animation loop
    useFrame((state) => {
        if (!gridRef.current) return;

        const time = state.clock.getElapsedTime();

        // Gentle wave animation
        cells.forEach((cell, i) => {
            const mesh = gridRef.current.children[i];
            if (!mesh) return;

            // Smooth interpolation for hover effect (spring-like)
            cell.elevation += (cell.targetElevation - cell.elevation) * 0.15;
            cell.brightness += (cell.targetBrightness - cell.brightness) * 0.15;
            cell.rotation += (cell.targetRotation - cell.rotation) * 0.1;

            // Base wave animation
            const wave = Math.sin(time * 0.5 + cell.offset) * 0.05;

            // Apply elevation
            mesh.position.z = cell.position[2] + wave + cell.elevation;


            mesh.rotation.x = cell.rotation * 0.1;
            mesh.rotation.y = cell.rotation * 0.1;

            const cubeMesh = mesh.children[0];
            if (cubeMesh && cubeMesh.material) {
                const hoverInfluence = cell.brightness / 0.8;
                // #558157 color: R=0.333, G=0.506, B=0.341
                cubeMesh.material.emissive.setRGB(
                    cell.brightness * 0.2 + hoverInfluence * 0.333,
                    cell.brightness * 0.3 + hoverInfluence * 0.506,
                    cell.brightness * 0.2 + hoverInfluence * 0.341
                );
                cubeMesh.material.emissiveIntensity = 0.15 + cell.brightness;
            }

            const edgeMesh = mesh.children[1];
            if (edgeMesh && edgeMesh.material) {
                edgeMesh.material.opacity = 0.5 + cell.brightness * 0.3;
            }
        });
    });

    // Handle mouse move
    const handlePointerMove = (event) => {
        event.stopPropagation();

        // Get intersection point
        const point = event.point;

        // Find closest cell
        let closestCell = null;
        let minDist = Infinity;

        cells.forEach((cell) => {
            const dx = point.x - cell.position[0];
            const dy = point.y - cell.position[1];
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist && dist < spacing * 1.5) {
                minDist = dist;
                closestCell = cell;
            }
        });

        if (closestCell && closestCell.id !== hovered) {
            setHovered(closestCell.id);

            // Apply hover effect to hovered cell and neighbors (ripple)
            cells.forEach((cell) => {
                const dx = cell.position[0] - closestCell.position[0];
                const dy = cell.position[1] - closestCell.position[1];
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < spacing * 2.5) {
                    // Falloff effect with larger radius
                    const influence = Math.max(0, 1 - dist / (spacing * 2.5));
                    cell.targetElevation = influence * 2.0; // Increased from 1.5
                    cell.targetBrightness = influence * 0.8;
                    cell.targetRotation = influence * 0.5; // Add rotation
                } else {
                    cell.targetElevation = 0;
                    cell.targetBrightness = 0;
                    cell.targetRotation = 0;
                }
            });
        }
    };

    const handlePointerLeave = () => {
        setHovered(null);

        cells.forEach((cell) => {
            cell.targetElevation = 0;
            cell.targetBrightness = 0;
            cell.targetRotation = 0;
        });
    };

    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={0.6} />
            <pointLight position={[0, 0, 15]} intensity={0.6} color="#558157" />
            <pointLight position={[-10, -10, 10]} intensity={0.3} color="#ffffff" />

            <group
                ref={gridRef}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
            >
                {cells.map((cell) => (
                    <group key={cell.id} position={cell.position}>
                        {/* Cubic cell mesh */}
                        <mesh>
                            <boxGeometry args={[cellSize, cellSize, cellSize]} />
                            <meshStandardMaterial
                                color="#2a2a2a"
                                metalness={0.95}
                                roughness={0.15}
                                emissive="#ffffff"
                                emissiveIntensity={0.15}
                                envMapIntensity={1.2}
                            />
                        </mesh>

                        <lineSegments>
                            <edgesGeometry args={[new THREE.BoxGeometry(cellSize, cellSize, cellSize)]} />
                            <lineBasicMaterial color="#ffffff" opacity={0.5} transparent />
                        </lineSegments>
                    </group>
                ))}
            </group>

            <mesh position={[0, 0, -2]} visible={false}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
        </>
    );
}
