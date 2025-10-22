import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Select, SelectiveBloom } from "@react-three/postprocessing";
import { useContext, useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import "../stylesheets/AudioSphere.css"
import { toast } from "react-toastify";
import { ImprovedNoise } from "../utils/ImprovedNoise";
import { AudioURLContext, VisualizerContext } from "../App";
import type { AudioFileURL, VisualizerState } from "../types/visual-types";

const NOISE_WEIGHTS = {
    "microphone": {
        ampWeight: 0.7,
        nsWeight: 0.6
    },
    "audio_file": {
        ampWeight: 0.4,
        nsWeight: 0.2
    }
}

type AudioType = 'microphone' | 'audio_file';

function AudioSphere() {
    // Shared state variables
    const { visualize, setVisualize }: VisualizerState = useContext(VisualizerContext);
    const { fileURL, setFileURL }: AudioFileURL = useContext(AudioURLContext);

    // State Variables
    const [initMic, setInitMic] = useState<boolean>(false);
    const [vertices, setVertices] = useState<[number, number, number][]>([]);
    const [meshLoaded, setMeshLoaded] = useState<boolean>(false);

    // Geometry properties
    const colorRGB: number[] = [0, 150, 255];
    const lightRef = useRef<THREE.AmbientLight>(undefined!);
    const [r, g, b]: number[] = colorRGB.map(x => x / 255)
    const polygonArgs: [number, number] = [5, 6];
    const SPHERE_RADIUS = polygonArgs[0];
    let verts = undefined;

    // Refs (to persist between re renders)
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const micRef = useRef<MediaStreamAudioSourceNode>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationIdRef = useRef<number>(null);
    const vertexSphereRefs = useRef<THREE.Mesh[]>([]);
    const meshRef = useRef<THREE.Mesh>(null);
    const audioTypeRef = useRef<AudioType>('microphone');
    const noiseRef = useRef<ImprovedNoise>(new ImprovedNoise());
    const originalPositionsRef = useRef<any>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null); // ref to the source node for upload audio
    const clockRef = useRef<THREE.Clock>(new THREE.Clock())

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

    const updateVertexPositions = (normalizedAmp: number) => {
        const time = clockRef.current.getElapsedTime();
        verts = meshRef.current?.geometry.attributes.position;
        if (verts === undefined) return;

        for (let i = 0; i < verts.array.length; i++) {
            const x = originalPositionsRef.current[i * 3];
            const y = originalPositionsRef.current[i * 3 + 1];
            const z = originalPositionsRef.current[i * 3 + 2];

            // Extracting the directional vector
            const originalDistance = SPHERE_RADIUS;
            const dirX = x / originalDistance;
            const dirY = y / originalDistance;
            const dirZ = z / originalDistance;

            const ns = noiseRef.current.noise(x, y, time);

            // ns ranges roughly from -1 to 1
            // Removing all negative values
            const normalizedNoise = ns * 2 - 1;

            // Base scale of 1.0 + audio influence + noise influence
            // noise multiplied with amp to ensure that when the audio coming through is 0, then noise influence is also zero
            // If the audio is feeble, effect of noise is low
            // If audio is loud, then the impact of noise is high 
            const { ampWeight, nsWeight } = NOISE_WEIGHTS[audioTypeRef.current] 
            const scaleFactor = 1.0 + (normalizedAmp * ampWeight) + (normalizedNoise * normalizedAmp * nsWeight);
            const newDistance = originalDistance * scaleFactor;

            verts.setXYZ(
                i,
                dirX * newDistance,
                dirY * newDistance,
                dirZ * newDistance
            );
        }
    }

    const updateMiniSpherePositions = () => {
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

    const startMic = async (): Promise<number> => {
        // Setting Audio Type
        audioTypeRef.current = 'microphone';

        if (navigator.mediaDevices === undefined) {
            toast.error("Error: Your browser does not support microphone access.");
            setVisualize(false); // Resetting to default state 
            return 1;
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
            return 0;
        }).catch(() => {
            // Put the toast saying that microphone access is needed for this feature to work
            toast.error("Error: Microphone access is needed for this feature to work.")
            setVisualize(false); // Resetting to default state
            return 1;
        })
    }

    const stopAudio = () => {
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

        // Stopping any audio coming from the audio file uploaded
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
        }

        audioContextRef.current = null;
        micRef.current = null;
        analyzerRef.current = null;
        dataArrayRef.current = null;
        animationIdRef.current = null;
        sourceRef.current = null;
        setInitMic(false);
        setFileURL('');
    }

    const startVisualizing = () => {
        if (!analyzerRef.current || !dataArrayRef.current || !meshRef.current || (!micRef.current && !sourceRef.current)) {
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

        updateVertexPositions(normalizedAmp); // Update main sphere vertices based on audio

        meshRef.current.geometry.attributes.position.needsUpdate = true; // To update the mesh with the new positions of the vertices

        // Update the vertex sphere positions when the main sphere has scaled.
        updateMiniSpherePositions();

        animationIdRef.current = requestAnimationFrame(startVisualizing); // Requesting animation frame for next call
    };

    const startVisualizingWithMic = async () => {
        const newVisualize = !visualize; // Toggle between visualization states
        if (newVisualize) {
            if (!initMic) {
                const failed = await startMic();
                if (failed) return;
            }
        }
        setVisualize(newVisualize);
    }

    const resetVisualizer = () => {
        if (!meshRef.current || !originalPositionsRef.current) return;

        verts = meshRef.current.geometry.attributes.position;
        for (let i = 0; i < originalPositionsRef.current.length; i++) {
            verts.array[i] = originalPositionsRef.current[i];
        }
        verts.needsUpdate = true;
        updateMiniSpherePositions();
    }

    const stopVisualizing = () => {
        stopAudio();
        resetVisualizer();
    }

    const initAudioSource = async () => {
        // Setting Audio Type
        audioTypeRef.current = 'audio_file';

        const response = await fetch(fileURL);
        const blob = await response.blob();
        const arrayBuffer: ArrayBuffer = await blob.arrayBuffer();

        audioContextRef.current = new AudioContext();
        analyzerRef.current = audioContextRef.current?.createAnalyser();
        analyzerRef.current.fftSize = 256;

        const audioBuffer: AudioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        sourceRef.current = audioContextRef.current.createBufferSource();
        sourceRef.current.buffer = audioBuffer;
        sourceRef.current.connect(analyzerRef.current);

        const dataLength: (number | undefined) = analyzerRef.current?.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(dataLength!);

        analyzerRef.current.connect(audioContextRef.current.destination); // To play the audio

        // Playing audio from file rather than from mic
        if (sourceRef.current && !micRef.current) {
            audioContextRef.current?.resume();
            sourceRef.current.start();
        }
    }

    useEffect(() => {
        if (meshRef.current) {
            extractVertices();
            originalPositionsRef.current = new Float32Array(meshRef.current.geometry.attributes.position.array);
        }
    }, [meshLoaded]);

    useEffect(() => {
        if (visualize) {
            startVisualizing();
        } else {
            stopVisualizing();
        }
    }, [visualize])

    useEffect(() => {
        if (fileURL) {
            initAudioSource().then(() => {
                setVisualize(true);
            }).catch((err) => {
                toast.error(`There was an error: ${err}`);
            });
        }
    }, [fileURL])

    return (
        <div className='canvas'>
            <Canvas camera={{ position: [10, 10, 10], near: 2, far: 50, fov: 50 }}>
                <mesh ref={(el) => {
                    meshRef.current = el;
                    if (el) setMeshLoaded(true);
                }} onClick={startVisualizingWithMic}
                    onPointerEnter={() => document.body.style.cursor = 'pointer'}
                    onPointerLeave={() => document.body.style.cursor = 'auto'}
                >
                    <icosahedronGeometry args={[...polygonArgs]} />
                    <meshStandardMaterial color={[r, g, b]} wireframe />
                    {/* <directionalLight color="0xfff" position={[0, 2, 5]} /> */}
                </mesh>
                <ambientLight intensity={4} ref={lightRef} />
                {vertices.map((vertex: [number, number, number], idx: number) => {
                    return (
                        <Select enabled key={idx}>
                            <mesh position={vertex} ref={el => vertexSphereRefs.current[idx] = el!}>
                                <sphereGeometry args={[0.07, 32, 32]} />
                                <meshStandardMaterial color={[r, g, b]} wireframe />
                            </mesh>
                        </Select>
                    );
                })}
                <OrbitControls
                    enableDamping={true}
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={false}
                    autoRotate
                />
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