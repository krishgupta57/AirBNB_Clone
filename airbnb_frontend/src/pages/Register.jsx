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

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("register/", form);
      toast.success("Account Created: Please check your Gmail for the 6-digit verification code.");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (error) {
      const data = error.response?.data;
      let msg = "Registration Failed: Please ensure all fields are filled correctly.";
      if (data) {
        if (typeof data === 'string') msg = data;
        else if (data.error) msg = data.error;
        else if (data.username) msg = `Username: ${data.username[0]}`;
        else if (data.email) msg = `Email: ${data.email[0]}`;
        else if (data.password) msg = `Password: ${data.password[0]}`;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
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

          <button 
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-semibold transition ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-slate-900 text-white'}`}
          >
            {loading ? "Creating Account..." : "Register"}
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