import './App.css';
import gh_icon from './assets/github-icon.png';
import { Button, FileUpload } from '@chakra-ui/react';
import { MdAudioFile } from "react-icons/md";
import AudioSphere from './components/AudioSphere';
import { ToastContainer } from 'react-toastify';

// Flow:
// 1. Have a navbar which contains the title and a text below the blob saying click to start audio visualizer(requires mic access)
// 2. Connect the blob to this app
// 3. Add the aforementioned text below the blob

function App() {
  return (
    <div className='container'>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme="dark"
      />
      <div className='navbar'>
        <a href='/'>
          <span className='nav-title'>DisShazam</span>
        </a>
        <a href='https://github.com/Sarang-Nambiar/audio-visualizer'>
          <img src={gh_icon} alt='gh-logo' width={50} height={50} />
        </a>
      </div>
      <AudioSphere />
      <p className='label'>Click on the sphere to activate your microphone or upload a song of your choice below!</p>
      <FileUpload.Root accept={["audio/mpeg"]} maxFiles={1} maxFileSize={1000000}>
        <FileUpload.HiddenInput />
        <FileUpload.Trigger asChild>
          <Button variant="subtle" size="sm" style={{"margin": "auto"}}>
            <MdAudioFile /> Upload file
          </Button>
        </FileUpload.Trigger>
        <FileUpload.List />
      </FileUpload.Root>
    </div>
  )
}

export default App
