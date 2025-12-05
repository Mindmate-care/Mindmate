import React, { useState, useRef, useEffect, memo } from "react";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Form,
  Button,
  Badge,
  Spinner,
  Figure,
} from "react-bootstrap";
import { BsSend, BsArrowLeft } from "react-icons/bs";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";
import { io } from "socket.io-client";
import logo from "../assets/logo.png"; // adjust path if needed

// ✅ Responsive width hook
const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
};

// ✅ Chat bubble
const MessageBubble = memo(({ msg, isMe, chosenColor }) => {
  const bubbleColor = isMe ? chosenColor : "#e9ecef";
  const textColor = isMe ? "#fff" : "#000";
  const timeText =
    msg.time ||
    new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      className={`d-flex mb-3 ${
        isMe ? "justify-content-end" : "justify-content-start"
      }`}
    >
      <div
        style={{
          background: bubbleColor,
          color: textColor,
          padding: "10px 14px",
          borderRadius: 12,
          maxWidth: "80%",
          wordBreak: "break-word",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ whiteSpace: "pre-wrap" }}>
          {msg.message || msg.content || ""}
        </div>
        <div
          className="text-end small mt-1"
          style={{
            color: isMe ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.45)",
          }}
        >
          {timeText}
        </div>
      </div>
    </div>
  );
});

const CaretakerChat = () => {
  const { color, theme } = useTheme();
  const width = useWindowWidth();

  const colorMap = {
    blue: "#3b82f6",
    purple: "#8b5cf6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    orange: "#f97316",
  };
  const chosenColor = colorMap[color] || "#3b82f6";
  const isDark = theme === "dark";

  const storedCaretaker = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const currentCaretakerId = storedCaretaker?._id || storedCaretaker?.id;

  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [socket, setSocket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const chatEndRef = useRef(null);
  const isMobile = width < 768;

  // ✅ Socket Setup
  useEffect(() => {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
    const socketUrl =
      apiBase.replace(/\/api\/?$/, "") || "http://localhost:3000";
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("⚠️ No token found for Socket.IO connection.");
      return;
    }

    const s = io(socketUrl, { auth: { token } });
    setSocket(s);

    s.on("receive_message", (chat) => {
  const senderId = chat?.sender?._id || chat?.sender;
  if (!senderId) return;

  // Ignore messages from self
  if (String(senderId) === String(currentCaretakerId)) return;

  // Add message to chat window
  setMessages((prev) => [...prev, chat]);

  // Mark user in list as having a new message and move them to top
  setUsers((prev) => {
    const idx = prev.findIndex((u) => String(u._id) === String(senderId));
    if (idx === -1) return prev;

    const updatedUser = {
      ...prev[idx],
      hasNewMsg: true,
      lastMessageTime: chat.createdAt || new Date().toISOString(),
    };

    const newArr = [updatedUser, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
    return newArr;
  });
});


    s.on("connect_error", (err) => {
      console.error("Socket connect_error:", err);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, []);

  // ✅ Fetch users only
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRes = await API.get("/chat");
        const mappedUsers = (usersRes.data || []).map((u) => ({
          ...u,
          type: "user",
        }));
        setUsers(mappedUsers);
      } catch (err) {
        console.error("Failed fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Load chat messages
  useEffect(() => {
    let cancelled = false;
    const loadMessages = async () => {
      if (!activeUser || activeUser.type === "ai") return;
      setIsLoadingMessages(true);
      setMessages([]);
      try {
        const type = activeUser.type === "user" ? "user" : "caretaker";
        const res = await API.get(
          `/chat/messages/${activeUser._id}?type=${type}`
        );

        if (!cancelled) setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    };
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [activeUser]);

  // ✅ Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiMessages]);

  // ✅ Send to socket
  const handleSendToSocket = async (text) => {
  if (!socket || !activeUser) return;

  const payload = {
    receiver: activeUser._id,
    receiverType: activeUser.type,
    message: text,
  };

  const optimistic = {
    _id: `local-${Date.now()}`,
    sender: currentCaretakerId,
    receiver: activeUser._id,
    message: text,
    createdAt: new Date().toISOString(),
  };

  // Show immediately in chat
  setMessages((prev) => [...prev, optimistic]);

  // Move active user to top (clear hasNewMsg)
  setUsers((prev) => {
    const idx = prev.findIndex((u) => String(u._id) === String(activeUser._id));
    if (idx === -1) return prev;

    const updatedUser = {
      ...prev[idx],
      hasNewMsg: false,
      lastMessageTime: optimistic.createdAt,
    };

    const newArr = [updatedUser, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
    return newArr;
  });

  socket.emit("send_message", payload);

  try {
    await API.post("/caretaker/updateProfile");
  } catch (err) {
    console.error("Profile update error:", err);
  }
};


  // ✅ AI Chat
  const handleAiSend = async (text) => {
    const userMsg = {
      message: text,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    setAiMessages((prev) => [...prev, userMsg]);

    try {
      const res = await API.post("/chat", {
        messages: [
          ...(aiMessages || []).map((m) => ({
            role: m.role || "assistant",
            content: m.message || m.content,
          })),
          { role: "user", content: text },
        ],
      });

      const botContent =
        res.data?.message?.content ||
        res.data?.reply ||
        "Sorry, I couldn't process that.";
      const botMsg = {
        message: botContent,
        role: "assistant",
        createdAt: new Date().toISOString(),
      };
      setAiMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("AI chat error:", err);
      setAiMessages((prev) => [
        ...prev,
        {
          message: "AI is unavailable right now.",
          role: "assistant",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  // ✅ Send handler
  const handleSend = (e) => {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text || !activeUser) return;
    if (activeUser.type === "ai") handleAiSend(text);
    else handleSendToSocket(text);
    setNewMessage("");
  };

  const sidebarItemStyle = (isActive) => ({
    backgroundColor: isActive ? chosenColor : isDark ? "#0b1220" : "#fff",
    color: isActive ? "#fff" : isDark ? "#ddd" : "#000",
    borderRadius: 8,
    padding: "8px 10px",
    cursor: "pointer",
  });

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container
      fluid
      className="p-0"
      style={{
        height: "100vh",
        background: isDark ? "#0b1220" : "#f8f9fa",
        color: isDark ? "#fff" : "#000",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Row
        className="g-0 flex-grow-1"
        style={{ height: "100%", flexWrap: "nowrap" }}
      >
        {/* Sidebar */}
        <Col
          md={4}
          lg={3}
          style={{
            borderRight: `1px solid ${isDark ? "#1f2937" : "#dee2e6"}`,
            background: isDark ? "#0f172a" : "#fff",
            overflowY: "auto",
            display: isMobile && !showSidebar ? "none" : "block",
            position: isMobile ? "absolute" : "relative",
            zIndex: 3,
            height: "100%",
          }}
        >
          <div style={{ padding: 16 }}>
            {isMobile && activeUser && (
              <Button
                variant="light"
                className="mb-3"
                onClick={() => setShowSidebar(false)}
              >
                <BsArrowLeft /> Back
              </Button>
            )}

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
                style={{
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  color: isDark ? "#f1f5f9" : "#000",
                  borderColor: isDark ? "#334155" : "#ced4da",
                }}
              />
            </Form.Group>
            <h6 style={{ color: chosenColor }}>Users</h6>
            <ListGroup variant="flush">
              {filteredUsers
                .filter((u) => u.type === "user")
                .map((u) => (
                  <ListGroup.Item
                    key={`user-${u._id}`}
                    action
                    onClick={() => {
                      setActiveUser({ ...u, type: "user" });

                      // Clear new message flag + move to top
                      setUsers((prev) => {
                        const idx = prev.findIndex((p) => String(p._id) === String(u._id));
                        if (idx === -1) return prev;

                        const updatedUser = { ...prev[idx], hasNewMsg: false };
                        const newArr = [updatedUser, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
                        return newArr;
                      });

                      if (isMobile) setShowSidebar(false);
                    }}

                    active={
                      activeUser?._id === u._id && activeUser?.type === "user"
                    }
                    style={sidebarItemStyle(
                      activeUser?._id === u._id && activeUser?.type === "user"
                    )}
                    className="d-flex align-items-center"
                  >
                    <Figure.Image
                      width={36}
                      height={36}
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        u.name || "User"
                      )}&background=random`}
                      roundedCircle
                      className="me-2"
                    />
                    <div className="d-flex align-items-center justify-content-between w-100">
  <div>
    <div>{u.name}</div>
    <div
      className="small"
      style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#6c757d" }}
    >
      {u.email}
    </div>
  </div>

  {u.hasNewMsg && (
    <Badge
      bg="danger"
      style={{
        fontSize: "0.7rem",
        background: chosenColor,
        color: "#fff",
      }}
    >
      New
    </Badge>
  )}
</div>

                  </ListGroup.Item>
                ))}
            </ListGroup>

            <h6 style={{ color: chosenColor, marginTop: 16 }}>AI Assistant</h6>
            <ListGroup variant="flush">
              <ListGroup.Item
                action
                onClick={() => {
                  setActiveUser({
                    name: "MindMate AI",
                    type: "ai",
                    _id: "ai",
                  });
                  if (isMobile) setShowSidebar(false);
                }}
                active={activeUser?.type === "ai"}
                style={sidebarItemStyle(activeUser?.type === "ai")}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <Figure.Image
                      width={36}
                      height={36}
                      src={`https://ui-avatars.com/api/?name=MindMate+AI&background=random`}
                      roundedCircle
                      className="me-2"
                    />
                    <div>
                      <div>MindMate AI</div>
                      <div
                        className="small"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.6)" : "#6c757d",
                        }}
                      >
                        Virtual assistant
                      </div>
                    </div>
                  </div>
                  <Badge
                    bg="info"
                    style={{ background: chosenColor, color: "#fff" }}
                  >
                    AI
                  </Badge>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </div>
        </Col>

        {/* Chat Area */}
        <Col
          md={8}
          lg={9}
          style={{
            background: isDark ? "#071027" : "#f1f3f5",
            display: "flex",
            flexDirection: "column",
            justifyContent: activeUser ? "flex-start" : "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          {!activeUser ? (
            <div
              style={{
                background: isDark ? "#0b1220" : "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                borderRadius: 16,
                textAlign: "center",
                padding: 32,
              }}
            >
              <Figure.Image
                width={64}
                height={64}
                src={logo}
                roundedCircle
                className="mb-3"
                style={{
                  filter: isDark ? "none" : "brightness(0)",
                }}
              />
              <h4 style={{ color: chosenColor }}>MindMate Care</h4>
              <p>
                Connect with your users or chat with the AI assistant for
                insights.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                style={{
                  padding: "10px 16px",
                  borderBottom: `1px solid ${isDark ? "#111827" : "#e9ecef"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                }}
              >
                {isMobile && (
                  <Button
                    variant="link"
                    className="p-0 me-2"
                    onClick={() => setShowSidebar(true)}
                  >
                    <BsArrowLeft size={20} color={chosenColor} />
                  </Button>
                )}
                <Figure.Image
                  width={40}
                  height={40}
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    activeUser.name || "User"
                  )}&background=random`}
                  roundedCircle
                  className="me-2"
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{activeUser.name}</div>
                  <div className="small text-muted">
                    {activeUser.type === "ai"
                      ? "Virtual Assistant"
                      : activeUser.email}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: 16,
                  width: "100%",
                }}
              >
                {activeUser.type === "ai" ? (
                  aiMessages.map((m, idx) => (
                    <MessageBubble
                      key={`ai-${idx}`}
                      msg={m}
                      isMe={m.role === "user"}
                      chosenColor={chosenColor}
                    />
                  ))
                ) : isLoadingMessages ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <Spinner
                      animation="border"
                      style={{ color: chosenColor }}
                    />
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <MessageBubble
                      key={m._id || idx}
                      msg={m}
                      isMe={String(m.sender) === String(currentCaretakerId)}
                      chosenColor={chosenColor}
                    />
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div
                style={{
                  padding: 12,
                  borderTop: `1px solid ${isDark ? "#111827" : "#e9ecef"}`,
                  background: isDark ? "#071029" : "#fff",
                  width: "100%",
                }}
              >
                <Form onSubmit={handleSend}>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder={`Message ${activeUser.name}`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim()}
                      style={{
                        background: chosenColor,
                        borderColor: chosenColor,
                      }}
                    >
                      <BsSend />
                    </Button>
                  </div>
                </Form>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CaretakerChat;
