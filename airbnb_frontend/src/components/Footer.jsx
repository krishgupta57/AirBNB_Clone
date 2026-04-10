function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-10 md:mt-20">
      <div className="container-custom py-10 md:py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-2xl font-extrabold text-rose-500">
            Air<span className="text-white">BNB</span>
          </h3>
          <p className="mt-3 text-slate-400">
            Discover unique homes, premium villas, and unforgettable stays with a modern booking experience.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-slate-400">
            <li>Homes</li>
            <li>Villas</li>
            <li>Apartments</li>
            <li>Hostels</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Hosting</h4>
          <ul className="space-y-2 text-slate-400">
            <li>Become a Host</li>
            <li>Host Dashboard</li>
            <li>Safety Support</li>
            <li>Community</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-slate-400">
            <li>Help Center</li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
            <li>Contact Us</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container-custom py-5 text-sm text-slate-500 text-center">
          © 2026 AirBNB. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;