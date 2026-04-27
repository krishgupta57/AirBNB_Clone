import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { getUser } from "../utils/auth";
import { Check, Lock, Info } from "lucide-react";

const AMENITY_CATEGORIES = {
  trial: ["WiFi", "Kitchen", "Essentials"],
  standard: ["TV", "Air Conditioning", "Dedicated Workspace"],
  premium: ["Gym", "Parking", "Breakfast", "Private Entrance"],
  ultimate: ["Pool", "Hot Tub", "EV Charging", "Helipad", "Airport Shuttle"],
};

const ALL_AMENITIES = [
  ...AMENITY_CATEGORIES.trial,
  ...AMENITY_CATEGORIES.standard,
  ...AMENITY_CATEGORIES.premium,
  ...AMENITY_CATEGORIES.ultimate,
];

function AddProperty() {
  const navigate = useNavigate();
  const user = getUser();
  const tier = user?.subscription_tier || "trial";

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price_per_night: "",
    bedrooms: 1,
    bathrooms: 1,
    guests: 1,
    property_type: "apartment",
    status: "active",
    image: "",
    amenities: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imageChoice, setImageChoice] = useState("url");
  const [usage, setUsage] = useState({ count: 0, limit: 2 });
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await API.get("profile/");
        // In a real app, we'd also get the current count. 
        // For now we'll fetch 'my' properties to get count.
        const propsRes = await API.get("properties/my/");
        const limits = { trial: 2, standard: 10, premium: 50, ultimate: 99999 };
        setUsage({ 
          count: propsRes.data.length, 
          limit: limits[res.data.subscription_tier] || 2,
          tier: res.data.subscription_tier
        });
      } catch (error) {
        console.error("Error fetching usage", error);
      } finally {
        setLoadingUsage(false);
      }
    };
    fetchUsage();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (am) => {
    const isAllowed = isAmenityAllowed(am);
    if (!isAllowed) {
      toast.error(`Upgrade to unlock ${am}!`);
      return;
    }

    const newAm = form.amenities.includes(am)
      ? form.amenities.filter((a) => a !== am)
      : [...form.amenities, am];
    setForm({ ...form, amenities: newAm });
  };

  const isAmenityAllowed = (am) => {
    if (tier === "ultimate") return true;
    if (tier === "premium") return !AMENITY_CATEGORIES.ultimate.includes(am);
    if (tier === "standard") return AMENITY_CATEGORIES.trial.includes(am) || AMENITY_CATEGORIES.standard.includes(am);
    return AMENITY_CATEGORIES.trial.includes(am);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (usage.count >= usage.limit) {
      toast.error("Plan limit reached. Please upgrade.");
      return;
    }
    
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === "amenities") {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    });

    if (imageChoice === "file" && imageFile) {
      formData.append("image_file", imageFile);
      formData.delete("image");
    }

    toast.promise(
      API.post("properties/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
      {
        loading: "Creating your listing...",
        success: () => {
          navigate("/my-properties");
          return "Property added successfully!";
        },
        error: (err) => {
          const data = err.response?.data;
          if (typeof data === "string") return data;
          if (data?.error) return data.error;
          if (typeof data === "object") {
            const firstKey = Object.keys(data)[0];
            const firstError = data[firstKey];
            return Array.isArray(firstError) ? `${firstKey}: ${firstError[0]}` : `${firstKey}: ${firstError}`;
          }
          return "Failed to add property";
        },
      }
    );
  };

  const isLimitReached = !loadingUsage && usage.count >= usage.limit;

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Add New Property</h1>
            <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Listing {usage.count + 1} of {usage.limit === 99999 ? '∞' : usage.limit}</p>
          </div>
          {isLimitReached && (
            <Link to="/pricing" className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition shadow-lg shadow-rose-200 flex items-center gap-2">
              <Zap size={16} fill="currentColor" />
              Upgrade Plan
            </Link>
          )}
        </div>

        {isLimitReached && (
          <div className="mb-8 p-6 bg-rose-50 border-2 border-rose-100 rounded-[2rem] flex items-center gap-4 text-rose-700">
            <Info className="flex-shrink-0" />
            <p className="font-bold">You've reached your {usage.tier} plan limit. Please upgrade to create more listings.</p>
          </div>
        )}

        <form onSubmit={submitForm} className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-4 mb-4">
            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest ml-1">What type of place is this?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["apartment", "villa", "house", "room"].map((type) => (
                <div 
                  key={type}
                  onClick={() => setForm({ ...form, property_type: type })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                    form.property_type === type 
                      ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-md scale-105' 
                      : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-widest">{type}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 mb-4">
            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Property Availability Status</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "active", label: "Active", icon: <Check size={14} /> },
                { id: "maintenance", label: "Maintenance", icon: <Info size={14} /> },
                { id: "inactive", label: "Inactive", icon: <Lock size={14} /> }
              ].map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setForm({ ...form, status: s.id })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2 ${
                    form.status === s.id 
                      ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-md scale-105' 
                      : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    form.status === s.id ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {s.icon}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
            <input name="title" value={form.title} placeholder="e.g. Luxury Seaview Villa" onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-medium outline-none focus:border-rose-500 focus:bg-white transition" required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
            <textarea name="description" placeholder="Describe your beautiful home..." onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-medium outline-none focus:border-rose-500 focus:bg-white transition h-32" required />
          </div>

          <div>
             <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Location</label>
             <input name="location" placeholder="City, Country" onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-medium outline-none focus:border-rose-500 focus:bg-white transition" required />
          </div>

          <div>
             <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price per Night</label>
             <input 
               name="price_per_night" 
               type="number" 
               min="0"
               step="0.01"
               placeholder="₹" 
               onChange={handleChange} 
               className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-medium outline-none focus:border-rose-500 focus:bg-white transition" 
               required 
             />
          </div>

          <div className="grid grid-cols-3 gap-4 md:col-span-2">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-center">Beds</label>
              <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-bold text-center outline-none focus:border-rose-500 focus:bg-white transition" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-center">Baths</label>
              <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-bold text-center outline-none focus:border-rose-500 focus:bg-white transition" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-center">Guests</label>
              <input name="guests" type="number" value={form.guests} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-bold text-center outline-none focus:border-rose-500 focus:bg-white transition" />
            </div>
          </div>

          <div className="md:col-span-2 border-t border-slate-50 pt-8 mt-4">
            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-6 ml-1">Select Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {ALL_AMENITIES.map((am) => {
                const isAllowed = isAmenityAllowed(am);
                const isSelected = form.amenities.includes(am);
                return (
                  <div 
                    key={am}
                    onClick={() => toggleAmenity(am)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected 
                        ? 'border-rose-500 bg-rose-50 shadow-md' 
                        : isAllowed ? 'border-slate-50 bg-slate-50/50 hover:border-slate-200' : 'border-slate-50 bg-slate-50/30 opacity-60 grayscale'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isSelected ? 'text-rose-600' : 'text-slate-600'}`}>{am}</span>
                    {isSelected ? (
                      <Check size={16} className="text-rose-600" />
                    ) : !isAllowed ? (
                      <Lock size={14} className="text-slate-400" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 py-8 border-t border-slate-100 mt-4">
            <label className="block font-black text-slate-700 uppercase tracking-widest text-sm mb-4">Property Image</label>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setImageChoice('url')}
                className={`flex-1 p-4 rounded-2xl border-2 font-bold text-sm transition ${imageChoice === 'url' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
              >
                URL Link
              </button>
              <button 
                type="button"
                onClick={() => setImageChoice('file')}
                className={`flex-1 p-4 rounded-2xl border-2 font-bold text-sm transition ${imageChoice === 'file' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
              >
                Upload File
              </button>
            </div>

            {imageChoice === "url" ? (
              <input name="image" placeholder="https://images.unsplash.com/..." onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-medium outline-none focus:border-rose-500 focus:bg-white transition mt-2" />
            ) : (
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full mt-2" />
            )}
          </div>

          <button 
            disabled={isLimitReached}
            className={`md:col-span-2 py-5 rounded-[2rem] font-black text-xl tracking-tight transition-all shadow-2xl flex items-center justify-center gap-3 ${
              isLimitReached 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-rose-500 shadow-slate-200 active:scale-95'
            }`}
          >
            {isLimitReached ? <Lock size={20} /> : null}
            {isLimitReached ? 'LIMIT REACHED' : 'PUBLISH LISTING'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProperty;