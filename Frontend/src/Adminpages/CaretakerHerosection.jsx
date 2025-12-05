import { useState } from "react";
import { Button } from "react-bootstrap";
import { Users, Heart, Target, ClipboardList, Zap } from "lucide-react";
import stethoscopeImg from "../assets/sethescope.png";
import "./CareHeroSection.css";
import DNAAnimation from "../Pages/DNAAnimation";
import { useTheme } from "../Context/ThemeContext";

const CaretakerHeroSection = () => {
  const [isLarge, setIsLarge] = useState(false);
  const { color, theme } = useTheme();

  const stats = [
    { icon: Users, label: "Users Managed", value: "25+" },
    { icon: Heart, label: "Support Hours", value: "24/7" },
    { icon: Target, label: "Goals Achieved", value: "120+" },
    { icon: ClipboardList, label: "Reports Generated", value: "300+" },
  ];

  const headingColor = theme === "dark" ? "text-white" : "text-dark";
  const subTextColor = theme === "dark" ? "text-white-50" : "text-muted";
  const bgColor = theme === "dark" ? "bg-dark text-white" : "bg-white text-dark";

  return (
    <section
      className={`min-h-screen ${bgColor} d-flex align-items-center position-relative overflow-hidden`}
    >
      <DNAAnimation color={color} />

      <div className="container py-5 position-relative" style={{ zIndex: 1 }}>
        <div className="row align-items-center g-5">
          {/* Left Text Column */}
          <div className="col-lg-6">
            <h2 className="display-4 fw-bold mb-4">
              <span style={{ color }}>Welcome to</span>
              <br />
              <span className={headingColor}>MindMate</span>
            </h2>

            <p className={`lead mb-4 ${subTextColor}`}>
              Manage your users’ progress and wellbeing with insightful data,
              compassionate support, and seamless tracking tools.
            </p>

            <div className="d-flex flex-wrap gap-3 mb-5">
              <Button
                size="lg"
                className="px-4 py-2 fw-semibold d-flex align-items-center border-0"
                style={{ background: color, color: "#fff" }}
                href="/caretaker/trackprogress"
              >
                View Progress <Zap className="ms-2" size={20} />
              </Button>

              <Button
                size="lg"
                className="px-4 py-2 fw-semibold"
                style={{
                  background: theme === "dark" ? "#111" : "#fff",
                  border: `2px solid ${color}`,
                  color: '#fff',
                }}
                href="/caretaker/chat"
              >
                Open Chat
              </Button>
            </div>

            <div className="row text-center g-3">
              {stats.map((stat, i) => (
                <div key={i} className="col-6 col-sm-3">
                  <stat.icon style={{ color }} className="mb-2" size={32} />
                  <h5 className="fw-bold">{stat.value}</h5>
                  <small className={subTextColor}>{stat.label}</small>
                </div>
              ))}
            </div>
          </div>

          {/* Right Stethoscope Animation */}
          <div className="col-lg-6 text-center position-relative">
            <div
              className={`brain-container position-relative d-inline-block ${
                isLarge ? "brain-large" : ""
              }`}
              onClick={() => setIsLarge(!isLarge)}
            >
              <img
                src={stethoscopeImg}
                alt="Stethoscope"
                className={`img-fluid animated-brain pulsing-brain ${
                  isLarge ? "expanded-brain" : "large-brain"
                }`}
              />
              <div className="glow-base"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaretakerHeroSection;
