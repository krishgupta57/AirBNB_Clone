import { useState, useEffect } from "react";
import API from "../api";
import { 
  ShieldCheck, 
  Search, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Filter,
  User,
  ChevronRight,
  Inbox
} from "lucide-react";
import toast from "react-hot-toast";
import SupportChatModal from "../components/SupportChatModal";
import { getUser } from "../utils/auth";

function AdminSupportManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const currentUser = getUser();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get("support-tickets/");
      setTickets(res.data);
    } catch (err) {
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                          t.user.username.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-rose-500" size={32} />
            Support Management
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Platform Support Tickets & Queries</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => setFilter('all')}>All</div>
           <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer transition-all ${filter === 'open' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => setFilter('open')}>Open</div>
           <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer transition-all ${filter === 'resolved' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => setFilter('resolved')}>Resolved</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Statistics */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl"></div>
              <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-2">Pending Inquiries</p>
              <h3 className="text-4xl font-black">{tickets.filter(t => t.status === 'open').length}</h3>
              <p className="text-xs font-medium text-slate-400 mt-4 leading-relaxed">Tickets awaiting initial response from staff.</p>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 border border-slate-50">
              <h4 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Quick Search</h4>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Ticket ID or User..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-xs font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
           </div>
        </div>

        {/* Tickets List */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-slate-200 shadow-sm">
               <Inbox size={48} className="mx-auto text-slate-200 mb-4" />
               <h3 className="text-lg font-black text-slate-900">No tickets found</h3>
               <p className="text-slate-400 text-sm font-medium">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div 
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                      ticket.status === 'open' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{ticket.category}</span>
                        <span className="text-[10px] font-bold text-slate-300">Ticket #{ticket.id}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-500 transition-colors">{ticket.subject}</h3>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                           {ticket.user.avatar ? <img src={ticket.user.avatar} className="w-full h-full object-cover" /> : <User size={10} className="text-slate-400" />}
                         </div>
                         <p className="text-xs font-bold text-slate-500 tracking-tight">{ticket.user.username} <span className="text-slate-300 font-medium">requested support</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          ticket.priority === 'urgent' ? 'bg-rose-500 border-rose-400 text-white shadow-sm' :
                          ticket.priority === 'high' ? 'bg-orange-500 border-orange-400 text-white' :
                          ticket.priority === 'medium' ? 'bg-blue-500 border-blue-400 text-white' :
                          'bg-slate-500 border-slate-400 text-white'
                       }`}>
                         {ticket.priority}
                       </span>
                    </div>

                    <div className="text-right min-w-[80px]">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                       <div className="flex items-center gap-2 justify-end">
                          <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${ticket.status === 'open' ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {ticket.status}
                          </span>
                       </div>
                    </div>
                    
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                       <ChevronRight size={20} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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

export default AdminSupportManagement;
