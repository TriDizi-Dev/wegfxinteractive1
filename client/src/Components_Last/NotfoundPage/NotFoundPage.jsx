import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css"; // link the CSS file

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <h2 className="notfound-subtitle">Page Not Found</h2>
      <p className="notfound-text">Sorry, the page you're looking for doesn't exist.</p>
      <button className="login-button" onClick={() => navigate("/")}>
        Go to Login
      </button>
    </div>
  );
};

export default NotFoundPage;
