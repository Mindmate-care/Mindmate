import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Badge,
  Form,
} from "react-bootstrap";
import { Trophy, TrendingUp, Users, Gamepad, MessageSquare } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const levelColors = {
  Gold: "#FFD700",
  Silver: "#C0C0C0",
  Bronze: "#CD7F32",
  Newbie: "#A9A9A9",
};

const TrackProgress = () => {
  const { color, theme } = useTheme();
  const isDark = theme === "dark";
  const [users, setUsers] = useState([]);
  const [todayProgress, setTodayProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const accentColors = {
    blue: "#3b82f6",
    purple: "#8b5cf6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    orange: "#f97316",
  };
  const accent = accentColors[color] || "#3b82f6";

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const res = await API.get("/chat"); // fetch all users
        const allUsers = res.data || [];

        // Sort by total points
        const sorted = allUsers.sort(
          (a, b) => (b.profile?.points || 0) - (a.profile?.points || 0)
        );
        setUsers(sorted);

        // Today's progress
        const today = new Date();
        const todayData = allUsers.map((user) => {
          const activities = user.profile?.activities || [];
          const todayPoints = activities
            .filter((a) => {
              const d = new Date(a.time);
              return (
                d.getFullYear() === today.getFullYear() &&
                d.getMonth() === today.getMonth() &&
                d.getDate() === today.getDate()
              );
            })
            .reduce((sum, a) => sum + (a.points || 0), 0);
          return { name: user.name, points: todayPoints, ...user.profile };
        });
        setTodayProgress(todayData);
      } catch (err) {
        console.error("Error fetching caretaker progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // Level distribution for Pie Chart
  const levelData = ["Gold", "Silver", "Bronze", "Newbie"].map((lvl) => ({
    name: lvl,
    value: users.filter((u) => {
      const pts = u.profile?.points || 0;
      if (lvl === "Gold") return pts >= 3000;
      if (lvl === "Silver") return pts >= 2000 && pts < 3000;
      if (lvl === "Bronze") return pts >= 1000 && pts < 2000;
      return pts < 1000;
    }).length,
  }));

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className={`fw-bold ${isDark ? "text-light" : "text-dark"}`}>
          Track Progress
        </h2>
        <p className={`${isDark ? "text-secondary" : "text-muted"}`}>
          Monitor users’ improvement and engagement with interactive stats.
        </p>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <Card className={`shadow-sm h-100 ${isDark ? "bg-dark text-light" : "bg-white text-dark"}`}>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <Trophy size={24} className="me-2 text-warning" />
                <h5 className="mb-0">Top Performing Users</h5>
              </div>

              <Form.Control
                type="text"
                placeholder="Search users..."
                className="mb-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {filteredUsers.length > 0 ? (
                <Table hover responsive bordered className={`${isDark ? "table-dark table-striped" : "table-light table-striped"}`}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Points</th>
                      <th>Level</th>
                      <th>Games</th>
                      <th>Chats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.slice(0, 10).map((user, idx) => {
                      const pts = user.profile?.points || 0;
                      const level =
                        pts >= 3000 ? "Gold" :
                        pts >= 2000 ? "Silver" :
                        pts >= 1000 ? "Bronze" :
                        "Newbie";
                      return (
                        <tr key={user._id} style={{ cursor: "pointer" }} title={`${user.profile?.achievements?.length || 0} achievements`}>
                          <td>{idx < 3 ? "🏆" : `#${idx + 1}`}</td>
                          <td>{user.name}</td>
                          <td>{pts}</td>
                          <td>
                            <Badge bg="" style={{ backgroundColor: levelColors[level], color: "#fff" }}>
                              {level}
                            </Badge>
                          </td>
                          <td>{user.profile?.gamesPlayed || 0}</td>
                          <td>{user.profile?.chatMessages || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : <p>No users found.</p>}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className={`shadow-sm h-100 ${isDark ? "bg-dark text-light" : "bg-white text-dark"}`}>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <TrendingUp size={24} className="me-2 text-success" />
                <h5 className="mb-0">Today's Progress</h5>
              </div>
              {todayProgress.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={todayProgress} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" stroke={isDark ? "#fff" : "#000"} />
                    <YAxis stroke={isDark ? "#fff" : "#000"} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDark ? "#333" : "#fff", color: isDark ? "#fff" : "#000" }}
                      formatter={(value, name, props) => [`${value} pts`, "Points"]}
                    />
                    <Bar dataKey="points" fill={accent} animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p>No progress recorded for today.</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className={`shadow-sm h-100 ${isDark ? "bg-dark text-light" : "bg-white text-dark"}`}>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <Users size={24} className="me-2 text-primary" />
                <h5 className="mb-0">Level Distribution</h5>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={levelData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    fill={accent}
                    label
                  >
                    {levelData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={levelColors[entry.name]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className={`shadow-sm h-100 ${isDark ? "bg-dark text-light" : "bg-white text-dark"}`}>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <Gamepad size={24} className="me-2 text-success" />
                <h5 className="mb-0">Overall Stats</h5>
              </div>
              <p>Total Users: <strong>{users.length}</strong></p>
              <p>Active Today: <strong>{todayProgress.filter(u => u.points > 0).length}</strong></p>
              <p>Total Points: <strong>{users.reduce((sum,u) => sum + (u.profile?.points||0),0)}</strong></p>
              <p>Total Games Played: <strong>{users.reduce((sum,u) => sum + (u.profile?.gamesPlayed||0),0)}</strong></p>
              <p>Total Chat Messages: <strong>{users.reduce((sum,u) => sum + (u.profile?.chatMessages||0),0)}</strong></p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TrackProgress;
