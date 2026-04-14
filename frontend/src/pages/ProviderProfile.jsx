import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { BadgeCheck } from "lucide-react";
import { handleError, handleSuccess } from "../utils";
import { useOffers } from "../hooks/useOffers";
import ChatWindow from "../components/ChatWindow";

function ProviderProfile() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [certification, setCertification] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [activeView, setActiveView] = useState("profile");
  const [chatOffer, setChatOffer] = useState(null);

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Offers Hook
  const { offers, loadingOffers, fetchOffers } = useOffers(
    API_BASE_URL,
    activeView
  );

  // Auth + Profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("loggedInUser") || "";
    const storedRole = localStorage.getItem("role") || "";

    if (!token) return navigate("/login");
    if (storedRole === "customer") return navigate("/");

    setLoggedInUser(storedName);
    setRole(storedRole);

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok || !data.success)
          throw new Error(data.message);

        const { profile } = data;
        setLoggedInUser(profile.name);
        setRole(profile.role);
        setEmail(profile.email);
        setCertification(profile.certification);
      } catch (err) {
        handleError(err.message);
      } finally {
        setIsFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [API_BASE_URL, navigate]);

  const initial = useMemo(
    () => loggedInUser?.charAt(0).toUpperCase(),
    [loggedInUser]
  );

  const formattedRole = useMemo(
    () => role?.charAt(0).toUpperCase() + role.slice(1),
    [role]
  );

  const hasVerifiedCertification =
    certification?.fileUrl && certification?.verified;

  const handleUploadCertification = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!selectedFile) return handleError("Select file first");

    const formData = new FormData();
    formData.append("certification", selectedFile);

    try {
      setIsUploading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/certification`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.message);

      setCertification(data.certification);
      handleSuccess("Uploaded!");
    } catch (err) {
      handleError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const getCertificationFileUrl = () => {
  if (!certification?.fileUrl || !API_BASE_URL) return "";
  return `${API_BASE_URL}${certification.fileUrl}`;
};

  const handleLogout = () => {
    localStorage.clear();
    handleSuccess("Logged out");
    navigate("/login");
  };

  const handleAccept = async (id) => {
    await fetch(`${API_BASE_URL}/api/offer/${id}/accept`, {
      method: "PUT",
    });
    fetchOffers();
  };

  const handleReject = async (id) => {
    await fetch(`${API_BASE_URL}/api/offer/${id}/reject`, {
      method: "PUT",
    });
    fetchOffers();
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* NAVBAR */}
      <div className="navbar bg-base-100 shadow px-6">
        <h1 className="text-xl font-bold flex-1">
          Provider Dashboard
        </h1>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-circle avatar">
            <div className="w-10 bg-primary text-white flex items-center justify-center rounded-full">
              {initial}
            </div>
          </div>

          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-40">
            <li>{loggedInUser}</li>
            <li>{formattedRole}</li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="tabs mb-6 gap-2">
  <button
    className={`tab rounded-lg bg-blue-300 hover:bg-blue-400 ${activeView === "profile" && "tab-active"} px-2`}
    onClick={() => setActiveView("profile")}
  >
    Profile
  </button>

  <button
    className={`tab rounded-lg bg-blue-300 hover:bg-blue-400 ${activeView === "offers" && "tab-active"} px-2`}
    onClick={() => setActiveView("offers")}
  >
    Offers
  </button>
</div>

        {/* PROFILE */}
        {activeView === "profile" && (
          <div className="card bg-base-100 shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold">
                {loggedInUser}
              </h2>

              {hasVerifiedCertification && (
                <span className="badge badge-info text-white">
                  <BadgeCheck size={16} /> Verified
                </span>
              )}
            </div>

            <p className="mb-1">Role: {formattedRole}</p>
            <p className="mb-4">Email: {email}</p>

            <form onSubmit={handleUploadCertification}>
              <input
                type="file"
                className="file-input file-input-bordered w-full mb-3"
                onChange={(e) =>
                  setSelectedFile(e.target.files[0])
                }
              />

              <button className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none">
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </form>

            {certification?.fileUrl && (
  <div className="mt-5 p-4 rounded-lg border border-base-300 bg-base-200/40">
    <p className="text-sm">
      Current file:{" "}
      <span className="font-semibold">{certification.fileName}</span>
    </p>

    <p className="text-sm mt-1">
      Uploaded on:{" "}
      {certification.uploadedAt
        ? new Date(certification.uploadedAt).toLocaleString()
        : "N/A"}
    </p>

    <a
      href={getCertificationFileUrl()}
      target="_blank"
      rel="noreferrer"
      className="link link-info mt-2 inline-block"
    >
      View uploaded certification
    </a>
  </div>
)}
          </div>
        )}

        {/* OFFERS */}
        {activeView === "offers" && (
          <div className="space-y-4">
            {loadingOffers ? (
              <p>Loading...</p>
            ) : offers.length === 0 ? (
              <p>No offers yet</p>
            ) : (
              offers.map((o) => (
                <div
                  key={o._id}
                  className="card bg-base-100 shadow p-4"
                >
                  <p><b>Customer:</b> {o.customerId?.name}</p>
                  <p><b>Date:</b> {o.date.split('T')[0]}</p>
                  <p><b>Time:</b> {o.timeSlot}</p>
                  <p><b>Address:</b> {o.address}</p>
                  <p><b>Category:</b> {o.category}</p>
                  <p><b>Tier:</b> {o.tier}</p>
                  <p><b>Distance:</b> {(Number(o.distance)/1000).toFixed(2)} km</p>
                  <p><b>Total Price:</b> ${o.totalPrice}</p>
                  <p><b>Status:</b> {o.status}</p>

                  {o.status === "Pending" && (
                    <div className="flex gap-2 mt-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAccept(o._id)}
                      >
                        Accept
                      </button>

                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleReject(o._id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {o.status !== "Rejected" && o.status !== "Paid" && (
  <div className="flex justify-end mt-3">
    <button
      className="btn btn-sm bg-blue-500 text-white px-3"
      onClick={() => setChatOffer(o)}
    >
      💬 Chat with Customer
    </button>
  </div>
)}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {chatOffer && (
        <ChatWindow
          offerId={chatOffer._id}
          offerDate={chatOffer.date}
          offerTimeSlot={chatOffer.timeSlot}
          otherPartyName={chatOffer.customerId?.name || 'Customer'}
          currentUserId={localStorage.getItem("userId")}
          token={localStorage.getItem("token")}
          onClose={() => setChatOffer(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
}

export default ProviderProfile;