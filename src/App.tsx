import { Canvas } from '@react-three/fiber';
import './App.css';
import gh_icon from './assets/github-icon.png';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Select, SelectiveBloom } from '@react-three/postprocessing'
import { useRef } from 'react';

// Flow:
// 1. Have a navbar which contains the title and a text below the blob saying click to start audio visualizer(requires mic access)
// 2. Connect the blob to this app
// 3. Add the aforementioned text below the blob

function App() {
  const colorRGB: number[] = [13, 152, 186]
  const lightRef = useRef<THREE.AmbientLight>(undefined!);
  const [r, g, b]: number[] = colorRGB.map(x => x / 255)
  const polygonArgs: [number, number] = [5, 7];
  const geometry: THREE.IcosahedronGeometry = new THREE.IcosahedronGeometry(...polygonArgs);
  const vertices: [number, number, number][] = [];
  const positions: THREE.TypedArray = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    vertices.push([
      positions[i],
      positions[i + 1],
      positions[i + 2]
    ]);
  }
  return (
    <>
      <div className='navbar'>
        <a href='/'>
          <span className='nav-title'>DisShazam</span>
        </a>
        <a href='https://github.com/Sarang-Nambiar/audio-visualizer'>
          <img src={gh_icon} alt='gh-logo' width={50} height={50} />
        </a>
      </div>
      <div className='canvas'>
        <Canvas camera={{ position: [10, 10, 10], near: 2, far: 50, fov: 50 }}>
          <mesh>
            <icosahedronGeometry args={[...polygonArgs]} />
            <meshStandardMaterial wireframe color={[r, g, b]} />
            <ambientLight intensity={5} ref={lightRef} />
            {/* <directionalLight color="0xfff" position={[0, 2, 5]} /> */}
          </mesh>
          {vertices.map((vertex: [number, number, number], idx: number) => {
            return (
              <Select enabled>
                <mesh key={idx} position={vertex}>
                  <sphereGeometry args={[0.1, 32, 32]} />
                  <meshStandardMaterial color={[r, g, b]} />
                </mesh>
              </Select>
            );
          })}
          <OrbitControls enableDamping={true} enableZoom={false} enablePan={false} />
          <EffectComposer>
            <SelectiveBloom
              lights={[lightRef]}
              luminanceThreshold={0}
              intensity={5}
              luminanceSmoothing={0.1}
            />
          </EffectComposer>
        </Canvas>
      </div>
      <p className='label'>Spin the sphere!</p>
    </>
  )
}

export default App
