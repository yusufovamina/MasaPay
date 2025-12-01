import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import Grid3D from './components/Grid3D';
import './App.css';

function App() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setIsVisible(true), 150);
  }, []);

  return (
    <div className="app">
      {/* 3D Canvas Background */}
      <div className="canvas-container">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={70} />
          <Grid3D />
        </Canvas>
      </div>

      {/* Text Content Overlay */}
      <div className="content-overlay">
        <main className="content">
          <h1 className={`title ${isVisible ? 'visible' : ''}`}>
            MasaPay in development
          </h1>
          <p className={`tagline ${isVisible ? 'visible' : ''}`}>
            Coming Soon
          </p>
        </main>
      </div>
    </div>
  );
}

export default App;
