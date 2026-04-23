import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { BadgeCheck } from "lucide-react";
import { handleError, handleSuccess } from "../utils";
import { useOffers } from "../hooks/useOffers";
import ChatWindow from "../components/ChatWindow";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/LanguageContext";

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
  const { t } = useLanguage();

  const { offers, loadingOffers, fetchOffers } = useOffers(API_BASE_URL, activeView);

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

        if (!res.ok || !data.success) throw new Error(data.message);

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

  const initial = useMemo(() => loggedInUser?.charAt(0).toUpperCase(), [loggedInUser]);

  const formattedRole = useMemo(
    () => role?.charAt(0).toUpperCase() + role.slice(1),
    [role]
  );

  const hasVerifiedCertification = certification?.fileUrl && certification?.verified;

  const handleUploadCertification = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!selectedFile) return handleError(t('provider.alerts.selectFileFirst'));

    const formData = new FormData();
    formData.append("certification", selectedFile);

    try {
      setIsUploading(true);

      const res = await fetch(`${API_BASE_URL}/api/certification`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message);

      setCertification(data.certification);
      handleSuccess(t('provider.alerts.uploaded'));
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
    handleSuccess(t('common.loggedOut'));
    navigate("/login");
  };

  const handleAccept = async (id) => {
    await fetch(`${API_BASE_URL}/api/offer/${id}/accept`, { method: "PUT" });
    fetchOffers();
  };

  const handleReject = async (id) => {
    await fetch(`${API_BASE_URL}/api/offer/${id}/reject`, { method: "PUT" });
    fetchOffers();
  };

  const handleStats = () => {
    const providerId = localStorage.getItem("userId");
    console.log(providerId);
    navigate(`/provider/stats/` + providerId);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* NAVBAR */}
      <div className="navbar bg-base-100 shadow px-6">
        <div className="navbar-start">
          <h1 className="text-xl font-bold">{t('provider.dashboard')}</h1>
        </div>

        <div className="navbar-center">
          <LanguageToggle />
        </div>

        <div className="navbar-end">
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
              <button onClick={handleLogout}>{t('common.logout')}</button>
            </li>
          </ul>
        </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="tabs mb-6 gap-2">
          <button
            className={`tab rounded-lg bg-blue-300 hover:bg-blue-400 ${activeView === "profile" && "tab-active"} px-2`}
            onClick={() => setActiveView("profile")}
          >
            {t('provider.profile')}
          </button>

          <button
            className={`tab rounded-lg bg-blue-300 hover:bg-blue-400 ${activeView === "offers" && "tab-active"} px-2`}
            onClick={() => setActiveView("offers")}
          >
            {t('provider.offers')}
          </button>

          <button
            className={`tab rounded-lg bg-blue-300 hover:bg-blue-400 ${activeView === "stats" && "tab-active"} px-2`}
            onClick={handleStats}
          >
            {t('provider.statsTab')}
          </button>
        </div>

        {/* PROFILE */}
        {activeView === "profile" && (
          <div className="card bg-base-100 shadow p-6">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold">{loggedInUser}</h2>

              {hasVerifiedCertification && (
                <span className="badge badge-info text-white">
                  <BadgeCheck size={16} /> {t('provider.verified')}
                </span>
              )}
            </div>

            <p className="mb-1">{t('provider.roleLabel')}: {t(`common.${role}`)}</p>
            <p className="mb-4">{t('provider.emailLabel')}: {email}</p>

            <form onSubmit={handleUploadCertification}>
              <input
                type="file"
                className="file-input file-input-bordered w-full mb-3"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              <button className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none">
                {isUploading ? t('provider.uploading') : t('provider.upload')}
              </button>
            </form>

            {certification?.fileUrl && (
              <div className="mt-5 p-4 rounded-lg border border-base-300 bg-base-200/40">
                <p className="text-sm">
                  {t('provider.currentFile')}:{" "}
                  <span className="font-semibold">{certification.fileName}</span>
                </p>

                <p className="text-sm mt-1">
                  {t('provider.uploadedOn')}:{" "}
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
                  {t('provider.viewCertification')}
                </a>
              </div>
            )}
          </div>
        )}

        {/* OFFERS */}
        {activeView === "offers" && (
          <div className="space-y-4">
            {loadingOffers ? (
              <p>{t('common.loading')}</p>
            ) : offers.length === 0 ? (
              <p>{t('provider.noOffers')}</p>
            ) : (
              offers.map((o) => (
                <div key={o._id} className="card bg-base-100 shadow p-4">
                  <p><b>{t('provider.customer')}:</b> {o.customerId?.name}</p>
                  <p><b>{t('provider.date')}:</b> {o.date.split('T')[0]}</p>
                  <p><b>{t('provider.time')}:</b> {o.timeSlot}</p>
                  <p><b>{t('provider.address')}:</b> {o.address}</p>
                  <p><b>{t('provider.category')}:</b> {t(`categories.${o.category}`, o.category)}</p>
                  <p><b>{t('provider.tier')}:</b> {t(`tiers.${o.tier}`, o.tier)}</p>
                  <p><b>{t('provider.distance')}:</b> {(Number(o.distance)/1000).toFixed(2)} km</p>
                  {/* Show provider earnings (after commission) */}
                  <p><b>{t('provider.wages')}:</b> {(o.providerEarnings || (o.totalPrice * 0.85).toFixed(2))} BDT</p>
                  <p><b>{t('provider.status')}:</b> {o.status}</p>

                  {o.status === "Pending" && (
                    <div className="flex gap-2 mt-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAccept(o._id)}
                      >
                        {t('provider.accept')}
                      </button>

                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleReject(o._id)}
                      >
                        {t('provider.reject')}
                      </button>
                    </div>
                  )}

                  {o.status !== "Rejected" && (
                    <button
                      className="btn btn-sm btn-outline btn-primary mt-2"
                      onClick={() => setChatOffer(o)}
                    >
                      {t('provider.chatWithCustomer')}
                    </button>
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