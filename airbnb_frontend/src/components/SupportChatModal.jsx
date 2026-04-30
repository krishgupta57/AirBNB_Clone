import { useState, useEffect, useRef } from "react";
import API from "../api";
import { X, Send, ShieldCheck, MessageSquare, Paperclip, FileText, ImageIcon, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

function SupportChatModal({ ticket, onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [ticketStatus, setTicketStatus] = useState(ticket.status);
  const [isInternal, setIsInternal] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const isAdmin = currentUser?.is_staff;

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
  }, [ticket.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(`support-tickets/${ticket.id}/messages/`);
      setMessages(prev => {
        // Create a map of existing messages by ID for fast lookup
        const existingIds = new Set(prev.map(m => m.id));
        // Only add messages that aren't already in the state
        const newMessages = res.data.filter(m => !existingIds.has(m.id));
        
        if (newMessages.length === 0) return prev;
        return [...prev, ...newMessages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });
      setLoading(false);
    } catch (err) {
      console.error("Failed to load support messages:", err);
      if (loading) toast.error("Could not load chat history.");
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await API.patch(`support-tickets/${ticket.id}/`, { status: newStatus });
      setTicketStatus(newStatus);
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await API.post(`support-tickets/${ticket.id}/messages/`, { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-[650px] max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg leading-none">Support Chat</h3>
                {isAdmin ? (
                  <select 
                    value={ticketStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded outline-none cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <option value="open" className="text-slate-900">Open</option>
                    <option value="in_progress" className="text-slate-900">In Progress</option>
                    <option value="resolved" className="text-slate-900">Resolved</option>
                    <option value="closed" className="text-slate-900">Closed</option>
                  </select>
                ) : (
                  <span className="bg-rose-500/20 text-rose-300 text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">{ticketStatus}</span>
                )}
                <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest border ${
                  ticket.priority === 'urgent' ? 'bg-rose-500 border-rose-400 text-white animate-pulse' :
                  ticket.priority === 'high' ? 'bg-orange-500 border-orange-400 text-white' :
                  ticket.priority === 'medium' ? 'bg-blue-500 border-blue-400 text-white' :
                  'bg-slate-500 border-slate-400 text-white'
                }`}>
                  {ticket.priority}
                </span>
              </div>
              <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mt-1">
                Ticket #{ticket.id} • {ticket.subject}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold text-sm">No messages yet.</p>
              <p className="text-slate-400 text-xs mt-1">An admin will be with you shortly.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender.id === currentUser?.id;
              const isAdmin = msg.sender.is_staff;

              return (
                <div key={msg.id} className={`flex gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center border shadow-sm ${
                    isAdmin ? "bg-slate-900 border-slate-800" : "bg-slate-200 border-slate-100"
                  }`}>
                    {msg.sender.avatar ? (
                      <img src={msg.sender.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : isAdmin ? (
                      <ShieldCheck size={14} className="text-rose-500" />
                    ) : (
                      <span className="text-[10px] font-black text-slate-500 uppercase">
                        {msg.sender.username[0]}
                      </span>
                    )}
                  </div>
                  <div className={`max-w-[80%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1 mx-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {isAdmin ? "Support Admin" : msg.sender.username}
                      </span>
                      {isAdmin && (
                        <span className="bg-rose-100 text-rose-500 text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Staff</span>
                      )}
                    </div>
                    <div className={`px-5 py-3.5 rounded-2xl text-sm font-medium shadow-sm transition-all relative ${
                      msg.is_internal ? "bg-amber-50 border-2 border-amber-200 text-amber-900" :
                      isMine 
                        ? "bg-rose-500 text-white rounded-tr-sm" 
                        : isAdmin
                          ? "bg-slate-900 text-white rounded-tl-sm"
                          : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
                    }`}>
                      {msg.is_internal && (
                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase mb-1.5 text-amber-600">
                          <EyeOff size={10} /> Internal Note
                        </div>
                      )}
                      
                      {msg.content}

                      {msg.attachment && (
                        <div className="mt-3 pt-3 border-t border-black/5">
                          {msg.attachment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img src={msg.attachment} alt="attachment" className="rounded-xl max-w-full h-auto shadow-sm cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.attachment, '_blank')} />
                          ) : (
                            <a href={msg.attachment} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/5 p-2 rounded-lg text-xs hover:bg-black/10 transition-colors">
                              <FileText size={14} />
                              <span className="truncate max-w-[150px]">View Document</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 mt-1.5 mx-1 uppercase">
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
        <div className="p-6 border-t border-slate-100 bg-white">
          {attachment && (
            <div className="mb-4 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                {attachment.type.startsWith('image/') ? <ImageIcon size={16} className="text-rose-500" /> : <FileText size={16} className="text-slate-400" />}
                <span className="text-xs font-bold text-slate-600 truncate max-w-[200px]">{attachment.name}</span>
              </div>
              <button onClick={() => setAttachment(null)} className="text-slate-400 hover:text-rose-500"><X size={14} /></button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={(e) => setAttachment(e.target.files[0])}
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={(ticketStatus === 'resolved' || ticketStatus === 'closed') && !isAdmin}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                attachment ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              } ${(ticketStatus === 'resolved' || ticketStatus === 'closed') && !isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Paperclip size={20} />
            </button>

            <input
              type="text"
              placeholder={
                ticketStatus === 'resolved' || ticketStatus === 'closed' 
                  ? `Ticket is ${ticketStatus}` 
                  : isInternal ? "Add internal note..." : "Describe your issue..."
              }
              disabled={(ticketStatus === 'resolved' || ticketStatus === 'closed') && !isAdmin}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={`flex-1 border rounded-2xl py-4 pl-6 pr-4 text-sm font-bold outline-none transition-all ${
                isInternal 
                  ? "bg-amber-50 border-amber-200 focus:ring-4 focus:ring-amber-500/10" 
                  : "bg-slate-50 border-slate-200 focus:ring-4 focus:ring-rose-500/10"
              } ${(ticketStatus === 'resolved' || ticketStatus === 'closed') && !isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
            />

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsInternal(!isInternal)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isInternal ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
                title="Internal Note"
              >
                <EyeOff size={20} />
              </button>
            )}

            <button
              type="submit"
              disabled={(!newMessage.trim() && !attachment) || ((ticketStatus === 'resolved' || ticketStatus === 'closed') && !isAdmin)}
              className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-rose-500 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Send size={20} className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default SupportChatModal;
