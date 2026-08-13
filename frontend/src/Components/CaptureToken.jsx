import { useNavigate, useSearchParams } from "react-router-dom";
// import { useAuthStore } from "../store/auth-store.js";
import { useEffect } from "react";
import { useTokenStore } from "../store/token.store";

const CaptureToken = () => {
  const setToken = useTokenStore((state) => state.setAccessToken);
  //   const toggleAuthState = useAuthStore((state) => state.toggleAuthState);
  const [searchParams] = useSearchParams();
  const receivedToken = searchParams.get("token");
  const navigate = useNavigate();
  useEffect(() => {
    if (!receivedToken) return;
    setToken(receivedToken);

    // wait for one tick delay for zustand to complete writing
    setTimeout(() => {
      toggleAuthState(true);
      navigate("/", { replace: true });
    }, 0);
  }, [receivedToken]);
  return (
    <div className="flex justify-center items-center min-h-screen">
      Just a moment...
    </div>
  );
};

export default CaptureToken;
