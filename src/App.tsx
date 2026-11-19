import { useEffect, useMemo, useRef, useState } from 'react';
import { CloudRain, DoorOpen, Heart, Lightbulb, MapPin, MessageCircle, Music2, Pause, Play, Send, Settings2, Sparkles, Volume2, X } from 'lucide-react';

type Memory = { id: number; text: string; time: string; hearts: number };
type Visitor = { name: string; mood: string; x: number; y: number; color: string };
const visitors: Visitor[] = [
  { name: 'Mira', mood: 'watching the city', x: 63, y: 48, color: '#dda97e' },
  { name: 'Noah', mood: 'between songs', x: 28, y: 61, color: '#789cc9' },
  { name: 'Sora', mood: 'finding quiet', x: 79, y: 72, color: '#b58bce' },
];
const tracks = [
  { title: 'Streetlight Drift', artist: 'AFTERHOURS radio', art: 'linear-gradient(135deg,#c5784e,#1e273a)' },
  { title: 'Blue Hour', artist: 'Night windows', art: 'linear-gradient(135deg,#769ab7,#152335)' },
  { title: 'Rain on Glass', artist: 'Soft Weather', art: 'linear-gradient(135deg,#766f9b,#20263d)' },
];
const defaultMemories: Memory[] = [
  { id: 1, text: 'The city was loud, but this felt like a secret.', time: 'earlier tonight', hearts: 4 },
  { id: 2, text: 'Stayed for one more song.', time: 'yesterday', hearts: 7 },
  { id: 3, text: 'A soft place to land after a long day.', time: '2 days ago', hearts: 11 },
];

function App() {
  const [entered, setEntered] = useState(false), [rain, setRain] = useState(false), [late, setLate] = useState(false), [lights, setLights] = useState(true);
  const [position, setPosition] = useState({ x: 49, y: 76 });
  const [panel, setPanel] = useState<'memory' | 'visitor' | 'settings' | null>(null), [visitor, setVisitor] = useState<Visitor | null>(null);
  const [track, setTrack] = useState(0), [playing, setPlaying] = useState(false), [volume, setVolume] = useState(0.38);
  const [memories, setMemories] = useState<Memory[]>(() => { try { return JSON.parse(localStorage.getItem('afterhours-memories') || 'null') || defaultMemories; } catch { return defaultMemories; } });
  const [draft, setDraft] = useState(''), [chat, setChat] = useState<string[]>(['Mira: This view never gets old.']), [chatDraft, setChatDraft] = useState('');
  const audioRef = useRef<AudioContext | null>(null), gainRef = useRef<GainNode | null>(null), oscRef = useRef<OscillatorNode | null>(null);
  const near = useMemo(() => visitors.find(v => Math.hypot(v.x - position.x, v.y - position.y) < 12), [position]);

  useEffect(() => { localStorage.setItem('afterhours-memories', JSON.stringify(memories)); }, [memories]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const keys: Record<string, [number, number]> = { w:[0,-1], arrowup:[0,-1], s:[0,1], arrowdown:[0,1], a:[-1,0], arrowleft:[-1,0], d:[1,0], arrowright:[1,0] };
      const move = keys[e.key.toLowerCase()]; if (!move || !entered || panel) return; e.preventDefault(); setPosition(p => ({ x: Math.max(9, Math.min(91, p.x + move[0] * 2.2)), y: Math.max(38, Math.min(89, p.y + move[1] * 2.2)) }));
    };
    window.addEventListener('keydown', down); return () => window.removeEventListener('keydown', down);
  }, [entered, panel]);
  useEffect(() => { if (gainRef.current) gainRef.current.gain.value = playing ? volume * .055 : 0; }, [volume, playing]);
  function toggleAudio() {
    if (!audioRef.current) { const c = new AudioContext(); const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = 87; o.connect(g).connect(c.destination); o.start(); audioRef.current = c; oscRef.current = o; gainRef.current = g; }
    setPlaying(p => !p);
  }
  function cycle(direction: number) { setTrack(t => (t + direction + tracks.length) % tracks.length); }
  function addMemory() { const clean = draft.trim(); if (!clean || clean.length > 120) return; setMemories(m => [{ id: Date.now(), text: clean, time: 'just now', hearts: 0 }, ...m]); setDraft(''); }
  function react(id: number) { setMemories(m => m.map(x => x.id === id ? {...x, hearts:x.hearts + 1} : x)); }
  function sendChat() { if (!chatDraft.trim()) return; setChat(c => [...c, `You: ${chatDraft.trim()}`]); setChatDraft(''); }
  const t = tracks[track];
  return <main className={`app ${late ? 'late' : ''} ${!lights ? 'dark-lights' : ''}`}>
    {!entered && <section className="arrival"><div className="arrival-card"><p className="eyebrow">A SMALL SOCIAL WORLD</p><h1>AFTER<br/><i>HOURS</i></h1><p className="arrival-copy">The city settles. The rooftop opens.<br/>Come as you are, stay for a while.</p><button className="enter" onClick={() => setEntered(true)}>Enter the rooftop <DoorOpen size={17}/></button><p className="arrival-note">Headphones recommended · Demo characters only</p></div></section>}
    <section className="scene" aria-label="The Rooftop interactive environment">
      <div className="sky"><div className="moon"/><div className="stars">✦　·　✧　·　⋆　　·　✦　　·　⋆　·　✧　　·　✦　　·　⋆</div><div className="cloud cloud-a"/><div className="cloud cloud-b"/></div>
      <div className="skyline">{Array.from({length: 22}, (_,i) => <span key={i} style={{height:`${18 + ((i*17)%53)}%`, width:`${3 + (i%4)}%`}}><b/></span>)}</div>
      {rain && <div className="rain">{Array.from({length: 80}, (_,i)=><i key={i} style={{left:`${(i*37)%100}%`,animationDelay:`-${(i%9)/4}s`}} />)}</div>}
      <div className="roof"><div className="parapet"/><div className="floor-lines"/>
        <button className="object couch" onClick={() => setPanel('settings')} aria-label="Lounge seating"><span/><span/><em>lounge</em></button>
        <button className="object fire" onClick={() => setLights(!lights)} aria-label="Ambient lantern"><span>✦</span><em>{lights ? 'warm lantern' : 'lantern off'}</em></button>
        <button className="object wall" onClick={() => setPanel('memory')} aria-label="Memory wall"><div className="wall-light"/><b>MEMORY<br/>WALL</b><em>leave a note</em></button>
        <button className="object table" onClick={() => setPanel('settings')} aria-label="Rooftop table"><span/><em>night table</em></button>
        {visitors.map(v => <button key={v.name} className="visitor" style={{left:`${v.x}%`,top:`${v.y}%`, '--avatar':v.color} as React.CSSProperties} onClick={() => {setVisitor(v);setPanel('visitor')}}><span/><b>{v.name}</b></button>)}
        <div className="you" style={{left:`${position.x}%`,top:`${position.y}%`}}><span/><b>you</b></div>
      </div>
    </section>
    <header><div className="brand">AFTER<span>HOURS</span></div><div className="place"><MapPin size={14}/> THE ROOFTOP <small>• live demo</small></div><button className="icon-btn" onClick={() => setPanel('settings')} aria-label="Settings"><Settings2 size={18}/></button></header>
    <aside className="hint"><span>WASD</span> or arrows to wander <i>·</i> click objects to interact</aside>
    <div className="presence"><div className="presence-dots">{visitors.map(v=><i key={v.name} style={{background:v.color}}/>)}</div><span>3 demo visitors here</span></div>
    {near && <button className="nearby" onClick={() => {setVisitor(near);setPanel('visitor')}}><MessageCircle size={15}/> Say hello to {near.name}</button>}
    <section className="player"><button className="art" style={{background:t.art}} onClick={toggleAudio}>{playing && <span className="bars">▂▄▆▃</span>}</button><div className="track"><small>NOW PLAYING</small><b>{t.title}</b><span>{t.artist}</span></div><div className="player-actions"><button onClick={()=>cycle(-1)}>‹</button><button className="play" onClick={toggleAudio}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button><button onClick={()=>cycle(1)}>›</button></div><Volume2 size={15}/><input aria-label="Volume" type="range" min="0" max="1" step=".01" value={volume} onChange={e=>setVolume(+e.target.value)}/></section>
    <div className="quick"><button onClick={()=>setRain(!rain)} className={rain?'active':''}><CloudRain size={16}/>{rain?'Rain on':'Rain off'}</button><button onClick={()=>setLate(!late)}><Sparkles size={16}/>{late?'Late night':'Evening'}</button></div>
    {panel && <div className="overlay" onMouseDown={()=>setPanel(null)}><section className="panel" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={()=>setPanel(null)}><X size={18}/></button>
      {panel==='memory' && <><p className="eyebrow">A DIGITAL GUESTBOOK</p><h2>Memory wall</h2><p className="muted">Small notes from other nights, saved on this device.</p><div className="memory-form"><textarea maxLength={120} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Leave a little something…"/><div><small>{draft.length}/120</small><button className="solid" onClick={addMemory}><Send size={14}/> Pin memory</button></div></div><div className="memories">{memories.slice(0,6).map(m=><article key={m.id}><p>“{m.text}”</p><footer>{m.time}<button onClick={()=>react(m.id)}><Heart size={13}/>{m.hearts}</button></footer></article>)}</div></>}
      {panel==='visitor' && visitor && <><p className="eyebrow">DEMO VISITOR</p><div className="person-head" style={{background:visitor.color}}/><h2>{visitor.name}</h2><p className="muted">{visitor.mood}. A simulated rooftop regular.</p><div className="interactions"><button onClick={()=>setChat(c=>[...c,`You waved at ${visitor.name}.`,`${visitor.name}: Hey — glad you made it up here.`])}>👋 Wave</button><button onClick={()=>setChat(c=>[...c,`You greeted ${visitor.name}.`,`${visitor.name}: The air feels good tonight.`])}>✦ Greet</button></div><div className="chat">{chat.map((m,i)=><p key={i}>{m}</p>)}<div><input value={chatDraft} onChange={e=>setChatDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Say something…"/><button onClick={sendChat}><Send size={15}/></button></div></div></>}
      {panel==='settings' && <><p className="eyebrow">ROOFTOP CONTROLS</p><h2>Set the mood</h2><div className="setting-row"><span><CloudRain size={17}/> Gentle rainfall</span><button className={rain?'toggle on':'toggle'} onClick={()=>setRain(!rain)}><i/></button></div><div className="setting-row"><span><Lightbulb size={17}/> Ambient lanterns</span><button className={lights?'toggle on':'toggle'} onClick={()=>setLights(!lights)}><i/></button></div><div className="setting-row"><span><Music2 size={17}/> Soft audio</span><button className={playing?'toggle on':'toggle'} onClick={toggleAudio}><i/></button></div><p className="muted footer-note">This is an offline atmospheric prototype. Presence and chat are simulated.</p></>}
    </section></div>}
  </main>;
}
export default App;
