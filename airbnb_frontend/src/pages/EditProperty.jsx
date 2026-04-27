import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { Lock, Check } from "lucide-react";
import { getUser } from "../utils/auth";

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

function EditProperty() {
  const { id } = useParams();
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
  const [imageChoice, setImageChoice] = useState("url"); // "url" or "file"

  const loadProperty = async () => {
    try {
      const res = await API.get(`properties/${id}/`);
      setForm(res.data);
      if (res.data.image_file) {
        setImageChoice("file");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load property");
    }
  };

  useEffect(() => {
    loadProperty();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const isAmenityAllowed = (am) => {
    if (tier === "ultimate") return true;
    if (tier === "premium") return !AMENITY_CATEGORIES.ultimate.includes(am);
    if (tier === "standard") return AMENITY_CATEGORIES.trial.includes(am) || AMENITY_CATEGORIES.standard.includes(am);
    return AMENITY_CATEGORIES.trial.includes(am);
  };

  const toggleAmenity = (am) => {
    if (!isAmenityAllowed(am)) {
      toast.error(`Your ${tier} plan doesn't support ${am}. Upgrade to unlock!`);
      return;
    }
    const isSelected = form.amenities?.includes(am);
    const newAm = isSelected 
      ? form.amenities.filter(a => a !== am)
      : [...(form.amenities || []), am];
    setForm({...form, amenities: newAm});
  };

  const submitForm = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const allowedFields = ['title', 'description', 'location', 'price_per_night', 'bedrooms', 'bathrooms', 'guests', 'property_type', 'status', 'amenities'];
    allowedFields.forEach(key => {
      if (key === "amenities") {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    });

    if (imageChoice === "file") {
      if (imageFile) {
        formData.append("image_file", imageFile);
      }
    } else {
      formData.append("image", form.image || "");
    }

    toast.promise(
      API.put(`properties/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      {
        loading: "updating property details...",
        success: () => {
          navigate("/my-properties");
          return "property updated successfully!";
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
          return "Failed to update property";
        },
      }
    );
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-8">Edit Property</h1>

        <form onSubmit={submitForm} className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-4 mb-4">
            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Property Type</label>
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
                { id: "active", label: "Active" },
                { id: "maintenance", label: "Maintenance" },
                { id: "inactive", label: "Inactive" }
              ].map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setForm({ ...form, status: s.id })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                    form.status === s.id 
                      ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-md' 
                      : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-medium outline-none focus:border-rose-500 focus:bg-white transition" required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-medium outline-none focus:border-rose-500 focus:bg-white transition h-32" required />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-medium outline-none focus:border-rose-500 focus:bg-white transition" required />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Price per Night</label>
              <input name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-medium outline-none focus:border-rose-500 focus:bg-white transition" required />
            </div>
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
                const isSelected = form.amenities?.includes(am);
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
            <div className="flex gap-4 mb-4">
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
              <input name="image" value={form.image || ""} onChange={handleChange} placeholder="Enter image URL" className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl px-5 py-4 font-medium outline-none focus:border-rose-500 focus:bg-white transition mt-2" />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
                  {imageFile && <span className="text-sm text-green-600 font-bold">New file selected!</span>}
                </div>
                {form.image_file && !imageFile && <p className="text-xs text-slate-400 italic mt-1 ml-1">Current file: {form.image_file.split('/').pop()}</p>}
              </div>
            )}
          </div>

          <button className="md:col-span-2 py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xl tracking-tight hover:bg-rose-500 transition-all shadow-2xl shadow-slate-200 active:scale-95 mt-4">
            Update Listing
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProperty;