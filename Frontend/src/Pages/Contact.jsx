// ...existing code...
import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import axios from "axios";

// ✅ Import the SVG like this
import contactIllustration from "../assets/Globalization-amico.svg";
import API from "../api";


const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  });

  const [userEmail, setUserEmail] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserEmail(user.email || "");
        setFormData((prev) => ({ ...prev, name: user.name || "" }));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/contact",
        { ...formData, email: userEmail },
        {
          headers: {
            Authorization: `Bearer ${token || ""}`,
            "Content-Type": "application/json",
          },
        }
      );

      setStatus(res?.data?.message || "Message sent");
      setFormData({ name: formData.name, message: "" });
    } catch (err) {
      console.error("Contact submit error:", err?.response || err);
      setStatus(
        err?.response?.data?.message ||
          "Failed to send message. Please try again later."
      );
    }
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center"
      style={{ background: "#f5f3ff", minHeight: "100vh" }}
    >
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="mb-4 mb-md-0 text-center">
            {/* ✅ Use the imported SVG */}
            <img
              src={contactIllustration}
              alt="Contact Illustration"
              className="img-fluid"
              style={{ maxHeight: "350px" }}
            />
          </Col>

          <Col md={6}>
            <Card className="shadow-sm border-0 p-4 rounded-4">
              <h3 className="fw-bold mb-4 text-center">Contact Us</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="rounded-3"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={userEmail}
                    disabled
                    className="rounded-3"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="message">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="message"
                    rows={4}
                    placeholder="Write your message"
                    value={formData.message}
                    onChange={handleChange}
                    className="rounded-3"
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="dark"
                    type="submit"
                    className="rounded-3 fw-bold"
                  >
                    Submit
                  </Button>
                </div>
              </Form>
              {status && <p className="text-center mt-3">{status}</p>}
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default Contact;
