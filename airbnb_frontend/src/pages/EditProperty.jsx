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

  const loadProperty = async () => {
    try {
      const res = await API.get(`properties/${id}/`);
      setForm(res.data);
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

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      await API.put(`properties/${id}/`, form);
      toast.success("Property updated successfully");
      navigate("/my-properties");
    } catch (error) {
      console.log(error.response?.data);
      toast.error("Failed to update property");
    }
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

          <input name="image" value={form.image || ""} onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3 md:col-span-2" />

          <button className="md:col-span-2 bg-rose-500 hover:bg-slate-900 text-white py-4 rounded-2xl font-semibold transition">
            Update Property
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProperty;