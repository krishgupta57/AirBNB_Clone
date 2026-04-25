import { useState } from "react";
import API from "../api";
import { ShieldAlert, Key, Zap, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

function AdminSecretSetup() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("admin/users/", { master_key: key });
      setSuccess(true);
      toast.success("Genesis Promotion Successful!");
      // Update local storage to reflect admin status
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, role: 'admin', is_staff: true }));
      
      setTimeout(() => {
        window.location.href = "/admin";
      }, 2000);
    } catch (err) {
      toast.error("Invalid Master Key or Unauthorized Access");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 text-center">
        {!success ? (
          <>
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
               <ShieldAlert size={40} className="text-rose-500" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Admin Genesis</h1>
            <p className="text-slate-500 font-bold text-sm mb-10 leading-relaxed">
              Enter the master access key to initialize administrative control for this account.
            </p>

            <form onSubmit={handleSetup} className="space-y-6">
              <div className="relative">
                 <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="password" 
                   placeholder="Enter Master Key"
                   className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-rose-500/20 outline-none transition-all"
                   value={key}
                   onChange={(e) => setKey(e.target.value)}
                   required
                 />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {loading ? (
                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Zap size={18} className="text-amber-400 fill-amber-400" />
                    Claim Admin Access
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="py-10 animate-in fade-in zoom-in duration-500">
             <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={48} className="text-emerald-500" />
             </div>
             <h1 className="text-3xl font-black text-slate-900 mb-2">Access Granted</h1>
             <p className="text-slate-500 font-bold text-sm mb-6">
                Your account has been promoted to Super-Admin. Redirecting to Command Center...
             </p>
             <div className="h-1.5 w-48 bg-slate-100 mx-auto rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out]"></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSecretSetup;
