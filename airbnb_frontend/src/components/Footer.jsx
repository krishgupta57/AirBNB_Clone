function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-20">
      <div className="container-custom py-14 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-white">StayVista</h3>
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
        <div className="container-custom py-5 text-sm text-slate-500">
          © 2026 StayVista. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;