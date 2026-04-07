import { Link } from "react-router-dom";
import { BedDouble, Bath, Users, MapPin, Star } from "lucide-react";

function PropertyCard({ property }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
      <div className="relative">
        <img
          src={property.image || "https://via.placeholder.com/600x400"}
          alt={property.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-rose-500">
          ₹{property.price_per_night}/night
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{property.title}</h3>
            <p className="text-slate-500 flex items-center gap-1 mt-1">
              <MapPin size={16} /> {property.location}
            </p>
          </div>

          <div className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star size={16} fill="currentColor" />
            {property.average_rating}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-slate-500 text-sm mt-4">
          <span className="flex items-center gap-1"><BedDouble size={16} /> {property.bedrooms} Beds</span>
          <span className="flex items-center gap-1"><Bath size={16} /> {property.bathrooms} Baths</span>
          <span className="flex items-center gap-1"><Users size={16} /> {property.guests} Guests</span>
        </div>

        <Link
          to={`/property/${property.id}`}
          className="mt-5 inline-block w-full text-center bg-slate-900 hover:bg-rose-500 text-white py-3 rounded-xl font-semibold transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default PropertyCard;