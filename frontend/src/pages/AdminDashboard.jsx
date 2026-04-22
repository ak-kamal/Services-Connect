import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleSuccess } from "../utils";
import AlertCard from "../components/AlertCard";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/LanguageContext";

function AdminDashboard() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [role, setRole] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [activeView, setActiveView] = useState("dashboard");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useLanguage();

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
    handleSuccess(t('common.loggedOut'));
    navigate("/login");
  };

  // FETCH COMPLAINTS
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

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/alerts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAlertRead = async (alertId) => {
    try {
      await fetch(`http://localhost:5000/api/alerts/${alertId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchAlerts(); // Refresh alerts
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      
      {/*  NAVBAR */}
      <div className="navbar bg-base-100 shadow px-6">
        <div className="navbar-start">
          <h1 className="text-xl font-bold">
            {t('admin.dashboard')}
          </h1>
        </div>

        <div className="navbar-center">
          <LanguageToggle />
        </div>

        <div className="navbar-end">
          {/*  AVATAR */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-circle avatar">
              <div className="w-10 bg-primary text-white flex items-center justify-center rounded-full">
                {initial}
              </div>
            </div>

            <ul className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-40 z-50">
              <li className="font-semibold">{loggedInUser}</li>
              <li className="capitalize">{formattedRole}</li>
              <li>
                <button onClick={handleLogout}>{t('common.logout')}</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/*  CONTENT */}
      <div className="max-w-5xl mx-auto p-6">

        {/*  TABS */}
        <div className="tabs mb-6 gap-2">
          <button
            className={`tab rounded-lg bg-blue-300 hover:bg-blue-400 ${activeView === "dashboard" && "tab-active"}`}
            onClick={() => setActiveView("dashboard")}
          >
            {t('admin.dashboard')}
          </button>

          <button
            className={`tab rounded-lg bg-blue-300 hover:bg-blue-400 ${activeView === "complaints" && "tab-active"}`}
            onClick={() => {
              setActiveView("complaints");
              fetchComplaints();
            }}
          >
            {t('admin.complaints')}
          </button>

          <button
            className={`tab rounded-lg bg-blue-300 hover:bg-blue-400 ${activeView === "alerts" && "tab-active"}`}
            onClick={() => {
              setActiveView("alerts");
              fetchAlerts();
            }}
          >
            {t('admin.anomalyAlerts')}
            {alerts.filter(a => !a.read).length > 0 && (
              <span className="ml-2 badge badge-error badge-sm">
                {alerts.filter(a => !a.read).length}
              </span>
            )}
          </button>
        </div>

        {/*  DASHBOARD VIEW */}
        {activeView === "dashboard" && (
          <>
            <div className="card bg-base-100 shadow p-6">
              <h2 className="text-2xl font-bold mb-2">
                {t('admin.welcome', { name: loggedInUser })} 👋
              </h2>

              <p className="text-gray-500">
                {t('admin.controlPanel')}
              </p>
            </div>

            {/* FIX: add container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

              <div className="card bg-base-100 shadow p-4">
                <h3 className="font-bold text-lg">{t('admin.users')}</h3>
                <p className="text-sm text-gray-500">
                  {t('admin.usersDesc')}
                </p>
              </div>

              <div className="card bg-base-100 shadow p-4">
                <h3 className="font-bold text-lg">{t('admin.providers')}</h3>
                <p className="text-sm text-gray-500">
                  {t('admin.providersDesc')}
                </p>
              </div>

            </div>
          </>
        )}

        {/*  COMPLAINTS VIEW */}
        {activeView === "complaints" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{t('admin.allComplaints')}</h2>

            {loading ? (
              <p>{t('common.loading')}</p>
            ) : complaints.length === 0 ? (
              <p>{t('admin.noComplaints')}</p>
            ) : (
              <div className="space-y-4">
                {complaints.map((c) => (
                  <div key={c._id} className="card bg-base-100 shadow p-4">

                    <p><strong>{t('admin.customer')}:</strong> {c.customerId?.name}</p>
                    <p><strong>{t('admin.providerName')}:</strong> {c.providerName}</p>
                    <p><strong>{t('admin.providerRole')}:</strong> {c.providerRole}</p>
                    <p><strong>{t('admin.description')}:</strong> {c.complaintDescription}</p>
                    <p><strong>{t('admin.status')}:</strong> {c.status}</p>

                    {c.file?.path ? (
                      <a
                        href={`http://localhost:5000/${c.file.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="link link-primary mt-2"
                      >
                        {t('admin.viewFile')}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 mt-2">
                        {t('admin.noFileUploaded')}
                      </p>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/*  ALERTS VIEW */}
        {activeView === "alerts" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{t('admin.anomalyAlerts')}</h2>
            
            {loading ? (
              <p>{t('common.loading')}</p>
            ) : alerts.length === 0 ? (
              <div className="card bg-base-100 shadow p-6 text-center">
                <p className="text-gray-500">{t('admin.noAlerts')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <AlertCard 
                    key={alert._id} 
                    alert={alert} 
                    onMarkRead={markAlertRead}
                  />
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