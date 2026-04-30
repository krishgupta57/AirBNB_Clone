import { useState, useEffect } from "react";
import API from "../api";
import { 
  Search, 
  Book, 
  Shield, 
  CreditCard, 
  Home, 
  MessageCircle, 
  ChevronRight, 
  HelpCircle,
  Plus,
  Clock,
  CheckCircle2
} from "lucide-react";
import { getUser } from "../utils/auth";
import toast from "react-hot-toast";
import SupportChatModal from "../components/SupportChatModal";

const categories = [
  { id: 'booking', icon: Book, title: 'Booking & Trips', description: 'Changing a reservation, cancellations, and refunds.' },
  { id: 'hosting', icon: Home, title: 'Hosting', description: 'Listing your home, guest requirements, and hosting tools.' },
  { id: 'safety', icon: Shield, title: 'Safety & Security', description: 'Account security, report an issue, and trust & safety.' },
  { id: 'payment', icon: CreditCard, title: 'Payments & Pricing', description: 'Coupons, taxes, and how payments work.' },
];

const faqs = [
  { q: "How do I cancel my reservation?", a: "You can cancel your reservation through the 'My Trips' section. Refund eligibility depends on the host's cancellation policy." },
  { q: "What should I do if my host hasn't responded?", a: "If your host hasn't responded after 24 hours, you can reach out to our support team for assistance." },
  { q: "How do I become a host?", a: "Click on 'Become a Host' in the navbar to start your listing process. It only takes a few minutes!" },
];

function HelpCenter() {
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState("General");
  const [newTicketPriority, setNewTicketPriority] = useState("medium");
  
  const currentUser = getUser();

  useEffect(() => {
    if (currentUser) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get("support-tickets/");
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketSubject.trim()) return;

    try {
      const res = await API.post("support-tickets/", {
        subject: newTicketSubject,
        category: newTicketCategory,
        priority: newTicketPriority
      });
      setTickets([res.data, ...tickets]);
      setNewTicketSubject("");
      setShowNewTicketModal(false);
      toast.success("Support ticket created!");
      setActiveTicket(res.data); // Open chat immediately
    } catch (err) {
      toast.error("Failed to create ticket");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-32 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="container-custom relative z-10 text-center">
          <span className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-6 inline-block">Support Portal</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">How can we help <span className="text-rose-500">you?</span></h1>
          
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-6 flex items-center text-slate-400 group-focus-within:text-rose-500 transition-colors">
              <Search size={20} strokeWidth={3} />
            </div>
            <input 
              type="text" 
              placeholder="Search for articles, guides, or help topics..."
              className="w-full bg-white/10 border border-white/10 backdrop-blur-md rounded-full py-6 pl-16 pr-8 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:bg-white focus:text-slate-900 transition-all shadow-2xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container-custom -mt-20 relative z-20 pb-20">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-transparent hover:border-rose-100">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors mb-6">
                <cat.icon size={24} />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-2">{cat.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* FAQs */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <HelpCircle className="text-rose-500" /> Common Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-black text-slate-900 mb-3">{faq.q}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - Support & Tickets */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/30 transition-colors"></div>
              <h3 className="text-xl font-black mb-4 relative z-10">Still need help?</h3>
              <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed relative z-10">Our dedicated support team is available 24/7 to assist you with any inquiries.</p>
              <button 
                onClick={() => currentUser ? setShowNewTicketModal(true) : toast.error("Please login to contact support")}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                <MessageCircle size={20} />
                Chat with Us
              </button>
            </div>

            {/* My Tickets */}
            {currentUser && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-slate-900">Your Tickets</h3>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full">{tickets.length}</span>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500"></div>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No active tickets</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        onClick={() => setActiveTicket(ticket)}
                        className="p-4 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-slate-900 text-sm truncate">{ticket.subject}</p>
                          {ticket.unread_messages_count > 0 && (
                            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-black uppercase tracking-widest ${
                            ticket.status === 'open' ? 'text-emerald-500' : 'text-slate-400'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-[8px] font-bold text-slate-300">
                            {new Date(ticket.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-2">New Support Ticket</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">Briefly describe what you need help with.</p>
            
            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Category</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all appearance-none"
                  value={newTicketCategory}
                  onChange={(e) => setNewTicketCategory(e.target.value)}
                >
                  <option>General</option>
                  <option>Booking Issue</option>
                  <option>Hosting Question</option>
                  <option>Payment/Refund</option>
                  <option>Account Safety</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Subject</label>
                <input 
                  type="text"
                  placeholder="e.g., Cannot update my bank details"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-4">Priority</label>
                <div className="grid grid-cols-2 gap-3">
                  {['low', 'medium', 'high', 'urgent'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTicketPriority(p)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        newTicketPriority === p 
                          ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="flex-1 py-4 text-sm font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 text-sm font-black text-white bg-slate-900 hover:bg-rose-500 rounded-2xl transition-all shadow-xl shadow-slate-900/10"
                >
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Chat Modal */}
      {activeTicket && (
        <SupportChatModal 
          ticket={activeTicket}
          currentUser={currentUser}
          onClose={() => { setActiveTicket(null); fetchTickets(); }}
        />
      )}
    </div>
  );
}

export default HelpCenter;
