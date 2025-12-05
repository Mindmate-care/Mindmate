import React, { useState, useEffect } from "react";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Mosaic } from "react-loading-indicators";
import API from "../api";
import "../App.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const CaretakerLogin = () => {
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
    const userType = localStorage.getItem("userType");
    if (token && userType === "caretaker") navigate("/caretaker/home");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("/caretaker/login", { email, password });

      if (res.data.token && res.data.caretaker) {
        // 🧹 Remove any existing user data before saving caretaker
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userType");

        // 🩺 Save caretaker info
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.caretaker));
        localStorage.setItem("userType", "caretaker");

        toast.success("Caretaker login successful!");
        navigate("/caretaker/home");
      } else {
        toast.error("Invalid caretaker credentials!");
      }
    } catch {
      toast.error("Invalid caretaker credentials. Please try again!");
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
        {/* 🧠 Left Section (Caretaker Intro) */}
        <div className="welcome-section">
          <div className="welcome-text">
            <h1>Welcome Back, Caretaker 🩺</h1>
            <h2>Your Support Matters</h2>
            <p>
              Manage your assigned users, monitor their well-being, and offer
              timely assistance. Log in to access tools and dashboards that help
              you make a positive impact every day.
            </p>
            <p className="tagline">
              “Every login is a step toward caring for someone’s mental
              wellness.” ❤️
            </p>
          </div>
          <div className="geometric-shape-1"></div>
          <div className="geometric-shape-2"></div>
        </div>

        {/* 🔑 Right Section */}
        <div className="form-section">
          <div className="form-container">
            <h2>Caretaker Login</h2>
            <p className="form-subtitle">Access your Caretaker Dashboard</p>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    placeholder="Caretaker Email"
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


            <div className="sign-up-link">
              Are you an admin?{" "}
              <button
                type="button"
                onClick={() => {
                  navigate("/login");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#06b6d4",
                  fontWeight: "600",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Go to User Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔵 Mobile Background */}
      <div className="mobile-background"></div>

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
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
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
            background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
            z-index: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CaretakerLogin;
