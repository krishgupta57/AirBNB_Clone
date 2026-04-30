import { useState, useEffect, useRef } from "react";
import API from "../api";
import { X, Send, MessageSquare, User } from "lucide-react";
import toast from "react-hot-toast";

function InquiryChatModal({ inquiry, onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchMessages();
    };

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchMessages();
    }, 5000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [inquiry.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(`inquiries/${inquiry.id}/messages/`);
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (loading) toast.error("Could not load chat history.");
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await API.post(`inquiries/${inquiry.id}/messages/`, { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const otherUser = currentUser.id === inquiry.user.id ? inquiry.property_detail.host : inquiry.user;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-[600px] max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Chat with {otherUser.username}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Regarding: {inquiry.property_detail.title}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold text-sm">No messages yet.</p>
              <p className="text-slate-400 text-xs mt-1">Start your inquiry below!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender.id === currentUser?.id;
              return (
                <div key={msg.id} className={`flex gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-100 shadow-sm">
                    {msg.sender.avatar ? (
                      <img src={msg.sender.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-slate-500 uppercase">
                        {msg.sender.username[0]}
                      </span>
                    )}
                  </div>
                  <div className={`max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 mx-1">
                      {msg.sender.username}
                    </span>
                    <div className={`px-5 py-3.5 rounded-2xl text-sm font-medium shadow-sm ${
                      isMine 
                        ? "bg-rose-500 text-white rounded-tr-sm" 
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 mt-1 mx-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask a question..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full py-4 pl-6 pr-4 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-rose-500 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default InquiryChatModal;
