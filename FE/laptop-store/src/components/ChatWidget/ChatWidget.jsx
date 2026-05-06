// src/components/ChatWidget/ChatWidget.jsx
// Chatbot AI tư vấn có product cards, conversation history
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { baseUrl } from '../../constants/config';
import { useNavigate } from 'react-router-dom';

const BASE_STORAGE = baseUrl ? `${baseUrl}/storage/` : 'http://localhost:8000/storage/';

const vnd = (p) => new Intl.NumberFormat('vi-VN').format(Math.round(p)) + 'đ';

const getImg = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=80&q=60';
    if (path.startsWith('https://')) return path;
    return `${BASE_STORAGE}${path.replace(/^\//, '')}`;
};

const QUICK_QUESTIONS = [
    'Laptop gaming dưới 20 triệu',
    'MacBook phù hợp sinh viên',
    'Laptop văn phòng pin trâu',
    'So sánh RAM 16GB vs 32GB',
];

export default function ChatWidget() {
    const navigate = useNavigate();
    const [open,    setOpen]    = useState(false);
    const [msgs,    setMsgs]    = useState([
        { role: 'assistant', content: 'Xin chào! Mình là trợ lý LaptopQTK 👋 Bạn cần tư vấn laptop hay linh kiện gì?' }
    ]);
    const [input,   setInput]   = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs, open]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }, [open]);

    const send = async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setInput('');

        const newMsgs = [...msgs, { role: 'user', content: msg }];
        setMsgs(newMsgs);
        setLoading(true);

        try {
            // Build history (exclude first greeting)
            const history = newMsgs.slice(1, -1).map(m => ({ role: m.role, content: m.content }));
            const res = await axios.post(`${baseUrl}/api/chatbot/message`, {
                message: msg,
                history,
            });
            const { reply, products } = res.data;
            setMsgs(prev => [...prev, { role: 'assistant', content: reply, products }]);
        } catch {
            setMsgs(prev => [...prev, {
                role: 'assistant',
                content: 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau!'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position:'fixed', bottom:24, right:24, zIndex:1000,
                    width:54, height:54, borderRadius:'50%',
                    background: open ? '#374151' : '#2563eb',
                    border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(0,0,0,.25)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all .2s',
                }}>
                {open ? (
                    <svg width="20" height="20" fill="none" stroke="#fff" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                ) : (
                    <svg width="22" height="22" fill="none" stroke="#fff" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                )}
                {!open && msgs.filter(m=>m.role==='assistant').length > 1 && (
                    <span style={{ position:'absolute', top:-3, right:-3, width:10, height:10, background:'#ef4444', borderRadius:'50%', border:'2px solid #fff' }}/>
                )}
            </button>

            {/* Chat window */}
            {open && (
                <div style={{
                    position:'fixed', bottom:90, right:24, zIndex:1000,
                    width:360, height:520,
                    background:'#fff', borderRadius:18,
                    boxShadow:'0 8px 40px rgba(0,0,0,.2)',
                    display:'flex', flexDirection:'column', overflow:'hidden',
                    fontFamily:"'Inter','Segoe UI',sans-serif",
                }}>
                    {/* Header */}
                    <div style={{ background:'linear-gradient(135deg,#1e40af,#2563eb)', padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, background:'rgba(255,255,255,.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <svg width="18" height="18" fill="none" stroke="#fff" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ color:'#fff', fontWeight:700, fontSize:14, lineHeight:1.3 }}>Trợ lý LaptopQTK</div>
                            <div style={{ color:'rgba(255,255,255,.75)', fontSize:11 }}>Luôn sẵn sàng tư vấn</div>
                        </div>
                        <div style={{ marginLeft:'auto', width:8, height:8, background:'#4ade80', borderRadius:'50%', boxShadow:'0 0 0 2px rgba(74,222,128,.3)' }}/>
                    </div>

                    {/* Messages */}
                    <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10, background:'#f9fafb' }}>
                        {msgs.map((m, i) => (
                            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: m.role==='user' ? 'flex-end' : 'flex-start', gap:4 }}>
                                <div style={{
                                    maxWidth:'82%', padding:'9px 13px', borderRadius: m.role==='user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: m.role==='user' ? '#2563eb' : '#fff',
                                    color: m.role==='user' ? '#fff' : '#111827',
                                    fontSize:13, lineHeight:1.55,
                                    boxShadow: m.role==='user' ? 'none' : '0 1px 3px rgba(0,0,0,.08)',
                                    whiteSpace:'pre-wrap',
                                }}>
                                    {m.content}
                                </div>

                                {/* Product cards */}
                                {m.products?.length > 0 && (
                                    <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:6, marginTop:4 }}>
                                        {m.products.map(p => (
                                            <div key={p.id}
                                                onClick={() => navigate(`/products/${p.id}`)}
                                                style={{ display:'flex', alignItems:'center', gap:10, background:'#fff', borderRadius:10, padding:'8px 10px', cursor:'pointer', border:'1px solid #e5e7eb', boxShadow:'0 1px 3px rgba(0,0,0,.06)', transition:'box-shadow .15s' }}
                                                onMouseEnter={e => e.currentTarget.style.boxShadow='0 3px 10px rgba(0,0,0,.12)'}
                                                onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,.06)'}>
                                                <img src={getImg(p.img)} alt={p.name}
                                                    style={{ width:44, height:44, objectFit:'cover', borderRadius:8, flexShrink:0, background:'#f3f4f6' }}
                                                    onError={e => { e.target.src='https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=80&q=60'; }}/>
                                                <div style={{ flex:1, minWidth:0 }}>
                                                    <p style={{ fontSize:12, fontWeight:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{p.name}</p>
                                                    <p style={{ fontSize:12, fontWeight:700, color:'#2563eb', margin:'2px 0 0' }}>{vnd(p.price)}</p>
                                                </div>
                                                <svg width="14" height="14" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                                </svg>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading */}
                        {loading && (
                            <div style={{ display:'flex', alignItems:'flex-start' }}>
                                <div style={{ background:'#fff', borderRadius:'14px 14px 14px 4px', padding:'10px 14px', boxShadow:'0 1px 3px rgba(0,0,0,.08)', display:'flex', gap:4 }}>
                                    {[0,1,2].map(i => (
                                        <div key={i} style={{ width:7, height:7, background:'#9ca3af', borderRadius:'50%', animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }}/>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef}/>
                    </div>

                    {/* Quick questions — chỉ hiện khi chưa có cuộc trò chuyện */}
                    {msgs.length <= 1 && (
                        <div style={{ padding:'8px 12px', borderTop:'1px solid #e5e7eb', display:'flex', gap:6, flexWrap:'wrap', background:'#fff' }}>
                            {QUICK_QUESTIONS.map((q, i) => (
                                <button key={i} onClick={() => send(q)}
                                    style={{ fontSize:11, color:'#2563eb', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:999, padding:'3px 10px', cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit' }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={{ padding:'10px 12px', borderTop:'1px solid #e5e7eb', display:'flex', gap:8, background:'#fff' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
                            placeholder="Nhập câu hỏi..."
                            style={{ flex:1, border:'1px solid #e5e7eb', borderRadius:10, padding:'8px 12px', fontSize:13, outline:'none', fontFamily:'inherit', minWidth:0 }}
                        />
                        <button onClick={() => send()}
                            disabled={!input.trim() || loading}
                            style={{ width:36, height:36, borderRadius:10, background: input.trim() && !loading ? '#2563eb' : '#e5e7eb', border:'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background .15s' }}>
                            <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-6px); }
                }
            `}</style>
        </>
    );
}