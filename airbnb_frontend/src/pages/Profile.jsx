import { getUser } from "../utils/auth";

function Profile() {
  const user = getUser();

  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-40"></div>

        <div className="px-8 pb-8 -mt-14">
          <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center text-4xl font-bold text-slate-900 border-4 border-white">
            {user?.username?.charAt(0)?.toUpperCase()}
          </div>

          <h1 className="text-4xl font-bold mt-6">{user?.username}</h1>
          <p className="text-slate-500 mt-2">Manage your account information and role.</p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-50 rounded-2xl p-5">
              <p className="text-slate-500 text-sm">Username</p>
              <h3 className="text-xl font-bold mt-1">{user?.username}</h3>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5">
              <p className="text-slate-500 text-sm">Email</p>
              <h3 className="text-xl font-bold mt-1">{user?.email}</h3>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5">
              <p className="text-slate-500 text-sm">Phone</p>
              <h3 className="text-xl font-bold mt-1">{user?.phone || "N/A"}</h3>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5">
              <p className="text-slate-500 text-sm">Role</p>
              <h3 className="text-xl font-bold mt-1 capitalize">{user?.role}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;