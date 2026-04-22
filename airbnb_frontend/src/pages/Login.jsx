import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("login/", form);

      console.log("Login response:", res.data);

      if (!res.data.access || !res.data.refresh) {
        toast.error("Login token not received from backend");
        setLoading(false);
        return;
      }

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      const profileRes = await API.get("profile/", {
        headers: {
          Authorization: `Bearer ${res.data.access}`,
        },
      });

      localStorage.setItem("user", JSON.stringify(profileRes.data));

      console.log("Saved access token:", localStorage.getItem("access"));
      console.log("Saved user:", localStorage.getItem("user"));

      toast.success("Login successful");
      if (profileRes.data.is_staff) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
      window.location.reload();
    } catch (error) {
      console.log("Login error:", error.response?.data || error.message);
      toast.error("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-16">
      <div className="max-w-md mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Login to continue your journey</p>
        </div>

        <form onSubmit={submitForm} className="space-y-5">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-rose-500 text-white py-3.5 rounded-2xl font-semibold transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-rose-500 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;