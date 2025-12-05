import { useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import {
  ArrowRight,
  Sparkles,
  Users,
  Target,
  Heart,
  BarChart3,
} from "lucide-react";

import CaretakerHeroSection from "./CaretakerHerosection";
import { useTheme } from "../Context/ThemeContext";
import progressImg from "../assets/progress.svg";

// Features data
const features = [
  {
    icon: <Users size={32} className="text-info" />,
    title: "User Monitoring",
    description: "Check the progress and activity of your assigned users in one place.",
  },
  {
    icon: <Heart size={32} className="text-danger" />,
    title: "Care Insights",
    description: "Gain insights into emotional and cognitive wellbeing based on app usage.",
  },
  {
    icon: <Target size={32} className="text-success" />,
    title: "Goals Overview",
    description: "Track each user's goals and milestones to ensure consistent improvement.",
  },
  {
    icon: <BarChart3 size={32} className="text-warning" />,
    title: "Daily Reports",
    description: "View summarized reports of today's progress and activity trends.",
  },
];

// Accent gradients
const accentGradients = {
  blue: ["#60a5fa", "#3b82f6"],
  purple: ["#a78bfa", "#7c3aed"],
  green: ["#34d399", "#059669"],
  yellow: ["#facc15", "#eab308"],
  red: ["#fca5a5", "#f43f5e"],
  orange: ["#fb923c", "#ea580c"],
};

// Heart Progress Card Component
const HeartProgressCard = ({ title, description, progress }) => {
  const { theme } = useTheme();
  const fillColor = theme === "dark" ? "#fff" : "#000";
  const dashOffset = 100 - progress; // 0-100%

  return (
    <Card className="h-100 text-center shadow-sm border-0 rounded-4 p-4">
      <Card.Body>
        <div className="mb-3">
          <Heart size={36} className="text-danger" />
          <svg
            viewBox="0 0 24 24"
            className="w-100 mt-2"
            style={{ height: "60px" }}
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="none"
              stroke={fillColor}
              strokeWidth="2"
              strokeDasharray="100"
              strokeDashoffset={dashOffset}
            />
          </svg>
        </div>
        <Card.Title>{title}</Card.Title>
        <Card.Text className="text-secondary">{description}</Card.Text>
      </Card.Body>
    </Card>
  );
};

const CaretakerHome = () => {
  const { color, theme } = useTheme();
  const gradient = accentGradients[color] || accentGradients.blue;

  return (
    <div>
      {/* Hero Section */}
      <CaretakerHeroSection />

      {/* Features Section */}
      <section
        className={`py-5 ${
          theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"
        }`}
      >
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Empowering Your Caregiving Journey</h2>
            <p className="text-secondary">
              MindMate Care helps caretakers track user growth, wellbeing, and achievements with ease.
            </p>
          </div>

          <Row>
            {features.map((feature, index) => (
              <Col key={index} md={6} lg={3} className="mb-4">
                <Card className="h-100 text-center shadow-sm border-0 rounded-4">
                  <Card.Body>
                    <div className="mb-3">{feature.icon}</div>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Text className="text-secondary">{feature.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Sweet Progress Section */}
      <section
        className={`py-5 ${
          theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"
        }`}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 className="fw-bold mb-3">Sweet Progress Overview</h2>
              <p className="text-secondary">
                Take a look at how your users are improving. See who’s leading the charts, who needs extra support, and how overall engagement is growing.
              </p>
              <Button
                href="/caretaker/trackprogress"
                size="lg"
                style={{
                  background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                  border: "none",
                }}
              >
                View Detailed Progress <ArrowRight className="ms-2" />
              </Button>
            </Col>

            <Col md={6} className="d-flex justify-content-end">
              <img
                src={progressImg}
                alt="Progress"
                className="img-fluid rounded-4"
                style={{ maxWidth: "60%" }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section
        className="text-center py-5"
        style={{
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          color: "white",
        }}
      >
        <Container>
          <h2 className="fw-bold mb-3">Be the Heart of Progress</h2>
          <p className="lead mb-4">
            Support your users in achieving mental wellness — track, guide, and motivate them every day.
          </p>
          <Button
            size="lg"
            variant="light"
            className="px-4 fw-semibold"
            style={{
              backgroundColor: "#fff",
              color: gradient ? gradient[1] : color,
              border: `2px solid ${gradient ? gradient[1] : color}`,
            }}
            href="/caretaker/trackprogress"
          >
            Start Tracking
          </Button>
        </Container>
      </section>

      {/* Heart Progress Boxes */}
      <section className="py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={4} className="mb-4">
              <HeartProgressCard
                title="Celebrate Small Wins"
                description="Every positive action counts — track daily milestones and celebrate each step toward mental wellbeing."
                progress={70}
              />
            </Col>
            <Col md={4} className="mb-4">
              <HeartProgressCard
                title="Build Strong Bonds"
                description="Strengthen your connection with users through empathy, consistency, and encouragement."
                progress={85}
              />
            </Col>
            <Col md={4} className="mb-4">
              <HeartProgressCard
                title="Guide with Purpose"
                description="Lead your users with compassion — helping them stay focused, confident, and emotionally balanced."
                progress={90}
              />
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default CaretakerHome;
