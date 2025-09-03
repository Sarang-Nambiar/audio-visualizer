import './App.css';
import gh_icon from './assets/github-icon.png';

function App() {

  // Flow:
  // 1. Have a navbar which contains the title and a text below the blob saying click to start audio visualizer(requires mic access)
  // 2. Connect the blob to this app
  // 3. Add the aforementioned text below the blob
  return (
    <>
      <div className='navbar'>
        <a href='/'>
          <span className='nav-title'>Audio Visualizer</span>
        </a>
        <a href='https://github.com/Sarang-Nambiar/audio-visualizer'>
          <img src={gh_icon} alt='gh-logo' width={50} height={50} />
        </a>
      </div>
      <div className='container'>
      </div>
    </>
  )
}

export default App
