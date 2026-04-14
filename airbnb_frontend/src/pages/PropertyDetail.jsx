import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";
import { getUser } from "../utils/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [property, setProperty] = useState(null);
  const [booking, setBooking] = useState({
    property: id,
    check_in: "",
    check_out: "",
  });
  const [review, setReview] = useState({
    property: id,
    rating: 5,
    comment: "",
  });
  const [bookedDates, setBookedDates] = useState([]);

  const loadProperty = async () => {
    try {
      const [propRes, datesRes] = await Promise.all([
        API.get(`properties/${id}/`),
        API.get(`properties/${id}/booked_dates/`)
      ]);
      setProperty(propRes.data);
      if (datesRes.data) {
        const disabledDates = datesRes.data.map(dateStr => new Date(`${dateStr}T00:00:00`));
        setBookedDates(disabledDates);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load property details");
    }
  };

  useEffect(() => {
    loadProperty();
  }, [id]);

  const bookNow = async (e) => {
    e.preventDefault();
    if (!user) {
      return toast.error("Please login first");
    }

    if (!booking.check_in || !booking.check_out) {
      return toast.error("Please select dates first");
    }

    navigate(`/checkout?property=${id}&check_in=${booking.check_in}&check_out=${booking.check_out}`);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      return toast.error("Please login first");
    }

    try {
      await API.post("reviews/", review);
      toast.success("Review submitted");
      setReview({ property: id, rating: 5, comment: "" });
      loadProperty();
    } catch (error) {
      console.log(error.response?.data);
      toast.error("Review failed");
    }
  };

  const addWishlist = async () => {
    if (!user) {
      return toast.error("Please login first");
    }

    try {
      await API.post("wishlist/", { property: id });
      toast.success("Added to wishlist");
    } catch (error) {
      console.log(error.response?.data);
      toast.error("Wishlist action failed");
    }
  };

  if (!property) {
    return <div className="container-custom py-20 text-center">Loading...</div>;
  }

  return (
    <div className="container-custom py-12">
      <img
        src={property.image_file || property.image || "https://images.unsplash.com/photo-1518780664697-55e3ad937233"}
        className="w-full h-[250px] md:h-[450px] object-cover rounded-2xl md:rounded-[2rem] shadow-lg"
      />

      <div className="grid lg:grid-cols-3 gap-6 md:gap-10 mt-6 md:mt-10">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
            <h1 className="text-4xl font-bold">{property.title}</h1>
            <p className="text-slate-500 mt-2">{property.location}</p>
            <p className="mt-6 text-lg leading-8 text-slate-600">{property.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-slate-500 text-sm">Bedrooms</p>
                <h3 className="text-xl font-bold mt-1">{property.bedrooms}</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-slate-500 text-sm">Bathrooms</p>
                <h3 className="text-xl font-bold mt-1">{property.bathrooms}</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-slate-500 text-sm">Guests</p>
                <h3 className="text-xl font-bold mt-1">{property.guests}</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-slate-500 text-sm">Rating</p>
                <h3 className="text-xl font-bold mt-1">{property.average_rating}</h3>
              </div>
            </div>

            <button
              onClick={addWishlist}
              className="mt-8 px-6 py-3 rounded-2xl bg-pink-500 text-white font-semibold"
            >
              Add to Wishlist
            </button>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mt-8">
            <h2 className="text-3xl font-bold mb-6">Guest Reviews</h2>

            {property.reviews?.length === 0 ? (
              <p className="text-slate-500">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {property.reviews.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-2xl p-5">
                    <h3 className="font-bold">{item.user.username}</h3>
                    <p className="text-amber-500 mt-1">⭐ {item.rating}</p>
                    <p className="text-slate-600 mt-2">{item.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mt-8">
            <h2 className="text-3xl font-bold mb-6">Add Review</h2>

            <form onSubmit={submitReview} className="space-y-4">
              <input
                type="number"
                min="1"
                max="5"
                value={review.rating}
                onChange={(e) => setReview({ ...review, rating: e.target.value })}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
              />

              <textarea
                rows="5"
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                placeholder="Write your review here..."
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
              />

              <button className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-semibold">
                Submit Review
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-lg border border-slate-100 lg:sticky lg:top-24">
            <h2 className="text-3xl font-bold">₹{property.price_per_night}</h2>
            <p className="text-slate-500">per night</p>

            <form onSubmit={bookNow} className="space-y-4 mt-6">
              <div>
                <label className="block mb-2 font-medium">Check In</label>
                <div className="w-full relative">
                  <DatePicker 
                    selected={booking.check_in ? new Date(`${booking.check_in}T00:00:00`) : null}
                    onChange={(date) => {
                      if (date) {
                        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                        setBooking({ ...booking, check_in: localDate });
                      }
                    }}
                    excludeDates={bookedDates}
                    minDate={new Date()}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white"
                    placeholderText="Select date"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Check Out</label>
                <div className="w-full relative">
                  <DatePicker 
                    selected={booking.check_out ? new Date(`${booking.check_out}T00:00:00`) : null}
                    onChange={(date) => {
                      if (date) {
                        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                        setBooking({ ...booking, check_out: localDate });
                      }
                    }}
                    excludeDates={bookedDates}
                    minDate={booking.check_in ? new Date(`${booking.check_in}T00:00:00`) : new Date()}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white"
                    placeholderText="Select date"
                    dateFormat="yyyy-MM-dd"
                    required
                  />
                </div>
              </div>

              <button className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-slate-900 text-white font-semibold transition">
                Reserve Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;