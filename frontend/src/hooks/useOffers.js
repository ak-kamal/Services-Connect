import { useEffect, useRef, useState } from "react";
import { handleSuccess } from "../utils";

export const useOffers = (API_BASE_URL, activeView) => {
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  const prevOffersRef = useRef([]);

  const fetchOffers = async () => {
    const providerId = localStorage.getItem("userId");

    try {
      setLoadingOffers(true);

      const res = await fetch(
        `${API_BASE_URL}/api/offers?providerId=${providerId}`
      );
      const data = await res.json();

      if (data.success) {
        // 🔔 Detect new offers
        if (prevOffersRef.current.length > 0) {
          const newOffers = data.offers.filter(
            (o) =>
              !prevOffersRef.current.find((prev) => prev._id === o._id)
          );

          if (newOffers.length > 0) {
            handleSuccess("New booking request received!");
          }
        }

        prevOffersRef.current = data.offers;
        setOffers(data.offers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOffers(false);
    }
  };

  // 🔁 Auto refresh every 10 sec ONLY when on offers tab
  useEffect(() => {
    if (activeView !== "offers") return;

    fetchOffers(); // initial

    const interval = setInterval(fetchOffers, 60000);

    return () => clearInterval(interval);
  }, [activeView]);

  return { offers, loadingOffers, fetchOffers };
};