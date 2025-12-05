import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../api";

const parseDifficulty = (d) => {
  if (d == null) return 1;
  if (typeof d === "number") return d;
  if (typeof d === "string") {
    const m = d.match(/(\d+(\.\d+)?)/);
    return m ? Number(m[1]) : 1;
  }
  return 1;
};

const GamePlay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { gameInfo } = location.state || {};
  const gameId = params.gameId || gameInfo?.id || gameInfo?._id;

  const startRef = useRef(
    gameInfo?.startTime ? new Date(gameInfo.startTime).getTime() : Date.now()
  );
  const didSendRef = useRef(false);

  // ...existing code...
  const sendPlay = async (minutesPlayed) => {
    if (!gameId || didSendRef.current) return;
    didSendRef.current = true;
    try {
      const difficulty = parseDifficulty(gameInfo?.difficulty);
      const payload = {
        minutes: Math.max(0, Math.floor(minutesPlayed)),
        difficulty,
        title: gameInfo?.title || `Played ${gameId}`,
      };
      console.info("[GamePlay] sending play payload:", payload);
      const res = await API.post(`/games/${gameId}/play`, payload);
      console.info("[GamePlay] play response:", res?.data);
      // update local user profile if backend returned it
      if (res.data?.profile) {
        const stored = JSON.parse(localStorage.getItem("user") || "null");
        if (stored) {
          stored.profile = res.data.profile;
          localStorage.setItem("user", JSON.stringify(stored));
        }
      }
    } catch (err) {
      console.error(
        "[GamePlay] Failed to record game play:",
        err,
        err?.response?.data
      );
    }
  };
  // ...existing code...
  const handleGoBack = async () => {
    const ms = Date.now() - startRef.current;
    const minutes = Math.max(1, Math.ceil(ms / 60000));
    await sendPlay(minutes);
    navigate(-1);
  };

  useEffect(() => {
    // fallback: when component unmounts (route change or tab close), attempt to send play
    const onBeforeUnload = () => {
      const ms = Date.now() - startRef.current;
      const minutes = Math.max(1, Math.ceil(ms / 60000));
      // try navigator.sendBeacon with token fallback; API.post will handle normal case
      try {
        const token = localStorage.getItem("token");
        const url = `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
        }/games/${gameId}/play`;
        const payload = JSON.stringify({
          minutes,
          difficulty: parseDifficulty(gameInfo?.difficulty),
          title: gameInfo?.title || `Played ${gameId}`,
          _token: token || null,
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            url,
            new Blob([payload], { type: "application/json" })
          );
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      // on unmount (React navigation), send via API.post
      const ms = Date.now() - startRef.current;
      const minutes = Math.max(1, Math.ceil(ms / 60000));
      sendPlay(minutes);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  if (!gameInfo) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark text-light">
        <p>Game info not found.</p>
        <button className="btn btn-primary ms-3" onClick={() => navigate(-1)}>
          <ArrowLeft className="me-2" /> Go Back
        </button>
      </div>
    );
  }
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
      style={{ zIndex: 9999 }}
    >
      {/* Go Back Button */}
      <button
        className="btn btn-light position-absolute m-3"
        style={{ zIndex: 10000 }}
        onClick={handleGoBack}
      >
        <ArrowLeft className="me-2" /> Go Back
      </button>

      {/* Game Iframe */}
      <iframe
        src={gameInfo.link}
        title={gameInfo.title}
        frameBorder="0"
        scrolling="no"
        width="100%"
        height="100%"
        style={{
          border: "none",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        allowFullScreen
      ></iframe>

      {/* Dark Blue Top Bar with Game Title */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "40px",
          backgroundColor: "#0b0c2a",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          fontWeight: "600",
          letterSpacing: "0.5px",
          zIndex: 9999,
          textTransform: "uppercase",
        }}
      >
        {gameInfo.title || gameInfo.name || "Untitled Game"}
      </div>
    </div>
  );
};
export default GamePlay;
