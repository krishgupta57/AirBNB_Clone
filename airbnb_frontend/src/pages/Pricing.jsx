import { useNavigate } from "react-router-dom";
import { Check, Zap, Star, Crown, ShieldCheck } from "lucide-react";
import { getUser } from "../utils/auth";

const PLANS = [
  {
    id: "trial",
    name: "Trial",
    price: "0",
    listings: "2",
    icon: <Zap className="text-blue-500" />,
    features: ["WiFi", "Kitchen", "Essentials"],
    color: "blue",
    description: "Start your hosting journey for free."
  },
  {
    id: "standard",
    name: "Standard",
    price: "1,999",
    listings: "10",
    icon: <Star className="text-amber-500" />,
    features: ["WiFi", "Kitchen", "Essentials", "TV", "Air Conditioning", "Dedicated Workspace"],
    color: "amber",
    description: "The perfect setup for professional hosts."
  },
  {
    id: "premium",
    name: "Premium",
    price: "4,999",
    listings: "50",
    icon: <Crown className="text-rose-500" />,
    features: ["WiFi", "Kitchen", "Essentials", "TV", "Air Conditioning", "Dedicated Workspace", "Gym", "Parking", "Breakfast", "Private Entrance"],
    color: "rose",
    description: "Built for full-time hospitality managers."
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: "9,999",
    listings: "Unlimited",
    icon: <ShieldCheck className="text-slate-900" />,
    features: ["WiFi", "Kitchen", "Essentials", "TV", "Air Conditioning", "Dedicated Workspace", "Gym", "Parking", "Breakfast", "Private Entrance", "Pool", "Hot Tub", "EV Charging", "Helipad", "Airport Shuttle"],
    color: "slate",
    description: "Scale your empire without any limits."
  }
];

function Pricing() {
  const navigate = useNavigate();
  const user = getUser();
  const currentTier = user?.subscription_tier || "trial";

  const handleSelectPlan = (planId) => {
    if (planId === "trial") {
      navigate("/host-dashboard");
      return;
    }
    navigate(`/subscription-checkout?plan=${planId}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Choose your hosting plan</h1>
          <p className="text-xl text-slate-500 font-medium">Power up your listing potential and reach more guests.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col ${currentTier === plan.id ? 'border-rose-500 shadow-xl' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-${plan.color}-50`}>
                  {plan.icon}
                </div>
                {currentTier === plan.id && (
                  <span className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Active</span>
                )}
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">{plan.description}</p>

              <div className="mb-8 border-b border-slate-50 pb-8 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
                <span className="text-slate-400 font-bold text-sm">/month</span>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                <div className="flex items-center gap-3 text-slate-800 font-bold">
                  <Check className="text-green-500" size={18} />
                  <span>{plan.listings} Listings Max</span>
                </div>
                {plan.features.slice(0, 8).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                    <Check className="text-slate-300" size={16} />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.features.length > 8 && (
                  <p className="text-xs text-rose-500 font-bold pl-7">+ {plan.features.length - 8} More Premium Amenities</p>
                )}
              </div>

              <button 
                onClick={() => handleSelectPlan(plan.id)}
                disabled={currentTier === plan.id}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  currentTier === plan.id 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : (plan.id === 'trial' ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white hover:shadow-lg hover:shadow-rose-200')
                }`}
              >
                {currentTier === plan.id ? 'Current Plan' : (plan.id === 'trial' ? 'Get Started' : 'Upgrade Now')}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white mb-4">Need a custom enterprise solution?</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">If you are managing more than 100 properties, we offer dedicated account managers and API integration support.</p>
            <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-rose-500 hover:text-white transition-all">Contact Sales</button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
