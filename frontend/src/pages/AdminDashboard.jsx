import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleSuccess } from "../utils";

function AdminDashboard() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [role, setRole] = useState("");

  const [activeView, setActiveView] = useState("dashboard");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔐 AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("loggedInUser") || "";
    const storedRole = localStorage.getItem("role") || "";

    if (!token) return navigate("/login");
    if (storedRole !== "admin") return navigate("/");

    setLoggedInUser(storedName);
    setRole(storedRole);
  }, [navigate]);

  // 🔤 INITIAL
  const initial = useMemo(
    () => loggedInUser?.charAt(0).toUpperCase(),
    [loggedInUser]
  );

  const formattedRole = useMemo(
    () => role?.charAt(0).toUpperCase() + role.slice(1),
    [role]
  );

  // 🚪 LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    handleSuccess("Logged out");
    navigate("/login");
  };

  // 📡 FETCH COMPLAINTS
  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/complaints", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      
      {/* 🔵 NAVBAR */}
      <div className="navbar bg-base-100 shadow px-6">
        <h1 className="text-xl font-bold flex-1">
          Admin Dashboard
        </h1>

        {/* 👤 AVATAR */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-circle avatar">
            <div className="w-10 bg-primary text-white flex items-center justify-center rounded-full">
              {initial}
            </div>
          </div>

          <ul className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-40">
            <li className="font-semibold">{loggedInUser}</li>
            <li className="capitalize">{formattedRole}</li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>

      {/* 🧱 CONTENT */}
      <div className="max-w-5xl mx-auto p-6">

        {/* 🔘 TABS */}
        <div className="tabs mb-6 gap-2">
          <button
            className={`tab rounded-lg bg-blue-300 hover:bg-blue-400 ${activeView === "dashboard" && "tab-active"}`}
            onClick={() => setActiveView("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`tab rounded-lg bg-blue-300 hover:bg-blue-400 ${activeView === "complaints" && "tab-active"}`}
            onClick={() => {
              setActiveView("complaints");
              fetchComplaints();
            }}
          >
            Complaints
          </button>
        </div>

        {/* 🏠 DASHBOARD VIEW */}
        {activeView === "dashboard" && (
          <>
            <div className="card bg-base-100 shadow p-6">
              <h2 className="text-2xl font-bold mb-2">
                Welcome, {loggedInUser} 👋
              </h2>

              <p className="text-gray-500">
                This is your admin control panel.
              </p>
            </div>


            {/* FIX: add container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

            <div className="card bg-base-100 shadow p-4">
                <h3 className="font-bold text-lg">Users</h3>
                <p className="text-sm text-gray-500">
                View & control users
                </p>
            </div>

            <div className="card bg-base-100 shadow p-4">
                <h3 className="font-bold text-lg">Providers</h3>
                <p className="text-sm text-gray-500">
                Verify providers
                </p>
            </div>

            </div>
        </>
        )}

        {/* 🚨 COMPLAINTS VIEW */}
        {activeView === "complaints" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">All Complaints</h2>

            {loading ? (
              <p>Loading...</p>
            ) : complaints.length === 0 ? (
              <p>No complaints found</p>
            ) : (
              <div className="space-y-4">
                {complaints.map((c) => (
                  <div key={c._id} className="card bg-base-100 shadow p-4">

                    <p><strong>Customer:</strong> {c.customerId?.name}</p>
                    <p><strong>Provider Name:</strong> {c.providerName}</p>
                    <p><strong>Provider Role:</strong> {c.providerRole}</p>
                    <p><strong>Description:</strong> {c.complaintDescription}</p>
                    <p><strong>Status:</strong> {c.status}</p>

                    {c.file?.path ? (
                      <a
                        href={`http://localhost:5000/${c.file.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="link link-primary mt-2"
                      >
                        View File
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 mt-2">
                        No file uploaded
                      </p>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <ToastContainer />
    </div>
  );
}

export default AdminDashboard;