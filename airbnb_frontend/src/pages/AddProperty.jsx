import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

function AddProperty() {
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      await API.post("properties/", form);
      toast.success("Property added successfully");
      navigate("/my-properties");
    } catch (error) {
      console.log(error.response?.data);
      toast.error("Failed to add property");
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-lg border border-slate-100 p-8">
        <h1 className="text-4xl font-bold mb-8">Add New Property</h1>

        <form onSubmit={submitForm} className="grid md:grid-cols-2 gap-5">
          <input name="title" placeholder="Property title" onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3 md:col-span-2" required />
          <textarea name="description" placeholder="Description" onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3 md:col-span-2 h-32" required />
          <input name="location" placeholder="Location" onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3" required />
          <input name="price_per_night" type="number" placeholder="Price per night" onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3" required />
          <input name="bedrooms" type="number" placeholder="Bedrooms" onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3" required />
          <input name="bathrooms" type="number" placeholder="Bathrooms" onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3" required />
          <input name="guests" type="number" placeholder="Guests" onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3" required />

          <select name="property_type" onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3">
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="house">House</option>
            <option value="room">Room</option>
          </select>

          <input name="image" placeholder="Image URL" onChange={handleChange} className="border border-slate-200 rounded-2xl px-4 py-3 md:col-span-2" />

          <button className="md:col-span-2 bg-slate-900 hover:bg-rose-500 text-white py-4 rounded-2xl font-semibold transition">
            Save Property
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProperty;