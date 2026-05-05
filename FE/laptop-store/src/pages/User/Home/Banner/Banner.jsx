import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import banner1 from "../../../../assets/Home/banner1.png";
import banner2 from "../../../../assets/Home/banner2.png";
import banner3 from "../../../../assets/Home/banner3.png";

const Banner = () => {
    const [cur, setCur] = useState(0);
    const slides = [
        { src: banner1, alt: 'Banner 1' },
        { src: banner2, alt: 'Banner 2' },
        { src: banner3, alt: 'Banner 3' },
    ];

    useEffect(() => {
        const t = setInterval(() => setCur(c => (c + 1) % slides.length), 5000);
        return () => clearInterval(t);
    }, []);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: 420,
            overflow: 'hidden',
            background: '#000',
        }}>
            {slides.map((s, i) => (
                <div key={i} style={{
                    position: 'absolute', inset: 0,
                    opacity: i === cur ? 1 : 0,
                    transition: 'opacity .7s ease',
                }}>
                    <img src={s.src} alt={s.alt} style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: 'center',
                        display: 'block',
                    }}/>
                </div>
            ))}

            {/* Prev */}
            <button onClick={() => setCur(c => (c - 1 + slides.length) % slides.length)}
                style={{
                    position:'absolute', left:16, top:'50%', transform:'translateY(-50%)',
                    zIndex:10, width:40, height:40, borderRadius:'50%',
                    background:'rgba(0,0,0,.4)', border:'none', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', color:'#fff',
                }}>
                <FontAwesomeIcon icon={faChevronLeft} style={{fontSize:18}}/>
            </button>

            {/* Next */}
            <button onClick={() => setCur(c => (c + 1) % slides.length)}
                style={{
                    position:'absolute', right:16, top:'50%', transform:'translateY(-50%)',
                    zIndex:10, width:40, height:40, borderRadius:'50%',
                    background:'rgba(0,0,0,.4)', border:'none', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', color:'#fff',
                }}>
                <FontAwesomeIcon icon={faChevronRight} style={{fontSize:18}}/>
            </button>

            {/* Dots */}
            <div style={{
                position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)',
                display:'flex', gap:8, zIndex:10,
            }}>
                {slides.map((_, i) => (
                    <button key={i} onClick={() => setCur(i)} style={{
                        width: i===cur ? 24 : 10, height:10,
                        borderRadius: 999, border:'none', cursor:'pointer',
                        background: i===cur ? '#fff' : 'rgba(255,255,255,.5)',
                        transition:'all .3s', padding:0,
                    }}/>
                ))}
            </div>
        </div>
    );
};

export default Banner;