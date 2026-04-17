function AlertCard({ alert, onMarkRead }) {
  const isType1 = alert.type === "1";
  
  return (
    <div 
      className={`card shadow p-4 border-l-4 ${
        isType1 
          ? "border-l-orange-500 bg-orange-50" 
          : "border-l-purple-500 bg-purple-50"
      } ${alert.read ? "opacity-60" : ""}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span 
            className={`badge ${
              isType1 ? "badge-warning" : "badge-secondary"
            }`}
          >
            Type {alert.type}
          </span>
          {!alert.read && (
            <span className="badge badge-error badge-sm">NEW</span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {new Date(alert.createdAt).toLocaleString()}
        </span>
      </div>
      
      <p className="font-semibold mt-2">{alert.message}</p>
      
      {/* Type 1 specific details */}
      {isType1 && alert.details && (
        <div className="text-sm text-gray-600 mt-2">
          <p>IP: {alert.details.ip}</p>
          <p>New: {alert.details.newUserEmail}</p>
          <p>Previous: {alert.details.previousUserEmails?.join(", ")}</p>
        </div>
      )}
      
      {/* Type 2 specific details */}
      {!isType1 && alert.details && (
        <div className="text-sm text-gray-600 mt-2">
          <p>Customer: {alert.details.customerName}</p>
          <p>Email: {alert.details.customerEmail}</p>
          <p>Offers sent: {alert.details.offerCount}</p>
        </div>
      )}
      
      {!alert.read && (
        <button 
          className="btn btn-sm btn-ghost mt-3"
          onClick={() => onMarkRead(alert._id)}
        >
          Mark as Read
        </button>
      )}
    </div>
  );
}

export default AlertCard;