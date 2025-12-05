import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { BookOpen, Brain, Zap, Users, Heart } from "lucide-react";
import brainLearning from "../assets/brain1.png";
import "./HeroSection.css";
import DNAAnimation from "./DNAAnimation";
import { useTheme } from "../Context/ThemeContext";

const HeroSection = () => {
  const [isLarge, setIsLarge] = useState(false);
  const { color, theme } = useTheme();

  const stats = [
    { icon: BookOpen, label: "Games", value: "20+" },
    { icon: Brain, label: "Cognitive Skills", value: "8+" },
    { icon: Users, label: "Community Members", value: "500+" },
    { icon: Heart, label: "Caretaker Support", value: "24/7" },
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
              MindMate helps you maintain and improve cognitive health with fun
              games, progress tracking, and a supportive community for users and caretakers.
            </p>

            <div className="d-flex flex-wrap gap-3 mb-5">
              <Button
                size="lg"
                className="px-4 py-2 fw-semibold d-flex align-items-center border-0"
                style={{ background: color, color: "#fff" }}
                href="/games"
              >
                Play Cognitive Games <Zap className="ms-2" size={20} />
              </Button>

              <Button
                size="lg"
                className="px-4 py-2 fw-semibold"
                style={{
                  background: theme === "dark" ? "#111" : "#fff",
                  border: `2px solid ${color}`,
                  color: theme === "#fff",
                }}
                href="/profile"
              >
                Track Your Progress
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

          {/* Right Brain Animation */}
          <div className="col-lg-6 text-center position-relative">
            <div
              className={`brain-container position-relative d-inline-block ${
                isLarge ? "brain-large" : ""
              }`}
              onClick={() => setIsLarge(!isLarge)}
            >
              {/* Orbiting Particles */}
              <div className="particle-orbit">
                {[...Array(20)].map((_, i) => (
                  <span key={i}></span>
                ))}
              </div>

              {/* Ambient Particles */}
              <div className="ambient-particles">
                {[...Array(40)].map((_, i) => (
                  <span key={i}></span>
                ))}
              </div>

              {/* Glowing Brain Image with pulse */}
              <img
                src={brainLearning}
                alt="MindMate Brain"
                className={`img-fluid animated-brain pulsing-brain ${
                  isLarge ? "expanded-brain" : "large-brain"
                }`}
              />

              {/* Glowing Base */}
              <div className="glow-base"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
