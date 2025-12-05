import React, { useState, useEffect } from "react";
import { useTheme } from "../Context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import API from "../api";
import "../App.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // 🔐 Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/home");
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post("/auth/register", { name, email, password });
      if (res.status === 201) {
        toast.success("Registered successfully! Please login.");
        navigate("/login");
      }
    } catch {
      toast.error("Registration failed. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`d-flex justify-content-center align-items-center min-vh-100 ${
          theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"
        }`}
      >
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-content">
        {/* 🌱 Left Section (Hidden on mobile) */}
        <div className="welcome-section">
          <div className="welcome-text">
            <h1>Join MindMate 🎉</h1>
            <h2>Grow Your Mind, One Step at a Time</h2>
            <p>
              Take the first step towards improving your cognitive wellness.
              MindMate connects you with engaging games, supportive caretakers,
              and insightful progress tracking designed just for you.
            </p>
            <p className="tagline">
              “Stronger minds are built one habit at a time.”
            </p>
          </div>
          <div className="geometric-shape-1"></div>
          <div className="geometric-shape-2"></div>
        </div>

        {/* 📝 Right Section */}
        <div className="form-section">
          <form className="form-container" onSubmit={handleRegister}>
            <h2>Create Account</h2>
            <p className="form-subtitle">Start your MindMate journey today!</p>

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
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="sign-in-btn">
              Register
            </button>

            <div className="google-login-btn mt-2 divider d-flex justify-content-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential);
                  const email = decoded.email;
                  try {
                    const res = await API.post("/auth/googleRegister", {
                      email,
                    });
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    navigate("/home");
                  } catch (err) {
                    toast.error("Google Login failed");
                  }
                }}
                onError={() => toast.error("Google Login Failed")}
              />
            </div>

            <div className="sign-up-link">
              Already have an account?{" "}
              <a href="/login" className="text-decoration-none">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* 🔵 Mobile Background */}
      <div className="mobile-background"></div>

      {/* Embedded responsive CSS */}
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
          width: 100%;
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
          padding: 60px 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .form-container {
          width: 100%;
          max-width: 350px;
        }

        /* 📱 Responsive for mobile */
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
            background: rgba(255, 255, 255, 0.93);
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            position: relative;
            z-index: 2;
            margin: 20px;
          }

          .mobile-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #4f46e5 0%, #6e45e2 100%);
            z-index: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
