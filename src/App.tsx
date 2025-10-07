import './App.css';
import AudioSphere from './components/AudioSphere';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { createContext, useState } from 'react';
import type { AudioFileURL, VisualizerState } from './types/visual-types';

const AudioURLContext = createContext<AudioFileURL>({
  fileURL: '',
  setFileURL: () => { },
});

const VisualizerContext = createContext<VisualizerState>({
  visualize: false,
  setVisualize: () => { },
})

function App() {
  const [fileURL, setFileURL] = useState<string>('');
  const [visualize, setVisualize] = useState<boolean>(false);
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
      <Navbar />
      <VisualizerContext.Provider value={{ visualize, setVisualize }}>
        <AudioURLContext.Provider value={{ fileURL, setFileURL }}>
          <AudioSphere />
          <Footer />
        </AudioURLContext.Provider>

      </VisualizerContext.Provider>
    </div>
  )
}

export { VisualizerContext, AudioURLContext, type AudioFileURL, type VisualizerState };
export default App;
