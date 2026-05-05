import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { http } from '../../constants/config';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Xin chào! Mình là trợ lý mua hàng của LaptopQTK. Bạn cần tư vấn gì ạ? 😊' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInput('');
        setLoading(true);

        try {
            const res = await http.post('chatbot/message', { message: text });
            const { reply, suggested_products } = res.data;
            setMessages(prev => [...prev, {
                role: 'bot',
                content: reply,
                products: suggested_products || [],
            }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: 'Xin lỗi, có lỗi xảy ra. Bạn vui lòng thử lại sau nhé!',
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatPrice = (price) => {
        return parseInt(price).toLocaleString('vi-VN') + 'đ';
    };

    return (
        <>
            {/* Chat toggle button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-[#2563eb] text-white shadow-lg hover:bg-[#1d4ed8] transition-all duration-300 flex items-center justify-center hover:scale-110"
                    title="Chat tư vấn"
                >
                    <FontAwesomeIcon icon={faCommentDots} className="text-xl" />
                </button>
            )}

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-5 z-50 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-[#2563eb] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faCommentDots} className="text-sm" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">Trợ lý LaptopQTK</div>
                                <div className="text-xs text-blue-100">Luôn sẵn sàng tư vấn</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-[#2563eb] text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                                }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>

                                    {/* Product cards */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="mt-2 space-y-1.5 border-t border-gray-100 pt-2">
                                            {msg.products.slice(0, 3).map((p) => (
                                                <a
                                                    key={p.id}
                                                    href={`/product/${p.slug}`}
                                                    className="block bg-blue-50 rounded-lg px-2 py-1.5 hover:bg-blue-100 transition text-xs"
                                                >
                                                    <div className="font-medium text-gray-800 truncate">{p.name}</div>
                                                    <div className="text-[#2563eb] font-semibold">{formatPrice(p.base_price)}</div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-500 rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm border border-gray-100">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập câu hỏi..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                                disabled={loading}
                                maxLength={500}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center hover:bg-[#1d4ed8] transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            >
                                <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
