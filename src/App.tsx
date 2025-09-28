import './App.css';
import AudioSphere from './components/AudioSphere';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Footer from './components/Footer';


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
      <Navbar />
      <AudioSphere />
      <Footer />
    </div>
  )
}

export default App
