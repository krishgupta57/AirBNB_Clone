import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "guest",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      await API.post("register/", form);
      toast.success("Account created! Please check your Gmail.");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (error) {
      console.log(error.response?.data);
      toast.error("Registration failed");
    }
  };

  return (
    <div className="container-custom py-16">
      <div className="max-w-lg mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Create Account</h1>
          <p className="text-slate-500 mt-2">Join as a guest or host</p>
        </div>

        <form onSubmit={submitForm} className="space-y-5">
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3"
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3"
          />

          <select
            name="role"
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3"
          >
            <option value="guest">Guest</option>
            <option value="host">Host</option>
          </select>

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3"
            required
          />

          <input
            name="confirm_password"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3"
            required
          />

          <button className="w-full bg-rose-500 hover:bg-slate-900 text-white py-3.5 rounded-2xl font-semibold transition">
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-rose-500 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;