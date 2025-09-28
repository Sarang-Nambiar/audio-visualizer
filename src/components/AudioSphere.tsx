import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Select, SelectiveBloom } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import "../stylesheets/AudioSphere.css"
import { toast } from "react-toastify";
import { audio } from "framer-motion/client";

// Problems to fix 
// 4. Is there an elegant way to make the icosahedron geometry pulsate with the spheres. 
// 1. Making the vertex sphere stick to the main sphere vertices when it scales up and down

function AudioSphere() {
    // State Variables
    const [visualize, setVisualize] = useState<boolean>(false);
    const [initMic, setInitMic] = useState<boolean>(false);
    const [vertices, setVertices] = useState<[number, number, number][]>([]);
    const [meshLoaded, setMeshLoaded] = useState<boolean>(false);

    // Geometry properties
    const colorRGB: number[] = [0, 150, 255];
    const lightRef = useRef<THREE.AmbientLight>(undefined!);
    const [r, g, b]: number[] = colorRGB.map(x => x / 255)
    const polygonArgs: [number, number] = [5, 7];

    // Refs (to persist between re renders)
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const micRef = useRef<MediaStreamAudioSourceNode>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationIdRef = useRef<number>(null);
    const vertexSphereRefs = useRef<THREE.Mesh[]>([]);
    const meshRef = useRef<THREE.Mesh>(null);

    const extractVertices = () => {
        const verticesArray: [number, number, number][] = [];
        const positions = meshRef.current?.geometry.attributes.position.array;
        if (positions !== undefined) {
            for (let i = 0; i < positions.length; i += 3) {
                verticesArray.push([
                    positions[i],
                    positions[i + 1],
                    positions[i + 2]
                ]);
            }
        }
        setVertices(verticesArray);
    };

    const updateVertexPositions = () => {
        if (meshRef.current?.geometry && vertices.length > 0) {
            const positions = meshRef.current.geometry.attributes.position.array;
            const currentScale = meshRef.current.scale.x; // Assumes uniform scaling

            vertexSphereRefs.current.forEach((vertexMesh, index) => {
                if (vertexMesh && index * 3 + 2 < positions.length) {
                    vertexMesh.position.set(
                        positions[index * 3] * currentScale,
                        positions[index * 3 + 1] * currentScale,
                        positions[index * 3 + 2] * currentScale
                    );
                }
            });
        }
    };

    // const checkMicPermStatus = () => {
    //     navigator.permissions.query({ name: "microphone" }).then((result) => {
    //         if (result.state === "granted") {
    //             setInitMic(true);
    //         } else {
    //             setInitMic(false);
    //         }
    //     }).catch((err) => {
    //         // Add toast error
    //         toast.error(`Error: Something went wrong - ${err}`);
    //     });
    // }

    const startMic = async () => {
        if (navigator.mediaDevices === undefined) {
            toast.error("Error: Your browser does not support microphone access.");
            return;
        }

        return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            audioContextRef.current = new AudioContext();
            micRef.current = audioContextRef.current?.createMediaStreamSource(stream);
            analyzerRef.current = audioContextRef.current?.createAnalyser();
            analyzerRef.current.fftSize = 256;
            micRef.current.connect(analyzerRef.current);
            const dataLength: (number | undefined) = analyzerRef.current?.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(dataLength!);
            setInitMic(true);
        }).catch((err) => {
            // Put the toast saying that microphone access is needed for this feature to work
            toast.error("Error: Microphone access is needed for this feature to work.")
            throw err;
        })
    }

    const stopMic = () => {
        if (animationIdRef.current) { // Stop the animation
            cancelAnimationFrame(animationIdRef.current);
        }

        // Stopping feed from all media devices/tracks
        if (micRef.current && micRef.current.mediaStream) {
            micRef.current.mediaStream.getTracks().forEach(track => track.stop());
        }

        // Closing the audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        audioContextRef.current = null;
        micRef.current = null;
        analyzerRef.current = null;
        dataArrayRef.current = null;
        animationIdRef.current = null;
        setInitMic(false);
    }

    const startVisualizing = () => {
        if (!analyzerRef.current || !dataArrayRef.current || !meshRef.current) {
            toast.error("Error: Unable to start visualization. Please try again.");
            return;
        }
        analyzerRef.current?.getByteFrequencyData(dataArrayRef.current!);
        const audioData = dataArrayRef.current!;
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i];
        }
        const average = sum / audioData.length;

        // Normalize the amplitude (0-255 range to 0-1 range)
        const normalizedAmp = average / 255;

        // Scale the main sphere to make it pulse with the audio
        const mainScale = 1.1 + (normalizedAmp * 1.5);
        meshRef.current.scale.setScalar(mainScale);

        // Update the vertex sphere positions when the main sphere has scaled.
        updateVertexPositions();

        // Animate vertex spheres based on different frequency ranges
        // vertexSphereRefs.current.forEach((vertexMesh, index) => {
        //     if (!vertexMesh) return;

        //     const ampIndex = Math.floor((index / vertices.length) * audioData.length);
        //     const amp = audioData[ampIndex] || 0;
        //     const normalizedAmp = amp / 255;

        //     // const vertexScale = 0.5 + (normalizedAmp * 2);
        //     // vertexMesh.scale.setScalar(vertexScale);
        // });
        animationIdRef.current = requestAnimationFrame(startVisualizing); // Requesting animation frame for next call
    };

    const resetVisualizer = () => {
        meshRef.current!.scale.setScalar(1); // Reset the scaling of the main sphere 
        updateVertexPositions(); // Reset the vertex sphere positions
    }

    const startVisualizingWithMic = async () => {
        const newVisualize = !visualize; // Toggle between visualization states
        setVisualize(newVisualize);
        if (newVisualize) {
            if (!initMic) {
                await startMic();
            }
            startVisualizing();
        } else {
            stopMic();
            resetVisualizer();
        }
    }

    useEffect(() => {
        // checkMicPermStatus();
        if (meshRef.current) {
            extractVertices();
        }
    }, [meshLoaded]);

    return (
        <div className='canvas'>
            <Canvas camera={{ position: [10, 10, 10], near: 2, far: 50, fov: 50 }}>
                <mesh ref={(el) => {
                    meshRef.current = el;
                    if (el) setMeshLoaded(true);
                }} onClick={startVisualizingWithMic}
                    onPointerEnter={() => document.body.style.cursor = 'pointer'}
                    onPointerLeave={() => document.body.style.cursor = 'auto'}>
                    <icosahedronGeometry args={[...polygonArgs]} />
                    <meshStandardMaterial wireframe color={[r, g, b]} />
                    {/* <directionalLight color="0xfff" position={[0, 2, 5]} /> */}
                </mesh>
                <ambientLight intensity={4} ref={lightRef} />
                {vertices.map((vertex: [number, number, number], idx: number) => {
                    return (
                        <Select enabled key={idx}>
                            <mesh position={vertex} ref={el => vertexSphereRefs.current[idx] = el!}>
                                <sphereGeometry args={[0.1, 32, 32]} />
                                <meshStandardMaterial color={[r, g, b]} />
                            </mesh>
                        </Select>
                    );
                })}
                <OrbitControls enableDamping={true} enableZoom={false} enablePan={false} enableRotate={false} autoRotate />
                <EffectComposer>
                    <SelectiveBloom
                        lights={[lightRef]}
                        luminanceThreshold={0}
                        intensity={4}
                        luminanceSmoothing={0.1}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    )
};

export default AudioSphere;