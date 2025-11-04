# 🎧 Audio Visualizer

![Screencast_20251020_011808](https://github.com/user-attachments/assets/95598dc1-47b2-4c53-9b28-a9d0271924ef)

A **React-based 3D Audio Visualizer** that transforms sound either from an uploaded file or your microphone—into stunning, real-time visuals using **Three.js** and **React-Three-Fiber (R3F)**.

---
## 🖥️ Live Demo here:
https://sarang-nambiar.github.io/audio-visualizer/

## 🚀 Features

* 🎵 Visualize live microphone input or uploaded audio files
* 🌐 Built with **React**, **Three.js**, and **R3F** for smooth 3D rendering
* 🧠 Uses **Fast Fourier Transform (FFT)** to analyze audio frequencies
* 🌊 Incorporates **Perlin Noise** for organic, fluid mesh animations

> 💡 **Tip:** Make sure GPU acceleration is enabled in your browser for the best experience.

---

## 🧩 How It Works

The visualizer captures audio data and transforms it into the frequency domain using the **Fast Fourier Transform (FFT)**.
From this, it calculates the **average amplitude** and feeds that into **Perlin Noise** functions to smoothly deform a 3D mesh, producing an organic, pulsating visual effect that reacts in real time to sound.

---

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Open the App

Navigate to [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## ⚙️ Technologies Used

* [React](https://react.dev/)
* [Three.js](https://threejs.org/)
* [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
* [Fast Fourier Transform (FFT)](https://en.wikipedia.org/wiki/Fast_Fourier_transform)
* [Perlin Noise](https://rtouti.github.io/graphics/perlin-noise-algorithm)

---

## 🖥️ Requirements

* Modern browser with **WebGL** and **GPU acceleration** enabled
* Node.js and npm installed

---
