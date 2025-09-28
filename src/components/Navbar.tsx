import gh_icon from '../assets/github-icon.png';
import '../stylesheets/Navbar.css';

export default function Navbar() {
    return (
        <div className='navbar'>
            <a href='/'>
                <span className='nav-title'>DisShazam</span>
            </a>
            <a href='https://github.com/Sarang-Nambiar/audio-visualizer'>
                <img src={gh_icon} alt='gh-logo' width={50} height={50} />
            </a>
        </div>
    )
}