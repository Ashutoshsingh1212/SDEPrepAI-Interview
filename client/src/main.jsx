import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import "./styles.css";

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <div style={{fontFamily:"system-ui",padding:40,color:"white",background:"#08090c",minHeight:"100vh"}}><h1>Frontend error</h1><pre style={{whiteSpace:"pre-wrap",color:"#ff9ca5"}}>{this.state.error.stack || this.state.error.message}</pre><p>Open the browser console if more details are needed.</p></div>;
    return this.props.children;
  }
}

const preview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("preview") === "recruiter";
createRoot(document.getElementById("root")).render(<ErrorBoundary>{preview ? <RecruiterDashboard onBack={() => window.history.back()} /> : <App />}</ErrorBoundary>);
