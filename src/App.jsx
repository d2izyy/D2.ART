import React, { useState, useEffect, useRef } from 'react';

// Custom CSS for Mielgo-style chromatic aberration, scanlines, and brutalist elements
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
  }

  :root {
    --term-green: #CCFF00;
    --term-bg: #050515; /* Updated to match the dark navy from the blue matrix image */
    --term-dim: #1a2b00;
  }

  body {
    background-color: var(--term-bg);
    color: var(--term-green);
    font-family: 'Share Tech Mono', monospace;
    margin: 0;
    overflow-x: hidden;
    text-transform: uppercase;
  }

  /* CRT Scanline Overlay */
  .scanlines {
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0) 50%,
      rgba(0, 0, 0, 0.2) 50%,
      rgba(0, 0, 0, 0.2)
    );
    background-size: 100% 4px;
    pointer-events: none;
  }

  /* Mielgo Chromatic Aberration Glitch Hover */
  .glitch-hover {
    transition: all 0.1s ease;
    position: relative;
  }
  
  .glitch-hover:hover {
    background-color: var(--term-green);
    color: var(--term-bg);
    text-shadow: 2px 0 red, -2px 0 cyan;
    transform: translate(-2px, 2px);
  }

  /* 1-FRAME GLOBAL GLITCH EFFECTS */
  .global-glitch-transform {
    transform: translateX(5%) scale(1.05);
    opacity: 0.5;
    filter: drop-shadow(5px 0 0 red) drop-shadow(-5px 0 0 cyan);
  }

  .global-glitch-wave {
    filter: url(#wave-warp);
  }

  .global-glitch-block {
    filter: url(#block-glitch);
  }
  
  .heavy-scanlines-flash {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 100, 255, 0.1),
      rgba(0, 100, 255, 0.1) 2px,
      rgba(0, 0, 0, 0.8) 2px,
      rgba(0, 0, 0, 0.8) 8px
    );
    z-index: 9999;
    pointer-events: none;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--term-bg);
    border-left: 1px dashed var(--term-green);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--term-green);
  }

  /* Blinking Cursor */
  .cursor-blink {
    display: inline-block;
    width: 10px;
    height: 1.2em;
    background-color: var(--term-green);
    vertical-align: middle;
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

// --- CANVAS BACKGROUND COMPONENT ---
// Updated to match blue matrix grid from image_9732c6.png
const BackgroundMatrix = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const fps = 10;
    const fpsInterval = 1000 / fps;
    let then = Date.now();
    let grid = [];
    const fontSize = 16;
    let columns = 0;
    let rows = 0;

    // Symbol set from the provided blue matrix images
    const chars = '#=,./:;xX+*_';

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize) + 1;
      rows = Math.floor(canvas.height / fontSize) + 1;
      
      grid = [];
      for (let i = 0; i < columns * rows; i++) {
        grid.push({
          char: chars[Math.floor(Math.random() * chars.length)],
          skipFrames: Math.floor(Math.random() * 5),
        });
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      const now = Date.now();
      const elapsed = now - then;

      if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        // Deep navy/black background
        ctx.fillStyle = 'rgba(5, 5, 21, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Character color: Deep indigo blue
        ctx.fillStyle = 'rgba(40, 60, 180, 0.4)';
        ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

        grid.forEach((cell, i) => {
          if (cell.skipFrames > 0) {
            cell.skipFrames--;
          } else {
            cell.char = chars[Math.floor(Math.random() * chars.length)];
            if (Math.random() > 0.8) {
              cell.skipFrames = Math.floor(Math.random() * 6) + 2;
            }
          }

          const x = (i % columns) * fontSize;
          const y = Math.floor(i / columns) * fontSize + fontSize;
          
          // Electric Blue Highlight (Randomized pop)
          if (Math.random() > 0.98) {
             ctx.fillStyle = '#4D9FFF';
             ctx.fillText(cell.char, x, y);
             ctx.fillStyle = 'rgba(40, 60, 180, 0.4)'; 
          } else {
             ctx.fillText(cell.char, x, y);
          }
        });
      }
    };

    draw();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 0, 
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
};

// --- TYPEWRITER COMPONENT ---
const Typewriter = ({ text, delay = 0, speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    let i = 0;
    let timeout;
    const startTyping = () => {
      setHasStarted(true);
      timeout = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(timeout);
      }, speed);
    };
    const initialDelay = setTimeout(startTyping, delay);
    return () => { clearInterval(timeout); clearTimeout(initialDelay); };
  }, [text, delay, speed]);

  return <>{hasStarted ? displayedText : '\u00A0'}</>;
};

// --- MAIN APPLICATION ---
export default function App() {
  
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('MANIFEST');
  const [bootSequence, setBootSequence] = useState(true);
  const [globalGlitch, setGlobalGlitch] = useState('none'); 
  const [renderKey, setRenderKey] = useState(0); 
  const [isContactModalOpen, setIsContactModalOpen] = useState(false); 
  const glitchTimeoutRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setBootSequence(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const triggerClickGlitchSequence = () => {
    if (glitchTimeoutRef.current) clearTimeout(glitchTimeoutRef.current);
    const frameCount = Math.floor(Math.random() * 5) + 2; 
    let currentFrame = 0;
    const playNextFrame = () => {
      if (currentFrame >= frameCount) { setGlobalGlitch('none'); return; }
      const glitchTypes = ['transform', 'wave', 'block', 'scan', 'none', 'none'];
      setGlobalGlitch(glitchTypes[Math.floor(Math.random() * glitchTypes.length)]);
      currentFrame++;
      glitchTimeoutRef.current = setTimeout(playNextFrame, 50);
    };
    playNextFrame();
  };

  const tabs = [
    { id: 'MANIFEST', label: 'SYS: MANIFEST' },
    { id: 'VIDEO', label: 'ARCHIVE: VIDEO' },
    { id: '3D', label: 'ARCHIVE: 3D' },
    { id: 'PHOTO', label: 'ARCHIVE: PHOTO' },
  ];

  const videoProjects = [
    { id: '4Hx2FbnTab8', title: 'CLIENT_WORK // VIDEO 0001' },
    { id: 'RJkDnmoFhw0', title: 'CLIENT_WORK // VIDEO 0002' },
    { id: 'ec57eDghdvM', title: 'CLIENT_WORK // VIDEO 0003' },
    { id: 'iqM3uvxmU9Y', title: 'CLIENT_WORK // VIDEO 0004' }
  ];

  // Corrected Paths for Vite (Files in public/images are served from /images/)
  // Corrected filenames and extensions based on image_96af7d.png
  const threeDProjects = [
    { id: '0001', title: 'NEVERSLEEP', src: '/images/5.jpg' },
    { id: '0002', title: 'BOOM', src: '/images/3.jpg' },
    { id: '0003', title: 'FLORA', src: '/images/2.jpg' },
    { id: '0004', title: '+Amour 0001', src: '/images/1.png' },
    { id: '0005', title: 'SQUID GAME', src: '/images/4.png' },
    { id: '0006', title: '+Amour 0002', src: '/images/6.png' }
  ];

  if (bootSequence) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', backgroundColor: '#050515', color: '#CCFF00', padding: '1rem', textAlign: 'center' }}>
          <div className="animate-pulse">
            <p className="tracking-widest">ESTABLISHING UPLINK...</p>
            <p className="mt-2 text-xs opacity-50">BYPASSING SECURITY PROTOCOLS [FAILED]</p>
            <p className="mt-2 text-xs opacity-50">REROUTING VIA TAU CETI IV [OK]</p>
            <p className="mt-4 border border-[#CCFF00] p-2 inline-block">AWAITING RUNNER ID</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div 
      style={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}
      className={`${globalGlitch === 'transform' ? 'global-glitch-transform' : ''} ${globalGlitch === 'wave' ? 'global-glitch-wave' : ''} ${globalGlitch === 'block' ? 'global-glitch-block' : ''}`}
    >
      
      {/* SVG Filters for After Effects style distortions */}
      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="wave-warp">
            <feTurbulence type="fractalNoise" baseFrequency="0.0001 0.15" numOctaves="1" result="warp" />
            <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="25" in="SourceGraphic" in2="warp" />
          </filter>
          
          <filter id="block-glitch">
            <feTurbulence type="fractalNoise" baseFrequency="0.0001 0.06" numOctaves="1" result="noise" />
            <feComponentTransfer in="noise" result="blockyNoise">
              <feFuncR type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
              <feFuncG type="discrete" tableValues="0 0.25 0.5 0.75 1"/>
            </feComponentTransfer>
            <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="80" in="SourceGraphic" in2="blockyNoise" />
          </filter>
        </defs>
      </svg>

      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      
      <BackgroundMatrix />
      
      <div className="scanlines" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }} />
      
      {globalGlitch === 'scan' && <div className="heavy-scanlines-flash" />}

      {/* Main UI Container - Horizontally/Vertically Centered */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        
        <div className="w-full max-w-5xl bg-[#030308]/95 backdrop-blur-sm border border-[#CCFF00]" style={{ margin: '0 auto', boxShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
          
          {/* Header Bar */}
          <div className="border-b border-[#CCFF00] p-3 flex justify-between items-center bg-[#CCFF00] text-black">
            <div className="font-bold tracking-widest text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-black block animate-pulse"></span>
              TERMINAL: D2IZY-PORTFOLIO // ACTIVE+
            </div>
            <div className="text-xs opacity-70">
              [V. 2.0.6.7]
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col md:flex-row border-b dashed border-[#CCFF00]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  triggerClickGlitchSequence();
                  setRenderKey(prev => prev + 1);
                }}
                className={`flex-1 p-4 border-b md:border-b-0 md:border-r border-[#CCFF00] border-dashed last:border-none text-sm md:text-base tracking-widest uppercase transition-colors
                  ${activeTab === tab.id ? 'bg-[#CCFF00] text-black font-bold' : 'text-[#CCFF00] glitch-hover'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div key={renderKey} className="p-6 md:p-12 min-h-[500px]">
            
            {/* MANIFEST (About) */}
            {activeTab === 'MANIFEST' && (
              <div className="max-w-4xl space-y-8">
                
                <div className="border-l-[6px] border-[#CCFF00] pl-6 py-1 space-y-3">
                  <div>
                    <span className="bg-[#CCFF00] text-[#030308] text-xl md:text-3xl font-bold tracking-widest px-2 py-1 inline-block">
                      <Typewriter text=">> USER DESIGNATION: ARTIST" delay={0} />
                    </span>
                  </div>
                  <div>
                    <span className="bg-[#8CA800] text-[#030308] text-sm tracking-wider px-2 py-1 font-bold inline-block">
                      <Typewriter text="CLASS: VIDEO EDITOR & 3D ARTIST // STATUS: ACTIVE" delay={200} />
                    </span>
                  </div>
                </div>
                
                <div className="space-y-6 text-sm md:text-base tracking-widest font-bold pt-4">
                  <p className="leading-[2.5]">
                    <span className="bg-[#CCFF00] text-[#030308] px-2 py-1" style={{ WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}>
                      <Typewriter text="I construct visual data. Videography, spatial 3D rendering, and photon-capture. The signal is often noisy. I refine it." delay={400} />
                    </span>
                  </p>
                  
                  <p className="leading-[2.5]">
                    <span className="bg-[#CCFF00] text-[#030308] px-2 py-1" style={{ WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}>
                      <Typewriter text="My aesthetics are heavily influenced by the analog decay of physical media and the sterile, brutalist precision of orbital habitats. Perfection is a flaw. The glitch is the truth." delay={1000} />
                    </span>
                  </p>

                  <div className="border border-[#CCFF00] border-dashed p-6 mt-8 inline-block max-w-2xl">
                    <div className="mb-4">
                      <span className="bg-[#8CA800] text-[#030308] text-xs px-2 py-1 tracking-widest inline-block font-bold">
                        <Typewriter text="SYSTEM WARNING:" delay={1800} />
                      </span>
                    </div>
                    <p className="leading-[2.5]">
                      <span className="bg-[#CCFF00] text-[#030308] px-2 py-1" style={{ WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}>
                        <Typewriter text="All archives are subject to sudden corruption. Proceed with caution." delay={2000} />
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="pt-12 flex items-center">
                  <span className="bg-[#8CA800] text-[#030308] text-xs px-2 py-1 tracking-widest font-bold inline-block">
                    <Typewriter text="END TRANSMISSION" delay={2500} />
                  </span>
                  <span className="cursor-blink ml-3"></span>
                </div>
                
              </div>
            )}

            {/* VIDEO ARCHIVE */}
            {activeTab === 'VIDEO' && (
              <div className="space-y-6">
                <div className="border-l-[6px] border-[#CCFF00] pl-6 py-1 mb-8 inline-block">
                  <span className="bg-[#CCFF00] text-[#030308] text-xl md:text-2xl font-bold tracking-widest px-2 py-1">
                    <Typewriter text=">> EXECUTING: VIDEO.MOV" delay={0} />
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {videoProjects.map((vid, idx) => (
                    <div key={idx} className="flex flex-col border border-[#CCFF00] bg-black/50 p-3 group hover:bg-[#CCFF00]/5 transition-colors">
                      <div className="text-xs mb-3 flex justify-between tracking-widest border-b border-[#CCFF00]/30 pb-2">
                        <span className="bg-[#CCFF00] text-[#030308] px-1 font-bold group-hover:bg-white transition-colors">
                          <Typewriter text={vid.title} delay={200 + idx * 150} />
                        </span>
                        <span className="bg-[#8CA800] text-[#030308] px-1 opacity-90">
                          <Typewriter text={`[${vid.id}]`} delay={200 + idx * 150} />
                        </span>
                      </div>
                      <div className="aspect-video w-full border border-[#CCFF00]/50 relative bg-[#030308]">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full opacity-80 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                          src={`https://www.youtube.com/embed/${vid.id}?controls=1&rel=0&modestbranding=1&start=0`}
                          title={vid.title}
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="mt-2 text-[10px] flex justify-between font-bold">
                        <span className="bg-[#8CA800] text-[#030308] px-1">
                          <Typewriter text="STATUS: ONLINE" delay={400 + idx * 150} />
                        </span>
                        <span className="bg-[#8CA800] text-[#030308] px-1">
                          <Typewriter text="EMBED_PROTOCOL_ACTIVE" delay={400 + idx * 150} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 w-full border border-[#CCFF00] border-dashed group hover:bg-[#CCFF00] transition-colors cursor-pointer">
                  <a href="https://youtube.com/playlist?list=PLBuYn3zljKswVPa5BPVwP0W20NK2QB4AR" target="_blank" rel="noreferrer" className="block w-full p-4 text-center">
                    <span className="font-bold tracking-widest text-[#CCFF00] group-hover:text-[#030308] transition-colors">
                      <Typewriter text=">> ACCESS_EXTENDED_CLIENTLIST" delay={800} />
                    </span>
                  </a>
                </div>

              </div>
            )}

            {/* 3D ARCHIVE */}
            {activeTab === '3D' && (
              <div className="space-y-6">
                <div className="border-l-[6px] border-[#CCFF00] pl-6 py-1 mb-8 inline-block">
                  <span className="bg-[#CCFF00] text-[#030308] text-xl md:text-2xl font-bold tracking-widest px-2 py-1">
                    <Typewriter text=">> EXECUTING: MODEL.FBX" delay={0} />
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {threeDProjects.map((item, idx) => (
                    <div key={idx} className="aspect-square border border-[#CCFF00] p-2 flex flex-col justify-between group hover:border-white transition-colors cursor-pointer relative bg-[#030308]">
                      <div className="w-full h-full border border-dashed border-[#CCFF00]/50 relative overflow-hidden group-hover:border-white/50 mb-2 flex items-center justify-center">
                         <img 
                           src={item.src} 
                           alt={item.title}
                           loading="lazy"
                           className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                           onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400"; }}
                         />
                         <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity bg-[#030308]/40">
                           <span className="bg-[#CCFF00] text-[#030308] px-2 py-1 font-bold text-[10px] tracking-widest text-center shadow-[0_0_10px_rgba(204,255,0,0.5)]">
                             <Typewriter text={item.title} delay={200 + idx * 100} />
                           </span>
                         </div>
                      </div>
                      <div className="mt-2 text-[10px] flex justify-between font-bold">
                        <span className="bg-[#8CA800] text-[#030308] px-1">
                          <Typewriter text={`RENDER_${item.id}`} delay={300 + idx * 100} />
                        </span>
                        <span className="bg-[#8CA800] text-[#030308] px-1">
                          <Typewriter text="[OK]" delay={300 + idx * 100} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHOTO ARCHIVE */}
            {activeTab === 'PHOTO' && (
              <div className="space-y-6">
                <div className="border-l-[6px] border-[#CCFF00] pl-6 py-1 mb-8 inline-block">
                  <span className="bg-[#CCFF00] text-[#030308] text-xl md:text-2xl font-bold tracking-widest px-2 py-1">
                    <Typewriter text=">> EXECUTING: CAPTURE.RAW" delay={0} />
                  </span>
                </div>
                <div className="grid grid-cols-4 grid-rows-3 gap-4 h-[600px]">
                  <div className="col-span-2 row-span-2 border border-[#CCFF00] flex items-center justify-center relative glitch-hover cursor-pointer bg-[#CCFF00]/5">
                    <span className="absolute top-2 left-2 text-[10px] bg-[#CCFF00] text-[#030308] px-1 font-bold">
                      <Typewriter text="MAIN_SUBJECT.RAW" delay={100} />
                    </span>
                    <span className="text-4xl opacity-20">
                      <Typewriter text="X" delay={200} speed={30} />
                    </span>
                  </div>
                  <div className="col-span-2 row-span-1 border border-dashed border-[#CCFF00] flex items-center justify-center cursor-pointer hover:bg-[#CCFF00] hover:text-black transition-colors group">
                     <span className="bg-[#CCFF00] text-[#030308] px-2 py-1 font-bold group-hover:bg-[#030308] group-hover:text-[#CCFF00]">
                       <Typewriter text="FRAGMENT_A" delay={300} />
                     </span>
                  </div>
                  <div className="col-span-1 row-span-2 border border-[#CCFF00] flex items-center justify-center bg-[#CCFF00]/10 cursor-pointer">
                    <span className="rotate-90 text-xs tracking-widest bg-[#CCFF00] text-[#030308] px-1 font-bold">
                      <Typewriter text="VERTICAL_SLICE" delay={400} />
                    </span>
                  </div>
                  <div className="col-span-1 row-span-1 border border-[#CCFF00] border-dashed flex items-center justify-center cursor-pointer">
                    <span className="opacity-80 bg-[#8CA800] text-[#030308] px-2 py-1 font-bold">
                      <Typewriter text="B" delay={500} />
                    </span>
                  </div>
                  <div className="col-span-2 row-span-1 border border-[#CCFF00] flex items-center justify-center cursor-pointer relative group">
                     <span className="text-[10px] bg-[#CCFF00] text-[#030308] px-2 py-1 font-bold group-hover:bg-red-600 transition-colors">
                        <Typewriter text="DATA_CORRUPTED // FRAGMENT_C" delay={600} />
                     </span>
                  </div>
                  
                  <a 
                    href="https://instagram.com/d2izy_" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="col-span-1 row-span-1 border border-dashed border-[#CCFF00] flex items-center justify-center cursor-pointer hover:bg-[#CCFF00] transition-colors group"
                    onClick={triggerClickGlitchSequence}
                  >
                     <span className="bg-[#CCFF00] text-[#030308] px-2 py-1 font-bold group-hover:bg-[#030308] group-hover:text-[#CCFF00] transition-colors text-xs text-center border border-[#CCFF00]">
                       <Typewriter text="VIEW_ALL" delay={700} />
                     </span>
                  </a>

                </div>
              </div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="border-t border-[#CCFF00] p-3 flex justify-between items-center bg-[#CCFF00] text-[#030308] text-xs font-bold">
            <div className="flex gap-4">
              <span onClick={() => { setIsContactModalOpen(true); triggerClickGlitchSequence(); }} className="hover:bg-[#030308] hover:text-[#CCFF00] px-1 cursor-pointer transition-colors">[CONTACT]</span>
              <span onClick={() => { setIsContactModalOpen(true); triggerClickGlitchSequence(); }} className="hover:bg-[#030308] hover:text-[#CCFF00] px-1 cursor-pointer transition-colors">[YOUTUBE]</span>
              <span onClick={() => { setIsContactModalOpen(true); triggerClickGlitchSequence(); }} className="hover:bg-[#030308] hover:text-[#CCFF00] px-1 cursor-pointer transition-colors">[TWITTER]</span>
            </div>
            <div className="opacity-80 hidden md:block">
              SECURE CONNECTION // 4:2:2 ENCRYPTION // 4LT APPROVED
            </div>
          </div>

        </div>
      </div>

      {/* Contact Modal / Socials Directory */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg border border-[#CCFF00] bg-[#030308] shadow-2xl">
            <div className="border-b border-[#CCFF00] bg-[#CCFF00] text-[#030308] p-2 flex justify-between items-center font-bold tracking-widest text-sm">
              <span>&gt;&gt; DIRECTORY: COMMS.DAT</span>
              <button onClick={() => { setIsContactModalOpen(false); triggerClickGlitchSequence(); }} className="hover:bg-[#030308] hover:text-[#CCFF00] px-2 transition-colors cursor-pointer">[X]</button>
            </div>
            <div className="p-6 space-y-4 font-bold tracking-widest text-sm text-[#CCFF00]">
              <a href="https://youtube.com/@d2izy" target="_blank" rel="noreferrer" className="flex justify-between items-center border border-dashed border-[#CCFF00] p-3 hover:bg-[#CCFF00] hover:text-[#030308] transition-colors">
                <span>&gt; YOUTUBE</span>
                <span className="opacity-80">@d2izy</span>
              </a>
              <a href="https://twitter.com/d2izy" target="_blank" rel="noreferrer" className="flex justify-between items-center border border-dashed border-[#CCFF00] p-3 hover:bg-[#CCFF00] hover:text-[#030308] transition-colors">
                <span>&gt; TWITTER</span>
                <span className="opacity-80">@d2izy</span>
              </a>
              <a href="https://instagram.com/d2izy_" target="_blank" rel="noreferrer" className="flex justify-between items-center border border-dashed border-[#CCFF00] p-3 hover:bg-[#CCFF00] hover:text-[#030308] transition-colors">
                <span>&gt; INSTAGRAM</span>
                <span className="opacity-80">@d2izy_</span>
              </a>
              <a href="https://discord.gg/VQWQaZJwrh" target="_blank" rel="noreferrer" className="flex justify-between items-center border border-dashed border-[#CCFF00] p-3 hover:bg-[#CCFF00] hover:text-[#030308] transition-colors">
                <span>&gt; DISCORD_SERVER</span>
                <span className="opacity-80 text-[10px]">discord.gg/VQWQaZJwrh</span>
              </a>
              <a href="mailto:d2izycontact@gmail.com" className="flex justify-between items-center border border-dashed border-[#CCFF00] p-3 hover:bg-[#CCFF00] hover:text-[#030308] transition-colors">
                <span>&gt; COMMS_LINK (EMAIL)</span>
                <span className="opacity-80 text-[10px]">d2izycontact@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}