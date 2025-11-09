import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import RideCard from "@/components/RideCard";

const API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:5000";

export default function FindNearbyRides() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [sortBy, setSortBy] = useState("price-low");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await fetch(`${API_URL}/rides?status=active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch rides");
        const data = await res.json();
        setRides(data);
        setFilteredRides(data);
        setLoading(false);
      } catch (error) {
        toast.error(error.message || "Failed to load rides");
        setLoading(false);
      }
    };

    if (token) {
      fetchRides();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let result = rides.filter((ride) => {
      const matchOrigin = ride.origin.toLowerCase().includes(searchOrigin.toLowerCase());
      const matchDestination = ride.destination
        .toLowerCase()
        .includes(searchDestination.toLowerCase());
      return matchOrigin && matchDestination;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price_per_seat - b.price_per_seat);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price_per_seat - a.price_per_seat);
    } else if (sortBy === "seats-available") {
      result.sort((a, b) => b.seats_left - a.seats_left);
    } else if (sortBy === "departure-soon") {
      result.sort(
        (a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
      );
    }

    setFilteredRides(result);
  }, [rides, searchOrigin, searchDestination, sortBy]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      {/* ... UI omitted for brevity; same UI as your initial code ... */}
      {/* Remainder UI unchanged except map rides from filteredRides */}
    </div>
  );
}
