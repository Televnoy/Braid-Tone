import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Save, 
  RotateCcw, 
  X, 
  Bookmark, 
  ChevronRight, 
  FlaskConical, 
  ChevronLeft,
  Camera,
  Palette
} from 'lucide-react';

const Logo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="120" fill="black"/>
    <path d="M180 150C180 150 220 180 220 256C220 332 180 362 180 362" stroke="white" strokeWidth="40" strokeLinecap="round"/>
    <path d="M256 150C256 150 296 180 296 256C296 332 256 362 256 362" stroke="white" strokeWidth="40" strokeLinecap="round" opacity="0.7"/>
    <path d="M332 150C332 150 372 180 372 256C372 332 332 362 332 362" stroke="white" strokeWidth="40" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

const App = () => {
  const [baseColors, setBaseColors] = useState([
    { id: '1', name: '1', desc: 'Глубокий черный', hex: '#000000' },
    { id: '1B', name: '1B', desc: 'Черный натуральный (мягкий)', hex: '#1A1714' },
    { id: '2', name: '2', desc: 'Темно-коричневый (горький шоколад)', hex: '#2B1E16' },
    { id: '3', name: '3', desc: 'Темный шатен', hex: '#36281F' },
    { id: '4', name: '4', desc: 'Темный шоколад', hex: '#3B2B23' },
    { id: '6', name: '6', desc: 'Каштановый шоколад', hex: '#4E342E' },
    { id: '8', name: '8', desc: 'Темно-русый теплый', hex: '#6D4C41' },
    { id: '9', name: '9', desc: 'Светло-коричневый', hex: '#7B5C41' },
    { id: '10', name: '10', desc: 'Русый (классика)', hex: '#A68B67' },
    { id: '18N', name: '18N', desc: 'Русый нейтральный (холодноватый)', hex: '#8B7D6B' },
    { id: '19', name: '19', desc: 'Натурально-русый', hex: '#B59A7A' },
    { id: '22', name: '22', desc: 'Пепельный блондин', hex: '#D2B48C' },
    { id: '24', name: '24', desc: 'Пшеничный блондин', hex: '#D6B87D' },
    { id: '27', name: '27', desc: 'Медовый блонд', hex: '#C68E3D' },
    { id: '30', name: '30', desc: 'Светло-каштановый', hex: '#8B4513' },
    { id: '33', name: '33', desc: 'Темный махагон (коньячный)', hex: '#4B211C' },
    { id: '60', name: '60', desc: 'Молочный (слоновая кость)', hex: '#FAF9F6' },
    { id: '87', name: '87', desc: 'Желтый блонд', hex: '#F0E68C' },
    { id: '101', name: '101', desc: 'Пепел (серебристо-серый)', hex: '#C1C5C9' },
    { id: '135S', name: '135S', desc: 'Красно-рыжий', hex: '#913129' },
    { id: '144', name: '144', desc: 'Горчичный / Темно-золотой', hex: '#D99100' },
    { id: '220', name: '220', desc: 'Бежевый блонд', hex: '#E1C699' },
    { id: '301', name: '301', desc: 'Микс светло-русый', hex: '#BFA075' },
    { id: '302', name: '302', desc: 'Микс средне-русый', hex: '#997950' },
    { id: '303', name: '303', desc: 'Микс темно-русый', hex: '#735438' },
    { id: '307', name: '307', desc: 'Микс медно-золотистый', hex: '#A0522D' },
    { id: '600', name: '600', desc: 'Ослепительно белый', hex: '#FFFFFF' },
    { id: '613', name: '613', desc: 'Светлый блонд (платина)', hex: '#F3E5AB' },
    { id: 'F1', name: 'F1', desc: 'Розовый (классический)', hex: '#FF6699' },
    { id: 'F2', name: 'F2', desc: 'Красный (алый)', hex: '#D10000' },
    { id: 'F12', name: 'F12', desc: 'Насыщенный фиолетовый', hex: '#6A0DAD' },
    { id: 'F31', name: 'F31', desc: 'Мятный', hex: '#AAF0D1' },
  ]);

  const [mixList, setMixList] = useState([]);
  const [savedMixes, setSavedMixes] = useState([]);
  const [mixName, setMixName] = useState('');
  const [deleteModeId, setDeleteModeId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isNamingMix, setIsNamingMix] = useState(false);
  const [addMode, setAddMode] = useState('camera');
  const [newColor, setNewColor] = useState({ name: '', hex: '#FF5722', desc: '' });
  const [videoStream, setVideoStream] = useState(null);
  const [liveHex, setLiveHex] = useState('#FFFFFF');
  const [brightness, setBrightness] = useState(100);
  const [hueSat, setHueSat] = useState({ h: 0, s: 100 });

  const videoRef = useRef(null);
  const camCanvasRef = useRef(null);
  const canvasHairRef = useRef(null);
  const canvasThreadsRef = useRef(null);
  const wheelRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
      });
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 640 } 
      });
      setVideoStream(stream);
    } catch (err) {
      console.error("Camera access denied");
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  useEffect(() => {
    if (videoRef.current && videoStream) videoRef.current.srcObject = videoStream;
  }, [videoStream]);

  useEffect(() => {
    let animationId;
    const captureLoop = () => {
      if (videoStream && videoRef.current && camCanvasRef.current && videoRef.current.readyState === 4) {
        const ctx = camCanvasRef.current.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        const p = ctx.getImageData(150, 150, 1, 1).data;
        const hex = "#" + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
        setLiveHex(hex);
      }
      animationId = requestAnimationFrame(captureLoop);
    };
    if (videoStream && addMode === 'camera' && isAddingNew) animationId = requestAnimationFrame(captureLoop);
    return () => cancelAnimationFrame(animationId);
  }, [videoStream, addMode, isAddingNew]);

  const hsvToHex = (h, s, v) => {
    v /= 100; s /= 100;
    const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    const r = Math.round(f(5) * 255), g = Math.round(f(3) * 255), b = Math.round(f(1) * 255);
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  const handleWheelClick = (e) => {
    const rect = wheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const radius = rect.width / 2;
    if (Math.sqrt(x*x + y*y) > radius) return;
    let h = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (h < 0) h += 360;
    const s = Math.min(100, (Math.sqrt(x*x + y*y) / radius) * 100);
    setHueSat({ h, s });
  };

  useEffect(() => {
    if (addMode === 'manual') setNewColor(prev => ({ ...prev, hex: hsvToHex(hueSat.h, hueSat.s, brightness) }));
  }, [brightness, hueSat, addMode]);

  const hexToRgb = (hex) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  });

  const getAverageColor = () => {
    if (mixList.length === 0) return '#fafafa';
    let r = 0, g = 0, b = 0;
    const total = mixList.reduce((s, i) => s + i.weight, 0);
    mixList.forEach(item => {
      const rgb = hexToRgb(item.hex);
      r += rgb.r * (item.weight / total);
      g += rgb.g * (item.weight / total);
      b += rgb.b * (item.weight / total);
    });
    return `#${[r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
  };

  useEffect(() => {
    const hairCanvas = canvasHairRef.current;
    const threadsCanvas = canvasThreadsRef.current;
    if (!hairCanvas || !threadsCanvas) return;
    const ctxH = hairCanvas.getContext('2d');
    const ctxT = threadsCanvas.getContext('2d');
    const w = hairCanvas.width, h = hairCanvas.height;

    if (mixList.length === 0) {
      [ctxH, ctxT].forEach(ctx => { ctx.fillStyle = '#fafafa'; ctx.fillRect(0, 0, w, h); });
      return;
    }

    const totalWeight = mixList.reduce((sum, item) => sum + item.weight, 0);
    ctxH.fillStyle = mixList[0].hex; ctxH.fillRect(0, 0, w, h);
    ctxT.fillStyle = mixList[0].hex; ctxT.fillRect(0, 0, w, h);

    mixList.forEach(item => {
      const share = item.weight / totalWeight;
      // Simplified draw for brevity but kept your logic
      ctxH.strokeStyle = item.hex;
      ctxH.globalAlpha = 0.6;
      for(let i=0; i<100 * share; i++) {
        const x = Math.random()*w;
        ctxH.beginPath(); ctxH.moveTo(x, 0); ctxH.lineTo(x+(Math.random()-0.5)*20, h); ctxH.stroke();
      }
      ctxT.strokeStyle = item.hex;
      ctxT.globalAlpha = 0.3;
      for(let i=0; i<500 * share; i++) {
        ctxT.beginPath(); ctxT.moveTo(Math.random()*w, Math.random()*h); ctxT.lineTo(Math.random()*w, Math.random()*h); ctxT.stroke();
      }
    });
  }, [mixList]);

  const groupedColors = [];
  for (let i = 0; i < baseColors.length; i += 10) groupedColors.push(baseColors.slice(i, i + 10));

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-24 select-none overflow-x-hidden">
      <header className="max-w-xl mx-auto px-6 py-4 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase leading-none">Braid Tone</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold mt-1">Mix Studio</p>
          </div>
        </div>
        <button onClick={() => { setIsAddingNew(true); if (addMode === 'camera') startCamera(); }} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl active:scale-90 transition-all">
          <Plus size={24} />
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 space-y-8 mt-6">
        <section className="relative">
          <div className="flex justify-between items-center mb-4 px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Палитра материалов</span>
            <div className="flex gap-2">
              <button onClick={() => scrollContainerRef.current?.scrollBy({left:-300, behavior:'smooth'})} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400"><ChevronLeft size={16}/></button>
              <button onClick={() => scrollContainerRef.current?.scrollBy({left:300, behavior:'smooth'})} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400"><ChevronRight size={16}/></button>
            </div>
          </div>
          <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
            {groupedColors.map((group, idx) => (
              <div key={idx} className="min-w-full snap-start grid grid-cols-5 grid-rows-2 gap-3 pb-2 pr-1">
                {group.map(color => (
                  <button key={color.id} onClick={() => setMixList(prev => prev.find(i=>i.id===color.id) ? prev.map(i=>i.id===color.id?{...i,weight:i.weight+50}:i) : [...prev, {...color, weight:100}])} className="relative flex flex-col items-center gap-1 group">
                    <div className="w-full aspect-square rounded-xl border border-slate-100 shadow-sm group-active:scale-90 transition-transform" style={{ backgroundColor: color.hex }} />
                    <span className="text-[9px] font-black text-slate-900 leading-none">{color.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="aspect-[3/4] rounded-[2rem] bg-slate-50 border overflow-hidden shadow-inner"><canvas ref={canvasHairRef} width={400} height={533} className="w-full h-full object-cover" /></div>
            <p className="text-[9px] text-center font-black uppercase tracking-widest text-slate-300">Прямой ворс</p>
          </div>
          <div className="space-y-3">
            <div className="aspect-[3/4] rounded-[2rem] bg-slate-50 border overflow-hidden shadow-inner"><canvas ref={canvasThreadsRef} width={400} height={533} className="w-full h-full object-cover" /></div>
            <p className="text-[9px] text-center font-black uppercase tracking-widest text-slate-300">Спутанные нити</p>
          </div>
        </section>

        <div className="bg-slate-50 p-4 rounded-[2.5rem] border border-slate-100">
           <div className="flex justify-between items-center px-2 mb-3">
              <div className="flex items-center gap-2"><FlaskConical size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Результат</span></div>
              <span className="text-[10px] font-mono font-bold text-slate-400">{getAverageColor()}</span>
           </div>
           <div className="h-16 w-full rounded-2xl shadow-inner border border-white" style={{ backgroundColor: getAverageColor() }} />
        </div>

        <section className="space-y-4">
          {mixList.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-4 border border-slate-50 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl border flex-shrink-0" style={{ backgroundColor: item.hex }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase">{item.name}</p>
                <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-black" style={{ width: `${(item.weight / (mixList.reduce((s,i) => s + i.weight, 0) || 1)) * 100}%` }} /></div>
              </div>
              <div className="flex items-center bg-slate-50 rounded-2xl p-1">
                <button onClick={() => setMixList(prev => prev.map(i=>i.id===item.id?{...i,weight:Math.max(0,i.weight-25)}:i).filter(i=>i.weight>0))} className="w-8 h-8 flex items-center justify-center"><Minus size={14}/></button>
                <span className="w-8 text-center text-xs font-black">{item.weight}</span>
                <button onClick={() => setMixList(prev => prev.map(i=>i.id===item.id?{...i,weight:i.weight+25}:i))} className="w-8 h-8 flex items-center justify-center"><Plus size={14}/></button>
              </div>
              <button onClick={() => setMixList(mixList.filter(m => m.id !== item.id))} className="text-slate-200"><Trash2 size={18} /></button>
            </div>
          ))}
        </section>

        <div className="flex gap-4">
          <button disabled={mixList.length === 0} onClick={() => setIsNamingMix(true)} className="flex-1 h-20 bg-slate-950 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20 transition-all"><Save size={20} /> Сохранить</button>
          <button onClick={() => setMixList([])} className="w-20 h-20 flex items-center justify-center rounded-[2.5rem] bg-slate-100 text-slate-300 active:rotate-180 transition-all"><RotateCcw size={24} /></button>
        </div>
      </main>

      {isAddingNew && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={() => { stopCamera(); setIsAddingNew(false); }}>
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-6 space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
              <button onClick={() => { setAddMode('camera'); startCamera(); }} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase ${addMode === 'camera' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>Камера</button>
              <button onClick={() => { setAddMode('manual'); stopCamera(); }} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase ${addMode === 'manual' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>Вручную</button>
            </div>
            <div className="flex justify-center">
              <div className="relative w-64 h-64 rounded-full bg-slate-50 overflow-hidden ring-8 ring-slate-50">
                {addMode === 'camera' ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <div ref={wheelRef} onClick={handleWheelClick} className="w-full h-full relative" style={{ background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)`, borderRadius: '50%' }}>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, white, transparent)' }} />
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setNewColor(prev => ({ ...prev, hex: addMode === 'camera' ? liveHex : prev.hex }))} className="w-full bg-slate-950 text-white py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: addMode === 'camera' ? liveHex : newColor.hex }} />
              Захватить цвет
            </button>
            <div className="space-y-4 pt-4 border-t">
              <input className="w-full border-b py-2 text-sm font-black outline-none uppercase" placeholder="Код: 10.1" value={newColor.name} onChange={e => setNewColor({...newColor, name: e.target.value})} />
              <button onClick={() => { setBaseColors([{...newColor, id: Date.now().toString()}, ...baseColors]); setIsAddingNew(false); }} className="w-full bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase">Добавить в палитру</button>
            </div>
          </div>
        </div>
      )}

      {isNamingMix && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={() => setIsNamingMix(false)}>
          <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 space-y-6" onClick={e => e.stopPropagation()}>
            <input className="w-full border-b-2 py-3 text-center text-sm font-black outline-none uppercase" placeholder="Название формулы" value={mixName} onChange={e => setMixName(e.target.value)} />
            <button onClick={() => { setSavedMixes([{...mixList, name: mixName, id: Date.now()}, ...savedMixes]); setIsNamingMix(false); }} className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase">Сохранить</button>
          </div>
        </div>
      )}

      <canvas ref={camCanvasRef} width="300" height="300" className="hidden" />
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;

