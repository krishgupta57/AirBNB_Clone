import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const { uidb64, token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await API.get(`verify-email/${uidb64}/${token}/`);
        setStatus("success");
        setMessage(response.data.message);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.error || "Invalid or expired verification link.");
      }
    };

    verify();
  }, [uidb64, token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <h2 className="text-2xl font-bold text-slate-800">Verifying your email...</h2>
            <p className="text-slate-500">Please wait while we activate your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
            <h2 className="text-2xl font-bold text-slate-800">Registration Complete!</h2>
            <p className="text-slate-600">{message}</p>
            <Link
              to="/login"
              className="mt-6 w-full bg-slate-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="w-16 h-16 text-rose-500" />
            <h2 className="text-2xl font-bold text-slate-800">Verification Failed</h2>
            <p className="text-slate-600">{message}</p>
            <div className="mt-6 flex flex-col gap-3 w-full">
              <Link
                to="/register"
                className="w-full bg-slate-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
              >
                Try Registering Again
              </Link>
              <Link to="/" className="text-slate-500 font-medium hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
