import { useEffect, useState } from "react";
import {
  Building2,
  Home as HomeIcon,
  Tent,
  Castle,
  ShieldCheck,
  BadgeCheck,
  Clock3,
  Search,
  HeartHandshake,
} from "lucide-react";
import API from "../api";
import PropertyCard from "../components/PropertyCard";
import SectionTitle from "../components/SectionTitle";
import { Link } from "react-router-dom";

function Home() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");

  const fetchProperties = async () => {
    try {
      const res = await API.get(`properties/?search=${search}&limit=6`);
      setProperties(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div>
      {/* Section 1: Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 text-white">
        <div className="container-custom py-12 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-xs md:text-sm mb-5">
              Premium stays, trusted hosts, instant comfort
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Find Your Dream Stay Anywhere, Anytime
            </h1>
            <p className="mt-6 text-lg text-white/90 max-w-xl">
              Explore modern apartments, luxury villas, cozy rooms, and unique spaces with a professional booking platform built for comfort and convenience.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition"
              >
                Start Exploring
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl border border-white/60 font-semibold hover:bg-white/10 transition"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 mt-8 lg:mt-0">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
              className="rounded-2xl md:rounded-3xl h-40 md:h-72 w-full object-cover shadow-2xl"
            />
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
              className="rounded-2xl md:rounded-3xl h-40 md:h-72 w-full object-cover shadow-2xl md:mt-10"
            />
            <img
              src="https://images.unsplash.com/photo-1494526585095-c41746248156"
              className="rounded-2xl md:rounded-3xl h-40 md:h-72 w-full object-cover shadow-2xl md:-mt-8"
            />
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
              className="rounded-2xl md:rounded-3xl h-40 md:h-72 w-full object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Search */}
      <section className="-mt-10 relative z-10">
        <div className="container-custom">
          <div className="bg-white rounded-3xl shadow-xl p-5 md:p-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search by title or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-5 py-4"
              />
            </div>
            <button
              onClick={fetchProperties}
              className="w-full md:w-auto inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-semibold transition"
            >
              <Search size={20} />
              Search Stays
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: Categories */}
      <section className="py-12 md:py-20">
        <div className="container-custom">
          <SectionTitle
            badge="Popular Categories"
            title="Choose the Stay That Matches Your Style"
            subtitle="Explore a wide variety of professionally listed stays for every type of traveler."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Building2 size={34} />, title: "Apartments", desc: "Modern city apartments for work and leisure." },
              { icon: <HomeIcon size={34} />, title: "Family Homes", desc: "Comfortable homes perfect for families." },
              { icon: <Castle size={34} />, title: "Luxury Villas", desc: "Elegant stays with premium experiences." },
              { icon: <Tent size={34} />, title: "Unique Stays", desc: "Memorable spaces for special trips." },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition">
                <div className="text-rose-500">{item.icon}</div>
                <h3 className="text-xl font-bold mt-5">{item.title}</h3>
                <p className="text-slate-500 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Featured Listings */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container-custom">
          <SectionTitle
            badge="Featured Listings"
            title="Top Rated Properties Loved by Guests"
            subtitle="Browse curated listings with beautiful interiors, trusted hosts, and excellent reviews."
          />

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {properties.length > 0 ? (
              properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <p className="text-slate-500">No properties found.</p>
            )}
          </div>
        </div>
      </section>

      {/* Section 5: Why Choose Us */}
      <section className="py-12 md:py-20">
        <div className="container-custom">
          <SectionTitle
            badge="Why AirBNB"
            title="Built for Reliable, Elegant, and Secure Booking"
            subtitle="A better experience for guests and a smarter platform for hosts."
          />

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="text-emerald-500" size={34} />,
                title: "Safe & Trusted",
                desc: "Secure account flow, protected bookings, and trusted host listings.",
              },
              {
                icon: <BadgeCheck className="text-blue-500" size={34} />,
                title: "Quality Homes",
                desc: "Carefully curated properties with complete details and transparent pricing.",
              },
              {
                icon: <Clock3 className="text-amber-500" size={34} />,
                title: "Fast Experience",
                desc: "Quick browsing, instant booking flow, and a smooth guest journey.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                {item.icon}
                <h3 className="text-2xl font-bold mt-4">{item.title}</h3>
                <p className="text-slate-500 mt-3">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: How It Works */}
      <section className="py-12 md:py-20 bg-slate-900 text-white">
        <div className="container-custom">
          <SectionTitle
            badge="How It Works"
            title="Book Your Next Stay in 3 Simple Steps"
            subtitle="A modern process designed to save time and improve user experience."
          />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { no: "01", title: "Search & Explore", desc: "Find stays by location, property name, and preferences." },
              { no: "02", title: "Book with Ease", desc: "Choose dates, review pricing, and reserve instantly." },
              { no: "03", title: "Enjoy the Stay", desc: "Travel with confidence and share your review afterward." },
            ].map((step, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <div className="text-5xl font-extrabold text-rose-400">{step.no}</div>
                <h3 className="text-2xl font-bold mt-4">{step.title}</h3>
                <p className="text-slate-300 mt-3">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Become a Host */}
      <section className="py-12 md:py-20">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-[2rem] p-10 md:p-14 text-white grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block px-4 py-1 rounded-full bg-white/10 mb-4">
                Hosting Opportunity
              </span>
              <h2 className="text-4xl font-bold leading-tight">
                Turn Your Property into a Premium Hosting Business
              </h2>
              <p className="mt-5 text-slate-300">
                Add your listing, manage bookings, track your properties, and offer guests a memorable experience through a clean host dashboard.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition"
              >
                <HeartHandshake size={20} />
                Become a Host
              </Link>
            </div>

            <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold">Host Benefits</h3>
              <ul className="mt-5 space-y-4 text-slate-600">
                <li>• Easy property management</li>
                <li>• Attractive property profile pages</li>
                <li>• Better visibility to guests</li>
                <li>• Booking-ready listing platform</li>
                <li>• Strong portfolio project architecture</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Testimonials */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container-custom">
          <SectionTitle
            badge="Guest Stories"
            title="What Our Users Say About Their Experience"
            subtitle="Beautiful stays, smooth booking, and memorable journeys."
          />

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Aarav Mehta",
                review: "The interface is clean, the booking flow is simple, and the property options feel premium. Loved the overall experience.",
              },
              {
                name: "Priya Sharma",
                review: "I found a wonderful villa quickly. The property details were clear and the design made everything easy to navigate.",
              },
              {
                name: "Rohan Verma",
                review: "As a host, I liked how simple it was to add my property and manage it from one place. Very polished UI.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-slate-50 border border-slate-100 rounded-3xl p-8 shadow-sm">
                <p className="text-slate-600 leading-7">“{item.review}”</p>
                <h4 className="mt-5 text-lg font-bold">{item.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: FAQ + CTA */}
      <section className="py-12 md:py-20">
        <div className="container-custom grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <SectionTitle
              badge="FAQs"
              title="Everything You Need to Know"
              subtitle="Quick answers to common questions from guests and hosts."
            />

            <div className="space-y-4">
              {[
                ["Can guests book multiple stays?", "Yes, guests can book multiple available properties using their account."],
                ["Can hosts manage their listings?", "Yes, hosts can add, update, and delete their own properties."],
                ["Is wishlist supported?", "Yes, users can save favorite properties to wishlist and access them later."],
                ["Can users leave reviews?", "Yes, authenticated users can submit reviews and ratings for properties."],
              ].map(([q, a], index) => (
                <div key={index} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-lg">{q}</h3>
                  <p className="text-slate-500 mt-2">{a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-rose-500 text-white rounded-[2rem] p-10 shadow-xl">
            <h3 className="text-4xl font-bold leading-tight">
              Start your next journey with confidence
            </h3>
            <p className="mt-4 text-white/90">
              Create an account, explore featured properties, and book your ideal stay in just a few clicks.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-2xl bg-white text-slate-900 font-semibold"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl border border-white/60"
              >
                Login Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;