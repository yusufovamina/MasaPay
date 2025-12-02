import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import Grid3D from './components/Grid3D';
import './App.css';

function App() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 150);
  }, []);

  return (
    <div className="app">
      <div className="canvas-container">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={70} />
          <Grid3D />
        </Canvas>
      </div>

      <div className="content-overlay">
        <main className="content">
          <h1 className={`title ${isVisible ? 'visible' : ''}`}>
            MasaPay in development
          </h1>
          <p className={`tagline ${isVisible ? 'visible' : ''}`}>
            Coming Soon
          </p>
        </main>

        <footer className={`footer ${isVisible ? 'visible' : ''}`}>
          <div className="footer-content">
            <p className="footer-company">© 2025 "MASAPAY" MMC</p>
            <p className="footer-voen">VÖEN: 1309734061</p>
            <p className="footer-rights">All rights reserved</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
