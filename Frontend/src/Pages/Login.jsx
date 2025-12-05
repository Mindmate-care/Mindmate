import React, { useState, useEffect } from "react";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { Mosaic } from "react-loading-indicators";
import API from "../api";
import "../App.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const bgClass =
    theme === "dark" ? "bg-dark text-light" : "bg-light text-dark";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/home");
  }, [navigate]);



const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const res = await API.post("/auth/login", { name, email, password });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("userType", "user"); // ✅ mark as normal user
      navigate("/home");
    }
  } catch {
    toast.error("Invalid credentials. Please try again!");
  } finally {
    setIsLoading(false);
  }
};


  if (isLoading) {
    return (
      <div
        className={`d-flex justify-content-center align-items-center min-vh-100 ${bgClass}`}
      >
        <Mosaic color="#6c757d" size="medium" text="Loading..." textColor="" />
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        {/* 🌿 Left Section */}
        <div className="welcome-section">
          <div className="welcome-text">
            <h1>Welcome Back to MindMate 🧠</h1>
            <h2>Where Every Thought Finds Clarity</h2>
            <p>
              Reconnect with your personalized space for cognitive growth and
              mental wellness. Track your progress, play games that sharpen your
              mind, and stay motivated with a caring community that supports
              your journey to better mental fitness.
            </p>
            <p className="tagline">
              “Every login is a step toward a sharper, healthier you.”
            </p>
          </div>
          <div className="geometric-shape-1"></div>
          <div className="geometric-shape-2"></div>
        </div>

        {/* 🔑 Right Section */}
        <div className="form-section">
          <div className="form-container">
            <h2>Sign In</h2>
            <p className="form-subtitle">Welcome to your MindMate world</p>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    placeholder="Username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper with-toggle">
                  <span className="input-icon">🔒</span>
                  <input
  type={showPassword ? "text" : "password"}
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  autoComplete="current-password"
  required
/>

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    className="toggle-password-btn"
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="sign-in-btn">
                Login
              </button>
            </form>

            <div className="divider d-flex justify-content-center">
              <span>Or</span>
            </div>

            <div className="google-login-btn divider d-flex justify-content-center">
<GoogleLogin
  onSuccess={async (response) => {
    try {
      const decoded = jwtDecode(response.credential);
      const email = decoded.email;

      const res = await API.post("/auth/googleRegister", { email });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("userType", "user");

      navigate("/home");
    } catch (err) {
      console.log(err);
      toast.error("Google Login failed");
    }
  }}
  onError={() => toast.error("Google Login Failed")}
/>


            </div>

            <div className="sign-up-link">
              Don’t have an account?{" "}
              <a href="/register" onClick={() => navigate("/register")}>
                Sign Up
              </a>
            </div>

            {/* 🧩 Caretaker Login Button */}
            <div
              className="caretaker-login-link"
              style={{ marginTop: "15px", textAlign: "center" }}
            >
              Are you a caretaker?{" "}
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("caretakerToken");
                  localStorage.removeItem("caretaker");
                  navigate("/caretaker-login");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4f46e5",
                  fontWeight: "600",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Login Here
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔵 Mobile Gradient Background */}
      <div className="mobile-background"></div>

      {/* Embedded CSS for responsiveness */}
      <style>{`
        .login-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .login-content {
          display: flex;
          flex-direction: row;
          width: 90%;
          max-width: 1100px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 2;
        }

        .welcome-section {
          flex: 1;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .form-section {
          flex: 1;
          background: #ffffff;
          padding: 50px 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .form-container {
          width: 100%;
          max-width: 350px;
        }

        @media (max-width: 768px) {
          .login-content {
            flex-direction: column;
            box-shadow: none;
            background: transparent;
          }

          .welcome-section {
            display: none;
          }

          .form-section {
            background: rgba(255, 255, 255, 0.92);
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            position: relative;
            z-index: 2;
          }

          .mobile-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            z-index: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
