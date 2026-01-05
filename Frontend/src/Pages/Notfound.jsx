import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <h1 className="display-1 fw-bold">404</h1>
            <p className="fs-4 text-muted mb-4">Oops! Page not found</p>
            <Button variant="primary" href="/">
              Return to Home
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFound;
