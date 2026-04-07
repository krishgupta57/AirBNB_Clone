import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { Loader2, Mail } from "lucide-react";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please register again.");
      navigate("/register");
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("verify-otp/", {
        email: email,
        otp: otpString,
      });
      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 text-center">
        <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-rose-500" />
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-2">Verify your Email</h2>
        <p className="text-slate-500 mb-8">
          We&apos;ve sent a 6-digit code to <br />
          <span className="font-semibold text-slate-800">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-rose-500 focus:ring-0 transition-all outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-rose-500 text-white py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Verify Identity"}
          </button>
        </form>

        <p className="mt-8 text-slate-500 text-sm">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={() => toast.success("Feature coming soon!")}
            className="text-rose-500 font-bold hover:underline"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
