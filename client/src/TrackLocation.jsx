// TrackLocation.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const TrackLocation = () => {
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("lastVisitedPath", location.pathname);
  }, [location]);

  return null;
};
