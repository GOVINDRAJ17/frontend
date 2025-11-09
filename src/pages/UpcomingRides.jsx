import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

const API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:5000";

export default function UpcomingRides() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

    const fetchRides = async () => {
      try {
        const [createdRes, joinedRes] = await Promise.all([
          fetch(`${API_URL}/rides/created`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/rides/joined`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!createdRes.ok || !joinedRes.ok) throw new Error("Failed to fetch rides");

        const createdData = await createdRes.json();
        const joinedData = await joinedRes.json();

        setCreatedRides(createdData);
        setJoinedRides(joinedData);
        setLoading(false);
      } catch (err) {
        toast.error(err.message || "Failed to load rides");
        setLoading(false);
      }
    };

    fetchRides();
  }, [token, navigate]);

  const allUpcomingRides = [...createdRides, ...joinedRides]
    .filter((ride) => new Date(ride.departure_time) > new Date())
    .sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));

  // RideListItem renders each ride — similar to your original implementation

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      {/* Render Tabs to show "all", "created", "joined" with respective ride lists */}
      {/* Show RideChat on selecting a ride */}
    </div>
  );
}
