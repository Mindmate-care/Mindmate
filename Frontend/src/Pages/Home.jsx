import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
} from "react-bootstrap";
import {
  ArrowRight,
  Sparkles,
  Users,
  Target,
  Heart,
  BookOpen,

} from "lucide-react";

import HeroSection from "./HeroSection"; 
import { useTheme } from "../Context/ThemeContext"; 
import playGame from "../assets/playGame.svg"; 

const features = [
  {
    icon: <BookOpen size={32} className="text-primary" />,
    title: "Cognitive Games",
    description: "Play games designed to improve memory, attention, and problem-solving.",
  },
  {
    icon: <Users size={32} className="text-info" />,
    title: "Group Chat",
    description: "Connect with other users and share your experiences in a supportive community.",
  },
  {
    icon: <Heart size={32} className="text-danger" />,
    title: "Caretaker Support",
    description: "Easily reach out to caretakers and specialists for help and advice.",
  },
  {
    icon: <Target size={32} className="text-success" />,
    title: "Personal Progress",
    description: "Track your cognitive growth and set personalized goals.",
  },
];

const accentGradients = {
  blue: ["#60a5fa", "#3b82f6"],
  purple: ["#a78bfa", "#7c3aed"],
  green: ["#34d399", "#059669"],
  yellow: ["#facc15", "#eab308"],
  red: ["#fca5a5", "#f43f5e"],
  orange: ["#fb923c", "#ea580c"],
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { color, theme } = useTheme();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  const gradient = accentGradients[color] || accentGradients.blue;

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section
        className={`py-5 ${theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"}`}
      >
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Empowering Cognitive Wellbeing</h2>
            <p className="text-secondary">
              MindMate offers games, community, and expert support to help you or your loved ones maintain and improve cognitive health.
            </p>
          </div>

          <Row>
            {features.map((feature, index) => (
              <Col key={index} md={6} lg={3} className="mb-4">
                <Card className="h-100 text-center shadow-sm border-0 rounded-4">
                  <Card.Body>
                    <div className="mb-3">{feature.icon}</div>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Text className="text-secondary">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Games Section */}
      <section
        className={`py-5 ${theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"}`}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 className="fw-bold mb-3">Discover MindMate Games</h2>
              <p className="text-secondary">
                Enjoy interactive games that support cognitive skills and make daily training fun and rewarding.
              </p>
              <Button
                href="/games"
                size="lg"
                style={{
                  background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                  border: "none",
                }}
              >
                Explore Games <ArrowRight className="ms-2" />
              </Button>
            </Col>

            <Col md={6} className="d-flex justify-content-end">
              <img
                src={playGame}
                alt="Games"
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
          <h2 className="fw-bold mb-3">Start Your MindMate Journey</h2>
          <p className="lead mb-4">
            Join our community and take the first step towards better cognitive wellbeing for yourself or someone you care for.
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
          >
            Get Started
          </Button>
        </Container>
      </section>


      {/* Services Section */}
      <section
        className={`py-5 ${theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"}`}
      >
        <Container>
          <h2 className="fw-bold text-center mb-5">MindMate Services</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center shadow-sm border-0 rounded-4">
                <Card.Body>
                  <Sparkles size={36} className="text-warning mb-3" />
                  <Card.Title>AI Cognitive Assessments</Card.Title>
                  <Card.Text className="text-secondary">
                    Get personalized insights and recommendations for cognitive care using AI-powered assessments.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center shadow-sm border-0 rounded-4">
                <Card.Body>
                  <Users size={36} className="text-primary mb-3" />
                  <Card.Title>Community & Caretaker Support</Card.Title>
                  <Card.Text className="text-secondary">
                    Connect with other users, caretakers, and specialists for advice, motivation, and support.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center shadow-sm border-0 rounded-4">
                <Card.Body>
                  <Target size={36} className="text-success mb-3" />
                  <Card.Title>Goal Setting & Tracking</Card.Title>
                  <Card.Text className="text-secondary">
                    Set cognitive goals and monitor your progress with easy-to-use tracking tools.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      {/* About Us Section */}
      <section
        className={`py-5 ${theme === "dark" ? "bg-dark text-light" : "bg-white text-dark"}`}
      >
        <Container className="text-center">
          <h2 className="fw-bold mb-3">About MindMate</h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: "700px" }}>
            MindMate is dedicated to supporting cognitive health for all ages. Whether you are a user, caretaker, or specialist, our platform provides tools and resources to make cognitive care accessible, engaging, and effective.
          </p>
          <Button
            href="/contact"
            size="lg"
            variant="light"
            className="px-4 fw-semibold"
            style={{
              backgroundColor: "#fff",
              color: gradient ? gradient[1] : color,
              border: `2px solid ${gradient ? gradient[1] : color}`,
            }}
          >
            Contact Us
          </Button>
        </Container>
      </section>

    </div>
  );
};

export default Home;