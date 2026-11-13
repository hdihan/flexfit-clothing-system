import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../services/api';
import QuickViewModal from './QuickViewModal';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm the FlexFit AI Assistant ✨ I can recommend outfits, answer questions, and help you find exactly what you're looking for. How can I help you?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Optional: reset scroll if needed when opened
        }
    }, [messages, isOpen, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMessage = input.trim();
        const currentMessages = [...messages, { text: userMessage, sender: 'user' }];
        setMessages(currentMessages);
        setInput('');
        setIsTyping(true);

        try {
            const { data } = await api.post('/chat', {
                message: userMessage,
                history: messages // pass previous messages for context
            });

            setMessages([...currentMessages, { 
                text: data.response, 
                sender: 'bot',
                products: data.products || []
            }]);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "I'm sorry, I'm having trouble connecting to my brain right now. Please make sure the GEMINI_API_KEY is configured.";
            setMessages([...currentMessages, { 
                text: errorMessage, 
                sender: 'bot' 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-[100] flex items-center justify-center ${isOpen ? 'bg-gray-800 hover:bg-gray-900 rotate-90 text-white' : 'bg-brand-600 hover:bg-brand-700 hover:scale-110 text-white'}`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[340px] md:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-[100] transform transition-all duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-tight">FlexFit AI</h3>
                            <p className="text-xs text-brand-100">Always online to help you</p>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div 
                        ref={chatContainerRef}
                        className="h-[400px] max-h-[400px] p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4 scroll-smooth"
                    >
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-brand-100 text-brand-700' : 'bg-brand-600 text-white'}`}>
                                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                                    
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="mt-3 flex flex-col gap-2">
                                            {msg.products.map(product => (
                                                <div 
                                                    key={product._id} 
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors"
                                                >
                                                    <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-white" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-xs truncate text-gray-900">{product.name}</p>
                                                        <p className="text-xs text-brand-600 font-bold">LKR {product.price?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-2 max-w-[85%] self-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white">
                                    <Bot size={16} />
                                </div>
                                <div className="p-4 rounded-2xl bg-white border border-gray-100 rounded-tl-sm shadow-sm flex gap-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2"
                        >
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                            >
                                <Send size={16} className="ml-1" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Quick View Modal for Products Recommended in Chat */}
            {selectedProduct && (
                <QuickViewModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                />
            )}
        </>
    );
}
