import { useState, useEffect, useRef } from "react";
import API from "../api";
import { getUser } from "../utils/auth";
import { Camera, Edit3, Save, X, Mail, Phone, User as UserIcon, Shield, FileText } from "lucide-react";
import toast from "react-hot-toast";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("profile/");
      setUserData(res.data);
      setFormData({
        phone: res.data.phone || "",
        bio: res.data.bio || "",
      });
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("phone", formData.phone);
    data.append("bio", formData.bio);
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }

    try {
      const res = await API.patch("profile/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUserData(res.data);
      // Update local storage user data
      const currentLocalUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentLocalUser, ...res.data }));
      
      setIsEditing(false);
      setAvatarFile(null);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
    </div>
  );

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 h-48 relative">
           {!isEditing && (
             <button 
               onClick={() => setIsEditing(true)}
               className="absolute bottom-6 right-8 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-full font-black text-sm flex items-center gap-2 transition-all border border-white/30"
             >
                <Edit3 size={16} />
                Edit Profile
             </button>
           )}
        </div>

        <div className="px-10 pb-10">
          <div className="flex flex-col md:flex-row gap-8 -mt-16 items-start">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl overflow-hidden relative">
                <div className="w-full h-full rounded-[2rem] bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-50">
                  {avatarPreview || userData?.avatar ? (
                    <img 
                      src={avatarPreview || userData?.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-5xl font-black text-slate-300">
                      {userData?.username?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                
                {isEditing && (
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="text-white" size={32} />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            {/* Basic Info Header */}
            <div className="flex-1 mt-16 md:mt-20">
               <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{userData?.username}</h1>
                  <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                     <Shield size={10} />
                     {userData?.role}
                  </span>
               </div>
               <p className="text-slate-400 font-bold mt-1 text-lg">{userData?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-12 space-y-10">
            {/* Bio Section */}
            <div>
               <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  <FileText size={14} className="text-rose-500" />
                  About Me
               </label>
               {isEditing ? (
                 <textarea
                   name="bio"
                   value={formData.bio}
                   onChange={handleInputChange}
                   placeholder="Share a bit about yourself..."
                   className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-700 font-bold focus:border-rose-500/20 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all h-32 resize-none"
                 />
               ) : (
                 <p className="text-slate-600 font-bold leading-relaxed text-lg bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                    {userData?.bio || "No bio added yet. Tell the community about yourself!"}
                 </p>
               )}
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <Phone size={12} className="text-rose-500" />
                     Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-slate-700 font-bold focus:border-rose-500/20 outline-none transition-all"
                    />
                  ) : (
                    <div className="px-5 py-3.5 bg-slate-50/50 rounded-2xl border border-slate-50 font-black text-slate-800">
                       {userData?.phone || "Not provided"}
                    </div>
                  )}
               </div>

               <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <Mail size={12} className="text-rose-500" />
                     Account Email
                  </label>
                  <div className="px-5 py-3.5 bg-slate-50/30 rounded-2xl border border-slate-50 font-black text-slate-400">
                     {userData?.email}
                  </div>
               </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center gap-4 pt-6">
                 <button 
                   type="submit"
                   className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200"
                 >
                    <Save size={18} />
                    Save Changes
                 </button>
                 <button 
                   type="button"
                   onClick={() => {
                     setIsEditing(false);
                     setAvatarPreview(null);
                     setAvatarFile(null);
                     setFormData({
                       phone: userData?.phone || "",
                       bio: userData?.bio || "",
                     });
                   }}
                   className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all"
                 >
                    Cancel
                 </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;