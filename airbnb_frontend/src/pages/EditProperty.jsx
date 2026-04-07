import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price_per_night: "",
    bedrooms: 1,
    bathrooms: 1,
    guests: 1,
    property_type: "apartment",
    image: "",
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

  const submitForm = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    // Only send fields that exist in the form state
    const allowedFields = ['title', 'description', 'location', 'price_per_night', 'bedrooms', 'bathrooms', 'guests', 'property_type'];
    allowedFields.forEach(key => {
      formData.append(key, form[key]);
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
          console.error(err);
          return err.response?.data?.error || "failed to update property";
        },
      }
    );
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-lg border border-slate-100 p-8">
        <h1 className="text-4xl font-bold mb-8">Edit Property</h1>

        <form onSubmit={submitForm} className="grid md:grid-cols-2 gap-5">
          <input name="title" value={form.title} onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3 md:col-span-2" required />
          <textarea name="description" value={form.description} onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3 md:col-span-2 h-32" required />
          <input name="location" value={form.location} onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3" required />
          <input name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3" required />
          <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3" required />
          <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3" required />
          <input name="guests" type="number" value={form.guests} onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3" required />

          <select name="property_type" value={form.property_type} onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3">
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="house">House</option>
            <option value="room">Room</option>
          </select>

          <div className="md:col-span-2 space-y-4 py-4 border-t border-slate-100 mt-2">
            <label className="block font-semibold text-slate-700 mb-2">Image Option:</label>
            <div className="flex gap-4 mb-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${imageChoice === 'url' ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-slate-50'}`}>
                <input type="radio" name="imageChoice" value="url" checked={imageChoice === 'url'} onChange={() => setImageChoice('url')} className="hidden" />
                <span className={imageChoice === 'url' ? 'text-rose-600 font-bold' : 'text-slate-500'}>Paste Link</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${imageChoice === 'file' ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-slate-50'}`}>
                <input type="radio" name="imageChoice" value="file" checked={imageChoice === 'file'} onChange={() => setImageChoice('file')} className="hidden" />
                <span className={imageChoice === 'file' ? 'text-rose-600 font-bold' : 'text-slate-500'}>Upload Photo</span>
              </label>
            </div>

            {imageChoice === "url" ? (
              <input name="image" value={form.image || ""} onChange={handleChange} placeholder="Enter image URL" className="w-full border border-slate-200 rounded-2xl px-4 py-3" />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
                  {imageFile && <span className="text-sm text-green-600">New file selected!</span>}
                </div>
                {form.image_file && !imageFile && <p className="text-xs text-slate-400 italic">Current file: {form.image_file.split('/').pop()}</p>}
              </div>
            )}
          </div>

          <button className="md:col-span-2 bg-rose-500 hover:bg-slate-900 text-white py-4 rounded-2xl font-semibold transition mt-4 shadow-lg active:scale-95">
            Update Property
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProperty;