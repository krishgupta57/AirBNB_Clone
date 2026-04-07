import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container-custom py-24 text-center">
      <h1 className="text-7xl font-extrabold text-slate-900">404</h1>
      <p className="text-slate-500 text-xl mt-4">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="inline-block mt-8 px-6 py-3 rounded-2xl bg-rose-500 text-white font-semibold"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;