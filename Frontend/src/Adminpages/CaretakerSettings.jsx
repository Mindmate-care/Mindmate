// src/Pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import "../App.css";
import {
  Container,
  Row,
  Col,
  Tab,
  Nav,
  Card,
  Form,
  Button,
  Alert,
  Offcanvas,
} from "react-bootstrap";
import { User, Bell, Palette, Eye, Lock, LogOut, Menu } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  // Theme context (keeps your existing theme behavior)
  const { theme, setTheme, color, setColor, font, setFont, accessibility, setAccessibility } =
    useTheme();

  // UI & device state
  const [activeKey, setActiveKey] = useState("profile");
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);

  // Loading state (single)
  const [loading, setLoading] = useState(true);

  // Profile & Settings state
  const [profile, setProfile] = useState({ name: "", email: "", photo: "" });
  const [settings, setSettings] = useState({
    theme: "light",
    color: "blue",
    font: "default",
    accessibility: { largeText: false },
    notifications: { email: true, sms: false, push: false },
  });

  // Local fields for editing name/photo (two-way with profile)
  const [nameValue, setNameValue] = useState("");
  const [photoValue, setPhotoValue] = useState("");

  // OTP / Password / Email change states (kept from your original)
  const [otpSent, setOtpSent] = useState(false);
  const [otpStatus, setOtpStatus] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailChangeSent, setEmailChangeSent] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [confirmingEmail, setConfirmingEmail] = useState(false);
  const [newEmailValue, setNewEmailValue] = useState("");
  const [emailOtpValue, setEmailOtpValue] = useState("");

  const [privacyView, setPrivacyView] = useState(null);

  // chosenColor helper
  const chosenColor =
    {
      blue: "#3b82f6",
      purple: "#8b5cf6",
      green: "#22c55e",
      yellow: "#eab308",
      red: "#ef4444",
      orange: "#f97316",
    }[color] || "#3b82f6";

  // ---------------------------
  // Utility: check token and redirect if expired
  // ---------------------------
  const checkTokenExpiry = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return false;
      }
      return true;
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      window.location.href = "/login";
      return false;
    }
  };

  // ---------------------------
  // Device detection + token check
  // ---------------------------
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);

    // Check token once on mount
    checkTokenExpiry();

    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ---------------------------
  // Load user and settings on mount
  // ---------------------------
  useEffect(() => {
    const load = async () => {
      try {
        // Load local user (instant)
        const local = localStorage.getItem("user");
        if (local) {
          const u = JSON.parse(local);
          setProfile((p) => ({ ...p, name: u.name || "", email: u.email || "", photo: u.photo || "" }));
          setNameValue(u.name || "");
          setPhotoValue(u.photo || "");
        }

        // Load server settings
        try {
          const res = await API.get("/auth/settings");
          if (res?.data) {
            setSettings(res.data);
            if (res.data.theme) setTheme(res.data.theme);
            if (res.data.color) setColor(res.data.color);
            if (res.data.font) setFont(res.data.font);
            if (res.data.accessibility) setAccessibility(res.data.accessibility);
          }
        } catch (err) {
          // non-fatal — keep local user if server call fails
          console.error("Failed to fetch settings:", err);
        }
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
    // Only when mount / theme setters are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // Handlers
  // ---------------------------

  // Profile image upload: preview + save to localStorage immediately
  const handlePhotoSelect = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPhotoValue(base64);
      setProfile((p) => ({ ...p, photo: base64 }));

      // persist immediately so other pages show it
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updated = { ...localUser, photo: base64 };
      localStorage.setItem("user", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoSelect(file);
  };

  // Save profile to backend and localStorage
  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Prepare payload
      const payload = { name: nameValue, photo: photoValue };

      // Try the recommended endpoint. If your backend uses a different route,
      // change this to your endpoint (for example: "/auth/profile" or "/auth/update-profile").
      await API.put("/auth/update-basic", payload);

      // Update localStorage user copy
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedLocalUser = { ...localUser, name: nameValue, photo: photoValue };
      localStorage.setItem("user", JSON.stringify(updatedLocalUser));
      setProfile((p) => ({ ...p, name: nameValue, photo: photoValue }));

      alert("Profile updated successfully");
    } catch (err) {
      console.error("Failed to save profile:", err);
      // If server does not have /auth/update-basic, try fallback endpoint
      try {
        // Fallback to /auth/profile (this maps to updateProfile controller if you expose that route)
        await API.put("/auth/profile", { name: nameValue, photo: photoValue });
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedLocalUser = { ...localUser, name: nameValue, photo: photoValue };
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));
        setProfile((p) => ({ ...p, name: nameValue, photo: photoValue }));
        alert("Profile updated (via fallback endpoint).");
      } catch (fallbackErr) {
        console.error("Fallback profile update failed:", fallbackErr);
        alert("Failed to update profile. Make sure backend route /auth/update-basic or /auth/profile exists.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Save entire settings (profile copy + appearance)
  const handleSaveSettings = async () => {
    try {
      const payload = {
        profile, // keep server settings consistent
        theme,
        color,
        font,
        accessibility,
        notifications: settings.notifications,
      };
      await API.put("/auth/settings", payload);
      alert("Settings saved!");
    } catch (err) {
      console.error("Save settings error:", err);
      alert("Failed to save settings");
    }
  };

  // OTP / privacy handlers (kept, minimally cleaned)
  const handleRequestOtp = async () => {
    setSendingOtp(true);
    setOtpStatus("");
    try {
      await API.post("/auth/privacy/request-otp");
      setOtpSent(true);
      setOtpStatus("OTP sent to your email.");
    } catch (err) {
      console.error("Request OTP error:", err?.response || err);
      setOtpStatus(err?.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetWithOtp = async (e) => {
    e?.preventDefault();
    setOtpStatus("");
    if (!otpValue) return setOtpStatus("Please enter the OTP.");
    if (!newPassword || newPassword.length < 6) return setOtpStatus("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setOtpStatus("Passwords do not match.");

    setResetLoading(true);
    try {
      const res = await API.post("/auth/privacy/reset", { otp: otpValue, newPassword });
      setOtpStatus(res?.data?.message || "Password changed successfully.");
      setOtpValue("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpSent(false);
      setPrivacyView(null);
      if (isMobile) setShowSidebarMobile(false);
    } catch (err) {
      console.error("Reset with OTP error:", err?.response || err);
      setOtpStatus(err?.response?.data?.message || "Failed to reset password. Try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmailValue || !/^\S+@\S+\.\S+$/.test(newEmailValue)) {
      setEmailStatus("Enter a valid new email address.");
      return;
    }
    setSendingEmailOtp(true);
    setEmailStatus("");
    try {
      const res = await API.post("/auth/privacy/request-email-change", { newEmail: newEmailValue });
      setEmailChangeSent(true);
      setEmailStatus(res?.data?.message || "OTP sent to your current email.");
    } catch (err) {
      console.error("Request email change error:", err?.response || err);
      setEmailStatus(err?.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleConfirmEmailChange = async (e) => {
    e?.preventDefault();
    if (!emailOtpValue) return setEmailStatus("Please enter the OTP sent to your email.");
    setConfirmingEmail(true);
    try {
      const res = await API.post("/auth/privacy/confirm-email", { otp: emailOtpValue });
      setEmailStatus(res?.data?.message || "Email changed successfully.");
      const updatedEmail = res?.data?.email || newEmailValue;
      setProfile((p) => ({ ...p, email: updatedEmail }));
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      localUser.email = updatedEmail;
      localStorage.setItem("user", JSON.stringify(localUser));
      setNewEmailValue("");
      setEmailOtpValue("");
      setEmailChangeSent(false);
      setPrivacyView(null);
      if (isMobile) setShowSidebarMobile(false);
    } catch (err) {
      console.error("Confirm email change error:", err?.response || err);
      setEmailStatus(err?.response?.data?.message || "Failed to confirm email change");
    } finally {
      setConfirmingEmail(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // sidebar items
  const sidebarItems = [
    { key: "profile", icon: <User size={18} />, label: "Profile" },
    { key: "notifications", icon: <Bell size={18} />, label: "Notifications" },
    { key: "accessibility", icon: <Eye size={18} />, label: "Accessibility" },
    { key: "appearance", icon: <Palette size={18} />, label: "Appearance" },
    { key: "privacy", icon: <Lock size={18} />, label: "Privacy" },
  ];

  // If loading initial data
  if (loading) return <div className="text-center py-5">Loading...</div>;

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <Container fluid className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} md={11} lg={10}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden" style={{ minHeight: "70vh" }}>
            <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k || "profile")}>
              <Row className="g-0 flex-column flex-md-row">
                {/* Mobile top bar */}
                {isMobile && (
                  <div
                    className="d-flex align-items-center justify-content-between p-2 border-bottom"
                    style={{ background: theme === "dark" ? "#071029" : "#fff" }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Button variant="link" className="p-0" onClick={() => setShowSidebarMobile(true)} aria-label="Open settings">
                        <Menu size={22} color={chosenColor} />
                      </Button>
                      <h6 className="mb-0" style={{ color: chosenColor }}>
                        Settings
                      </h6>
                    </div>
                    <div>
                      <Button size="sm" variant="outline-secondary" onClick={handleSaveSettings} style={{ borderColor: chosenColor, color: chosenColor }}>
                        Save
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sidebar desktop */}
                {!isMobile && (
                  <Col md={3} className={`d-flex flex-column justify-content-between ${theme === "dark" ? "bg-dark text-light" : "bg-white"} border-md-end px-3 py-4`}>
                    <div>
                      <h5 className="fw-bold text-center mb-3" style={{ color: chosenColor }}>
                        ⚙ Settings
                      </h5>
                      <Nav variant="pills" className="flex-md-column flex-row justify-content-around gap-2" activeKey={activeKey}>
                        {sidebarItems.map((item) => (
                          <Nav.Item key={item.key}>
                            <Nav.Link
                              eventKey={item.key}
                              className="d-flex align-items-center rounded-3 px-3 py-2"
                              style={{
                                backgroundColor: activeKey === item.key ? chosenColor : "transparent",
                                color: activeKey === item.key ? "#fff" : theme === "dark" ? "#ddd" : chosenColor,
                                border: `1px solid ${chosenColor}`,
                                transition: "all 0.15s ease",
                                cursor: "pointer",
                              }}
                            >
                              {item.icon}
                              <span className="ms-2">{item.label}</span>
                            </Nav.Link>
                          </Nav.Item>
                        ))}
                      </Nav>
                    </div>

                    <div className="mt-3">
                      <Button variant="outline-danger" onClick={handleLogout} className="w-100 d-flex align-items-center justify-content-center gap-2">
                        <LogOut size={16} /> Logout
                      </Button>
                    </div>
                  </Col>
                )}

                {/* Offcanvas mobile sidebar */}
                <Offcanvas show={showSidebarMobile} onHide={() => setShowSidebarMobile(false)} placement="start">
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title style={{ color: chosenColor }}>⚙ Settings</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                    <Nav variant="pills" className="flex-column gap-2">
                      {sidebarItems.map((item) => (
                        <Nav.Link
                          key={`mobile-${item.key}`}
                          onClick={() => {
                            setActiveKey(item.key);
                            setShowSidebarMobile(false);
                          }}
                          active={activeKey === item.key}
                          className="d-flex align-items-center rounded-3 px-3 py-2"
                          style={{
                            backgroundColor: activeKey === item.key ? chosenColor : "transparent",
                            color: activeKey === item.key ? "#fff" : "#333",
                            border: `1px solid ${chosenColor}`,
                          }}
                        >
                          {item.icon}
                          <span className="ms-2">{item.label}</span>
                        </Nav.Link>
                      ))}

                      <div className="mt-3">
                        <Button variant="outline-danger" onClick={handleLogout} className="w-100 d-flex align-items-center justify-content-center gap-2">
                          <LogOut size={16} /> Logout
                        </Button>
                      </div>
                    </Nav>
                  </Offcanvas.Body>
                </Offcanvas>

                {/* Content area */}
                <Col xs={12} md={9} className={`p-3 ${theme === "dark" ? "bg-dark text-light" : "bg-light"}`} style={{ minHeight: 420 }}>
                  <Tab.Content>
                    {/* PROFILE */}
                    <Tab.Pane eventKey="profile">
                      <Card className="border-0 shadow-sm rounded-4 p-3 mb-3">
                        <h5 className="fw-bold mb-2" style={{ color: chosenColor }}>
                          👤 Profile Settings
                        </h5>

                        <Form>
                          <div className="text-center mb-3">
                            {profile.photo ? (
                              <img
                                src={profile.photo}
                                alt="Profile"
                                className="rounded-circle mb-2"
                                style={{ width: 90, height: 90, objectFit: "cover", border: `3px solid ${chosenColor}` }}
                              />
                            ) : (
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                                style={{ width: 90, height: 90, background: "#ddd", color: "#555", fontSize: "1.5rem", border: `3px solid ${chosenColor}` }}
                              >
                                {profile.name ? profile.name[0] : "?"}
                              </div>
                            )}

                            <Form.Control type="file" accept="image/*" onChange={onFileChange} className="mt-2" />
                          </div>

                          <Form.Group className="mb-2" controlId="profileName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Enter your name" value={nameValue} onChange={(e) => setNameValue(e.target.value)} />
                          </Form.Group>

                          <Form.Group className="mb-2" controlId="profileEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" placeholder="Enter your email" value={profile.email} disabled />
                          </Form.Group>

                          <div className="d-flex gap-2 mt-2">
                            <Button variant="secondary" onClick={() => {
                              // revert local changes to last saved profile
                              const local = JSON.parse(localStorage.getItem("user") || "{}");
                              setProfile((p) => ({ ...p, name: local.name || p.name, photo: local.photo || p.photo }));
                              setNameValue(local.name || profile.name);
                              setPhotoValue(local.photo || profile.photo);
                            }}>
                              Revert
                            </Button>
                            <Button style={{ background: chosenColor, border: "none" }} onClick={handleSaveProfile}>
                              Save Profile
                            </Button>
                          </div>
                        </Form>
                      </Card>
                    </Tab.Pane>

                    {/* NOTIFICATIONS */}
                    <Tab.Pane eventKey="notifications">
                      <Card className="border-0 shadow-sm rounded-4 p-3 mb-3">
                        <h5 className="fw-bold mb-2" style={{ color: chosenColor }}>
                          🔔 Notification Preferences
                        </h5>
                        <Form.Check
                          type="switch"
                          id="emailSwitch"
                          label="Email Notifications"
                          checked={settings.notifications.email}
                          onChange={(e) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, email: e.target.checked } }))}
                          className="mb-2"
                        />
                      </Card>
                    </Tab.Pane>

                    {/* ACCESSIBILITY */}
                    <Tab.Pane eventKey="accessibility">
                      <Card className="border-0 shadow-sm rounded-4 p-3 mb-3">
                        <h5 className="fw-bold mb-2" style={{ color: chosenColor }}>
                          🦾 Accessibility
                        </h5>
                        <Form.Check
                          type="switch"
                          id="largerText"
                          label="Larger Text"
                          checked={settings.accessibility.largeText}
                          onChange={(e) => {
                            setSettings((s) => ({ ...s, accessibility: { ...s.accessibility, largeText: e.target.checked } }));
                            setAccessibility({ ...settings.accessibility, largeText: e.target.checked });
                          }}
                          className="mb-2"
                        />
                      </Card>
                    </Tab.Pane>

                    {/* APPEARANCE */}
                    <Tab.Pane eventKey="appearance">
                      <Card className="border-0 shadow-sm rounded-4 p-3 mb-3">
                        <h5 className="fw-bold mb-2" style={{ color: chosenColor }}>
                          🎨 Appearance
                        </h5>

                        <Form.Group className="mb-2">
                          <Form.Label>Theme</Form.Label>
                          <Form.Select
                            value={settings.theme}
                            onChange={(e) => {
                              setSettings((s) => ({ ...s, theme: e.target.value }));
                              setTheme(e.target.value);
                            }}
                            style={{ border: `1px solid ${chosenColor}` }}
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-2">
                          <Form.Label>Accent Color</Form.Label>
                          <Form.Select
                            value={settings.color}
                            onChange={(e) => {
                              setSettings((s) => ({ ...s, color: e.target.value }));
                              setColor(e.target.value);
                            }}
                            style={{ border: `1px solid ${chosenColor}` }}
                          >
                            <option value="blue">Blue</option>
                            <option value="purple">Purple</option>
                            <option value="green">Green</option>
                            <option value="yellow">Yellow</option>
                            <option value="red">Red</option>
                            <option value="orange">Orange</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-2">
                          <Form.Label>Font Style</Form.Label>
                          <Form.Select
                            value={settings.font}
                            onChange={(e) => {
                              setSettings((s) => ({ ...s, font: e.target.value }));
                              setFont(e.target.value);
                            }}
                            style={{ border: `1px solid ${chosenColor}` }}
                          >
                            <option value="default">Default</option>
                            <option value="serif">Serif</option>
                            <option value="sans-serif">Sans-serif</option>
                          </Form.Select>
                        </Form.Group>
                      </Card>
                    </Tab.Pane>

                    {/* PRIVACY */}
                    <Tab.Pane eventKey="privacy">
                      <Card className="border-0 shadow-sm rounded-4 p-3 mb-3">
                        <h5 className="fw-bold mb-2" style={{ color: chosenColor }}>
                          🔒 Privacy & Password
                        </h5>
                        <p className="text-muted small">Change password or email using an OTP sent to your registered email.</p>

                        {(otpStatus || emailStatus) && <Alert variant="info">{otpStatus || emailStatus}</Alert>}

                        <div className="mb-3 d-flex flex-column flex-sm-row gap-2 align-items-stretch">
                          <Button
                            variant={privacyView === "password" ? "primary" : "outline-primary"}
                            onClick={() => {
                              setPrivacyView(privacyView === "password" ? null : "password");
                              setOtpStatus("");
                              setEmailStatus("");
                            }}
                            style={privacyView === "password" ? { background: chosenColor, borderColor: chosenColor } : { borderColor: chosenColor, color: chosenColor, transition: "all 0.3s ease" }}
                            onMouseEnter={(e) => {
                              if (privacyView !== "password") {
                                e.currentTarget.style.background = chosenColor + "22";
                                e.currentTarget.style.color = theme === "dark" ? "#fff" : "#000";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (privacyView !== "password") {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = chosenColor;
                              }
                            }}
                            className="flex-grow-1"
                          >
                            Change Password
                          </Button>

                          <Button
                            variant={privacyView === "email" ? "primary" : "outline-primary"}
                            onClick={() => {
                              setPrivacyView(privacyView === "email" ? null : "email");
                              setOtpStatus("");
                              setEmailStatus("");
                            }}
                            style={privacyView === "email" ? { background: chosenColor, borderColor: chosenColor } : { borderColor: chosenColor, color: chosenColor, transition: "all 0.3s ease" }}
                            onMouseEnter={(e) => {
                              if (privacyView !== "email") {
                                e.currentTarget.style.background = chosenColor + "22";
                                e.currentTarget.style.color = theme === "dark" ? "#fff" : "#000";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (privacyView !== "email") {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = chosenColor;
                              }
                            }}
                            className="flex-grow-1"
                          >
                            Change Email
                          </Button>
                        </div>

                        {privacyView === "password" && (
                          <div>
                            <h6 className="mt-2">Change Password</h6>
                            {!otpSent ? (
                              <div className="mb-3">
                                <div className="mb-2 small">
                                  <strong>Account email:</strong> {profile.email}
                                </div>
                                <Button variant="outline-primary" onClick={handleRequestOtp} disabled={sendingOtp} style={{ borderColor: chosenColor, color: chosenColor }} className="w-100">
                                  {sendingOtp ? "Sending OTP..." : "Send OTP to email"}
                                </Button>
                              </div>
                            ) : (
                              <Form onSubmit={handleResetWithOtp}>
                                <Form.Group className="mb-2" controlId="otp">
                                  <Form.Label>OTP</Form.Label>
                                  <Form.Control type="text" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} placeholder="Enter OTP" />
                                </Form.Group>

                                <Form.Group className="mb-2" controlId="newPassword">
                                  <Form.Label>New Password</Form.Label>
                                  <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" />
                                </Form.Group>

                                <Form.Group className="mb-2" controlId="confirmPassword">
                                  <Form.Label>Confirm Password</Form.Label>
                                  <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                                </Form.Group>

                                <div className="d-flex gap-2 flex-column flex-sm-row">
                                  <Button type="submit" disabled={resetLoading} style={{ background: chosenColor, border: "none" }} className="w-100">
                                    {resetLoading ? "Saving..." : "Change Password"}
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    onClick={() => {
                                      setOtpSent(false);
                                      setOtpValue("");
                                      setNewPassword("");
                                      setConfirmPassword("");
                                      setPrivacyView(null);
                                    }}
                                    className="w-100"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </Form>
                            )}
                          </div>
                        )}

                        {privacyView === "email" && (
                          <div>
                            <h6 className="mt-2">Change Email</h6>
                            {!emailChangeSent ? (
                              <Form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleRequestEmailChange();
                                }}
                              >
                                <Form.Group className="mb-2" controlId="newEmail">
                                  <Form.Label>New Email</Form.Label>
                                  <Form.Control type="email" value={newEmailValue} onChange={(e) => setNewEmailValue(e.target.value)} placeholder="Enter new email" />
                                </Form.Group>
                                <div className="d-flex gap-2 flex-column flex-sm-row">
                                  <Button type="submit" disabled={sendingEmailOtp} style={{ background: chosenColor, border: "none" }} className="w-100">
                                    {sendingEmailOtp ? "Sending..." : "Send OTP to current email"}
                                  </Button>
                                  <Button variant="outline-secondary" onClick={() => setNewEmailValue("")} className="w-100">
                                    Clear
                                  </Button>
                                </div>
                              </Form>
                            ) : (
                              <Form onSubmit={handleConfirmEmailChange}>
                                <Form.Group className="mb-2" controlId="emailOtp">
                                  <Form.Label>OTP sent to current email</Form.Label>
                                  <Form.Control type="text" value={emailOtpValue} onChange={(e) => setEmailOtpValue(e.target.value)} placeholder="Enter OTP" />
                                </Form.Group>
                                <div className="d-flex gap-2 flex-column flex-sm-row">
                                  <Button type="submit" disabled={confirmingEmail} style={{ background: chosenColor, border: "none" }} className="w-100">
                                    {confirmingEmail ? "Confirming..." : "Confirm Email Change"}
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    onClick={() => {
                                      setEmailChangeSent(false);
                                      setEmailOtpValue("");
                                      setNewEmailValue("");
                                      setPrivacyView(null);
                                    }}
                                    className="w-100"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </Form>
                            )}
                          </div>
                        )}
                      </Card>
                    </Tab.Pane>
                  </Tab.Content>

                  {/* Desktop save button area */}
                  {!isMobile && (
                    <div className="text-end mt-2">
                      <Button style={{ background: chosenColor, border: "none" }} onClick={handleSaveSettings}>
                        Save Settings
                      </Button>
                    </div>
                  )}

                  {/* Mobile sticky save bar */}
                  {isMobile && (
                    <div
                      style={{
                        position: "sticky",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: 10,
                        background: theme === "dark" ? "#071029" : "#fff",
                        borderTop: `1px solid ${theme === "dark" ? "#0f172a" : "#e9ecef"}`,
                      }}
                    >
                      <div className="d-flex gap-2">
                        <Button onClick={() => setActiveKey("profile")} variant="outline-secondary" className="w-50">
                          Profile
                        </Button>
                        <Button onClick={handleSaveSettings} style={{ background: chosenColor, border: "none" }} className="w-50">
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
            </Tab.Container>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
