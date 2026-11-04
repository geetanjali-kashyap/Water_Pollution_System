
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.837 8.837 0 01-4.43-1.232l-2.146.963a.5.5 0 01-.622-.622l.963-2.146A8.837 8.837 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.415 14.868a.5.5 0 01.622.314A6.976 6.976 0 0010 16a7 7 0 000-14 6.976 6.976 0 00-4.963.718.5.5 0 01-.314-.622 8.963 8.963 0 016.278-2.096c4.418 0 8 3.134 8 7s-3.582 7-8 7a8.963 8.963 0 01-5.585-2.132z" clipRule="evenodd" />
        <path d="M7 9a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
);


const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { text: "Hello! How can I help you today? You can ask me about 'pH', 'how to use', or just say 'help'.", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatboxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [messages]);

    const getBotResponse = (userInput: string): string => {
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('help')) {
            return "I can help you with questions about this app. Try asking 'What is pH?' or 'How to use this app?'.";
        }
        if (lowerInput.includes('ph')) {
            return "pH is a measure of how acidic or basic water is. The range goes from 0 to 14, with 7 being neutral. pHs of less than 7 indicate acidity, whereas a pH of greater than 7 indicates a base.";
        }
        if (lowerInput.includes('how to use')) {
            return "To use the app, first log in or sign up. Then, navigate to the 'Prediction' page. Fill in all the water quality parameters and click 'Predict'. The result will be displayed on the screen.";
        }
        if (lowerInput.includes('predict')) {
            return "The prediction is based on a machine learning model that analyzes the parameters you provide to determine if the water is potable (safe to drink) or not.";
        }
        return "I'm not sure how to answer that. Try asking for 'help' to see what I can do.";
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() === '') return;

        const userMessage: ChatMessage = { text: inputValue, sender: 'user' };
        const botResponse: ChatMessage = { text: getBotResponse(inputValue), sender: 'bot' };
        
        setMessages(prev => [...prev, userMessage, botResponse]);
        setInputValue('');
    };

    return (
        <>
            <div className={`fixed bottom-5 right-5 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button onClick={() => setIsOpen(true)} className="bg-blue-600 rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">
                   <BotIcon/>
                </button>
            </div>
            <div className={`fixed bottom-5 right-5 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-lg">
                    <h3 className="font-bold">Chat Assistant</h3>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-full">
                        <CloseIcon />
                    </button>
                </div>
                <div ref={chatboxRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t">
                    <div className="flex">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700">
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Chatbot;
