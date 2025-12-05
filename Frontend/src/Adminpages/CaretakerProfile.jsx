import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Tabs,
  Tab,
  Pagination,
  Spinner,
} from "react-bootstrap";
import {
  Trophy,
  Users,
  Award,
  Activity,
  Star,
  Phone,
  Briefcase,
  Mail,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";

const CaretakerProfile = () => {
  const PAGE_SIZE = 5;
  const { color, theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [caretaker, setCaretaker] = useState({});
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalPoints: 0,
    chatMessages: 0,
    uniqueChats: 0,
    activities: [],
    patients: [],
    rating: 0,
    specialties: [],
    experience: "",
    phone: "",
    initials: "",
  });
  const [todayCounts, setTodayCounts] = useState({
    sessions: 0,
    points: 0,
    chats: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [chattedTodayIds, setChattedTodayIds] = useState([]);

  const colorMap = {
    blue: "#3b82f6",
    purple: "#8b5cf6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    orange: "#f97316",
  };
  const accent = colorMap[color] || "#3b82f6";

  // Load caretaker from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCaretaker(JSON.parse(stored));
  }, []);

  // Fetch caretaker stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const profileRes = await API.get("/caretaker/profile");
        const interactionRes = await API.get("/caretaker/chat/interactions");
        const todayRes = await API.get("/caretaker/chat/interactions/today");
        setStats((prev) => ({
          ...prev,
          ...profileRes.data,
          ...(profileRes.data.profile || {}),
          specialties: profileRes.data.specialties || [],
          patients: profileRes.data.patients || [],
          activities: [
            ...(profileRes.data.profile?.activities || []),
            ...(profileRes.data.activities || []),
          ],
          uniqueChats: interactionRes.data?.count || 0,
          todayProgress: todayRes.data,
        }));
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch IDs chatted today
  useEffect(() => {
    API.get("/caretaker/chat/interactions/today/users")
      .then((res) => setChattedTodayIds(res.data.userIds || []))
      .catch(() => setChattedTodayIds([]));
  }, []);

  // Calculate today’s activities
  useEffect(() => {
    const today = new Date();
    let sessions = 0,
      points = 0,
      chats = 0;
    (stats.activities || []).forEach((a) => {
      const d = new Date(a.time);
      if (d.toDateString() === today.toDateString()) {
        if (a.type === "chat") chats++;
        else {
          sessions++;
          points += a.points || 0;
        }
      }
    });
    setTodayCounts({ sessions, points, chats });
  }, [stats.activities]);

  // ✅ Compute completed/pending sessions
  const completedCount =
    stats.patients?.filter((p) => chattedTodayIds.includes(p._id)).length || 0;
  const pendingCount = (stats.patients?.length || 0) - completedCount;

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant={color} />
      </div>
    );

  const overallActivities = [...(stats.activities || [])];
  const todayActivities = overallActivities.filter(
    (a) => new Date(a.time).toDateString() === new Date().toDateString()
  );
  const totalPages = Math.max(
    1,
    Math.ceil(overallActivities.length / PAGE_SIZE)
  );
  const pagedOverall = overallActivities
    .slice()
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const achievement =
    stats.totalSessions >= 100
      ? {
          title: "Session Pro Badge",
          emoji: "🏆",
          color: "#FFD700",
          desc: "Awarded for completing over 100 patient sessions.",
        }
      : stats.totalSessions >= 20
      ? {
          title: "Active Therapist Badge",
          emoji: "🏅",
          color: "#C0C0C0",
          desc: "Awarded for completing over 20 patient sessions.",
        }
      : null;

  const profileName = caretaker.name || "Unnamed Caretaker";
  const displayInitials =
    stats.initials || profileName.split(" ").map((n) => n[0]).join("");
  const cardBg = isDark ? "bg-secondary" : "bg-white";
  const headerBg = isDark ? "bg-dark" : "bg-light";
  const textColor = isDark ? "text-light" : "text-dark";
  const mutedText = isDark ? "text-light-emphasis" : "text-muted";
  const sectionHeader = isDark
    ? "bg-dark text-light border-bottom border-secondary"
    : "bg-light text-dark border-bottom";

  return (
    <Container
      fluid
      className={`py-5 min-vh-100 ${
        isDark ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      {/* Profile Header Card */}
      <Card className={`mb-4 shadow-lg border-0 ${cardBg} ${textColor}`}>
        <Card.Body className="p-4 p-md-5">
          <Row className="align-items-center">
            {/* Profile Info */}
            <Col
              md={6}
              lg={4}
              className="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start mb-4 mb-md-0"
            >
              {caretaker.photo ? (
                <img
                  src={caretaker.photo}
                  alt="Caretaker"
                  className="rounded-circle mb-3 mb-md-0"
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    border: `4px solid ${accent}`,
                    boxShadow: `0 0 10px ${accent}40`,
                  }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3 mb-md-0"
                  style={{
                    width: 100,
                    height: 100,
                    fontSize: "2.5rem",
                    background: accent,
                    color: "#fff",
                    border: `4px solid ${isDark ? "#444" : "#ddd"}`,
                    fontWeight: "bold",
                  }}
                >
                  {displayInitials.substring(0, 2).toUpperCase() || "?"}
                </div>
              )}

              <div className="ms-md-4 text-center text-md-start">
                <h2 className="fw-bold mb-1">{profileName}</h2>
                <p className={`mb-1 ${mutedText}`}>
                  <Mail size={14} className="me-1" /> {caretaker.email}
                </p>
                <p className="mb-1">
                  <Briefcase size={14} className="me-1" />{" "}
                  {caretaker.role || "Caretaker"}
                </p>
                <p className="mb-1">
                  <Phone size={14} className="me-1" /> Phone:{" "}
                  {stats.phone || "N/A"}
                </p>
                <p className="mb-1">
                  <Briefcase size={14} className="me-1" /> Experience:{" "}
                  {stats.experience || "N/A"}
                </p>
                <p className="mb-1 d-flex align-items-center justify-content-center justify-content-md-start">
                  <Star
                    size={14}
                    className="me-1"
                    color="#FFD700"
                    fill="#FFD700"
                  />{" "}
                  Rating: {stats.rating?.toFixed(1) || 0.0}
                  <span className="ms-2">
                    <Badge
                      bg={
                        caretaker.status === "Available"
                          ? "success"
                          : "secondary"
                      }
                      className="ms-2"
                    >
                      <CheckCircle size={14} className="me-1" />{" "}
                      {caretaker.status || "Active"}
                    </Badge>
                  </span>
                </p>
                <p className="mb-0 small">
                  Specialties:{" "}
                  {stats.specialties.length > 0
                    ? stats.specialties.map((s) => (
                        <Badge key={s} bg="info" className="me-1">
                          {s}
                        </Badge>
                      ))
                    : "N/A"}
                </p>
              </div>
            </Col>

            {/* ===== UPDATED STATS CARDS ===== */}
            <Col md={6} lg={8}>
              <Row className="g-3">
                {[
                  {
                    label: "Interactions",
                    value: stats.chatMessages || 0,
                    icon: <Users size={20} />,
                    color: accent,
                  },
                  {
                    label: `Completed Sessions (${completedCount}/${
                      stats.patients?.length || 0
                    })`,
                    value: completedCount,
                    icon: <CheckCircle size={20} />,
                    color: "#22c55e", // green
                  },
                  {
                    label: `Pending Sessions (${pendingCount})`,
                    value: pendingCount,
                    icon: <Clock size={20} />,
                    color: "#eab308", // yellow
                  },
                  {
                    label: "Assigned Patients",
                    value: stats.patients?.length || 0,
                    icon: <Users size={20} />,
                    color: accent,
                  },
                ].map((item, i) => (
                  <Col xs={12} sm={6} lg={4} xl={3} className="text-center" key={i}>
                    <Card
                      className={`${
                        isDark ? "bg-dark" : "bg-light"
                      } p-3 shadow-sm border-0`}
                      style={{ borderLeft: `3px solid ${item.color}` }}
                    >
                      <div className="d-flex align-items-center justify-content-center flex-column">
                        <span style={{ color: item.color }} className="mb-1">
                          {item.icon}
                        </span>
                        <h4
                          className="fw-bold mb-0"
                          style={{ color: item.color }}
                        >
                          {item.value || 0}
                        </h4>
                        <p
                          className="small mb-0 mt-1"
                          style={{ color: isDark ? "#94a3b8" : "#6c757d" }}
                        >
                          {item.label}
                        </p>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k || "overview")} className={`mb-3 p-2 ${headerBg} rounded shadow-sm`} justify variant="pills">
        <Tab eventKey="overview" title="Overview" />
        <Tab eventKey="activity" title="Activity Feed" />
      </Tabs>

      {/* Overview */}
      {activeTab === "overview" && (
        <Row className="g-4">
          <Col md={6}>
            <Card className={`h-100 ${cardBg} ${textColor} shadow-lg border-0`}>
              <Card.Header className={`fw-bold ${sectionHeader} p-3`}>
                <Trophy size={18} className="me-2" style={{ color: accent }} /> Achievements
              </Card.Header>
              <Card.Body>
                {achievement ? (
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center align-items-start p-3 rounded-lg border" style={{ background: isDark ? "#1e293b" : "#f1f3f5", borderColor: accent, gap: "0.5rem" }}>
                    <div className="d-flex align-items-center flex-grow-1">
                      <Award className="me-3 flex-shrink-0" size={30} style={{ color: achievement.color }} fill={achievement.color} />
                      <div>
                        <h6 className="mb-0 fw-bold">{achievement.emoji} {achievement.title}</h6>
                        <p className="small mb-0" style={{ color: mutedText }}>{achievement.desc}</p>
                      </div>
                    </div>
                    <Badge className="align-self-start align-self-sm-center text-uppercase fw-bold" style={{ background: achievement.color, color: isDark ? "#1f2937" : "#333", fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}>
                      {stats.totalSessions} sessions
                    </Badge>
                  </div>
                ) : (
                  <p className="text-center m-0 py-5 fw-semibold" style={{ color: mutedText }}>No achievements yet. Keep up the great work! 🚀</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className={`h-100 ${cardBg} ${textColor} shadow-lg border-0`}>
              <Card.Header className={`fw-bold ${sectionHeader} p-3`}>
                <Users size={18} className="me-2" style={{ color: accent }} /> Assigned Patients List
              </Card.Header>
              <Card.Body className="d-flex flex-column justify-content-between">
                {stats.patients?.length > 0 ? (
                  stats.patients.map((patient, index) => {
                    // patient._id is userId of assigned patient
                    const isSessionCompleted = chattedTodayIds.includes(patient._id);
                    return (
                      <div key={index} className="d-flex align-items-center border-bottom py-2">
                        <Users size={16} className="me-3" color={accent} />
                        <p className="mb-0 fw-semibold">{patient.name || `Patient ID: ${patient._id}`}</p>
                        <Badge bg={patient.status === 'Active' ? 'secondary' : 'dark'} className="ms-2">{patient.status || 'Active'}</Badge>
                        <Badge bg={isSessionCompleted ? "success" : "warning"} className="ms-auto">
                          {isSessionCompleted ? "Session Completed" : "Session Pending"}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center m-0 py-5 fw-semibold" style={{ color: mutedText }}>No patients currently assigned.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Activity Feed */}
      {activeTab === "activity" && (
        <Row>
          <Col>
            <Card className={`mb-4 ${cardBg} ${textColor} shadow-lg border-0`}>
              <Card.Body>
                <Tabs defaultActiveKey="overall" id="activity-subtabs" className="mb-3" variant="underline">
                  <Tab eventKey="today" title={`Today (${todayActivities.length})`}>
                    <div className="p-3">
                      {todayActivities.length > 0 ? (
                        todayActivities
                          .slice()
                          .reverse()
                          .map((a, idx) => (
                            <div key={idx} className={`d-flex align-items-center mb-3 p-2 rounded ${isDark ? 'hover-bg-dark' : 'hover-bg-light'}`} style={{ borderLeft: `3px solid ${accent}` }}>
                              <span style={{ width: 30, fontSize: '1.2rem' }}>{a.type === "chat" ? "💬" : "🧑‍💻"}</span>
                              <div className="flex-grow-1 ms-3">
                                <h6 className="mb-0 fw-semibold">{a.title || (a.type === "chat" ? "Chat Message" : "Session")}</h6>
                                <p className="small mb-0" style={{ color: mutedText }}>{new Date(a.time).toLocaleTimeString()}</p>
                              </div>
                              {a.points > 0 && <Badge style={{ background: accent }} className="ms-auto fw-bold">+{a.points} pts</Badge>}
                            </div>
                          ))
                      ) : (
                        <p className="text-center m-0 py-5" style={{ color: mutedText }}>No activity recorded for today.</p>
                      )}
                    </div>
                  </Tab>

                  <Tab eventKey="overall" title={`Overall (${overallActivities.length})`}>
                    <div className="p-3">
                      {overallActivities.length === 0 ? (
                        <p className="text-center m-0 py-5" style={{ color: mutedText }}>No activity has been recorded yet.</p>
                      ) : (
                        <>
                          {pagedOverall.map((a, idx) => (
                            <div key={idx} className={`d-flex align-items-center mb-3 p-2 rounded ${isDark ? 'hover-bg-dark' : 'hover-bg-light'}`} style={{ borderLeft: `3px solid ${accent}` }}>
                              <span style={{ width: 30, fontSize: '1.2rem' }}>{a.type === "chat" ? "💬" : "🧑‍💻"}</span>
                              <div className="flex-grow-1 ms-3">
                                <h6 className="mb-0 fw-semibold">{a.title || (a.type === "chat" ? "Chat Message" : "Session")}</h6>
                                <p className="small mb-0" style={{ color: mutedText }}>{new Date(a.time).toLocaleString()}</p>
                              </div>
                              {a.points > 0 && <Badge style={{ background: accent }} className="ms-auto fw-bold">+{a.points} pts</Badge>}
                            </div>
                          ))}
                          {/* Pagination */}
                          <div className="d-flex justify-content-center mt-4">
                            <Pagination size="sm">
                              <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                              <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p >= currentPage - 2 && p <= currentPage + 2)
                                .map(p => (
                                  <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>{p}</Pagination.Item>
                                ))}
                              <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                              <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                          </div>
                        </>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CaretakerProfile;
