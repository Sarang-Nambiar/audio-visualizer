import { Canvas } from '@react-three/fiber';
import './App.css';
import gh_icon from './assets/github-icon.png';
import { OrbitControls } from '@react-three/drei';

function App() {

  // Flow:
  // 1. Have a navbar which contains the title and a text below the blob saying click to start audio visualizer(requires mic access)
  // 2. Connect the blob to this app
  // 3. Add the aforementioned text below the blob
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
        <Canvas camera={{position:[10, 10, 10], near:5, far: 50, fov: 50}}>
          <mesh>
              <boxGeometry args={[6, 6, 6]}/>
              <meshStandardMaterial />
              <ambientLight intensity={0.2} />
              <directionalLight color="white" position={[0, 2, 5]} />
          </mesh>
          <OrbitControls enableDamping={true} enableZoom={false}/>
        </Canvas>
      </div>
      <p className='label'>Spin the box!</p>
    </>
  )
}

export default App
