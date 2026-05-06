import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import banner1 from "../../../../assets/Home/banner1.png";
import banner2 from "../../../../assets/Home/banner2.png";
import banner3 from "../../../../assets/Home/banner3.png";

const slides = [
  { src: banner1, alt: 'Banner 1' },
  { src: banner2, alt: 'Banner 2' },
  { src: banner3, alt: 'Banner 3' },
];

export default function Banner() {
  const [cur, setCur]       = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCur(c => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCur(c => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  const btnStyle = (side) => ({
    position: 'absolute', [side]: 20, top: '50%', transform: 'translateY(-50%)',
    zIndex: 10, width: 46, height: 46, borderRadius: '50%',
    background: 'rgba(0,0,0,.42)', backdropFilter: 'blur(4px)',
    border: '1.5px solid rgba(255,255,255,.25)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', transition: 'all .2s',
  });

  return (
    <div
      style={{ position: 'relative', width: '100%', height: 440, overflow: 'hidden', background: '#0f172a' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === cur ? 1 : 0, transition: 'opacity .7s ease', pointerEvents: i === cur ? 'auto' : 'none' }}>
          <img src={s.src} alt={s.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          {/* subtle overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,.25) 0%, transparent 40%, transparent 60%, rgba(0,0,0,.15) 100%)' }} />
        </div>
      ))}

      {/* Prev */}
      <button onClick={prev} style={btnStyle('left')}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.72)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,.42)'}>
        <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 18 }} />
      </button>

      {/* Next */}
      <button onClick={next} style={btnStyle('right')}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.72)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,.42)'}>
        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 18 }} />
      </button>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCur(i)} style={{
            width: i === cur ? 28 : 8, height: 8, borderRadius: 999,
            border: 'none', cursor: 'pointer', padding: 0, transition: 'all .3s',
            background: i === cur ? '#fff' : 'rgba(255,255,255,.45)',
          }} />
        ))}
      </div>

      {/* Slide counter */}
      <div style={{ position: 'absolute', bottom: 18, right: 20, fontSize: 11, color: 'rgba(255,255,255,.7)', fontWeight: 600, zIndex: 10 }}>
        {cur + 1} / {slides.length}
      </div>
    </div>
  );
}