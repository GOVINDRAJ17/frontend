import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && user) {
      setLoading(false);
      setTimeout(() => navigate("/"), 500);
    } else {
      setError("No valid session found. Please sign in.");
      setLoading(false);
      setTimeout(() => navigate("/auth"), 3000);
    }
  }, [token, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center">
        {loading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Signing you in...</h1>
            <p className="text-white/80">Completing authentication</p>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold text-red-500 mb-2">Authentication Error</h1>
            <p className="text-white/80 mb-4">{error}</p>
            <p className="text-white/60 text-sm">Redirecting to sign in...</p>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AuthCallback;
