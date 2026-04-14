import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  MapPin,
  X,
  Search as SearchIcon,
  ChevronDown,
} from "lucide-react";
import API from "../api";
import PropertyCard from "../components/PropertyCard";
import SectionTitle from "../components/SectionTitle";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    property_type: searchParams.get("property_type") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    guests: searchParams.get("guests") || "",
    sort: searchParams.get("sort") || "newest",
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Build query string from filters state
      let queryParts = [];
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParts.push(`${key}=${encodeURIComponent(filters[key])}`);
        }
      });
      const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      
      const res = await API.get(`properties/${queryString}`);
      setProperties(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Sync state with URL changes (e.g. from Navbar)
  useEffect(() => {
    const newSearch = searchParams.get("search") || "";
    setFilters(prev => ({ ...prev, search: newSearch }));
  }, [searchParams]);

  // Fetch whenever filters change
  useEffect(() => {
    fetchProperties();
    // Update URL to match filters (keeps URL shareable)
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) params[key] = filters[key];
    });
    setSearchParams(params);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      search: searchParams.get("search") || "",
      min_price: "",
      max_price: "",
      property_type: "",
      bedrooms: "",
      bathrooms: "",
      guests: "",
      sort: "newest",
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container-custom py-8">
        {/* Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {filters.search ? `Stays in ${filters.search}` : "All Stays"}
            </h1>
            <p className="text-slate-500 mt-1">
              {properties.length} properties found
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-100 hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600 transition font-semibold text-slate-700"
            >
              <SlidersHorizontal size={20} />
              Filters
            </button>

            <select 
              name="sort" 
              value={filters.sort} 
              onChange={handleFilterChange}
              className="px-5 py-3 rounded-2xl border-2 border-slate-100 font-semibold text-slate-700 outline-none hover:border-slate-300 transition appearance-none bg-white pr-10 relative"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-[2rem] h-[400px]"></div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm mb-6">
               <SearchIcon size={32} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">No properties found</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              We couldn't find any properties matching your current filters. Try adjusting your search or clearing all filters.
            </p>
            <button 
              onClick={clearFilters}
              className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-rose-500 transition"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-900">Advanced Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
              {/* Price Range */}
              <div>
                <label className="text-lg font-bold text-slate-800 mb-4 block">Price Range (per night)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Min Price</span>
                    <input name="min_price" type="number" value={filters.min_price} onChange={handleFilterChange} placeholder="₹ 0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Max Price</span>
                    <input name="max_price" type="number" value={filters.max_price} onChange={handleFilterChange} placeholder="₹ 10,000+" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="text-lg font-bold text-slate-800 mb-4 block">Property Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['apartment', 'villa', 'house', 'room'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilters({ ...filters, property_type: filters.property_type === type ? "" : type })}
                      className={`py-3 rounded-xl border-2 transition capitalize font-semibold ${filters.property_type === type ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="text-lg font-bold text-slate-800 mb-4 block">Rooms & Guests</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Guests</span>
                    <input name="guests" type="number" value={filters.guests} onChange={handleFilterChange} min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Bedrooms</span>
                    <input name="bedrooms" type="number" value={filters.bedrooms} onChange={handleFilterChange} min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Bathrooms</span>
                    <input name="bathrooms" type="number" value={filters.bathrooms} onChange={handleFilterChange} min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex items-center justify-between">
              <button 
                onClick={clearFilters} 
                className="text-slate-500 font-bold hover:text-slate-900 transition underline underline-offset-4"
              >
                Clear all filters
              </button>
              <button 
                onClick={() => setShowFilters(false)} 
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-rose-500 transition shadow-lg shadow-slate-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
