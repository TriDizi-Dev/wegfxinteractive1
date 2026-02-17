import React, { useEffect, useState } from "react";
import image1 from "../../assets/Login/image1.svg";
import thinklogo from "../../assets/AllWebpAssets/Asset3.webp";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  fetchSignInMethodsForEmail,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { ref, set, get, database, auth } from "../../Firebase/firebase";
import { GrView } from "react-icons/gr"; 
import { BiHide } from "react-icons/bi";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../Navbar/Navbar";
import googleImg from "../../assets/AllWebpAssets/Asset8.webp";



const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For password reset success
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false); // To toggle between login and forgot password forms
  const [successmsg, setsuccessmsg] = useState(""); // For login success message
  const navigate = useNavigate();


    const handleGoogleLogin = async () => {
  setError("");
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const email = user.email;
    const uid = user.uid;

    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (methods.includes("password")) {
      setError("This email is already registered with Email/Password.");
      await signOut(auth);
      return;
    }

    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);

    let userData = snapshot.val();

    // If new user → create record
    if (!snapshot.exists()) {
      const name = user.displayName || "";
      userData = { name, email, role: "user" };
      await set(userRef, userData);
    }

    const plan = userData?.plan;
    const ageGroup = userData?.ageGroup;
    const currentTime = Date.now();

    setsuccessmsg("Google Sign-In Successful!");

    setTimeout(() => {
      if (!ageGroup) {
        navigate("/select-age-group");
      } else if (plan && plan.endTime > currentTime) {
        navigate("/report");
      } else {
        navigate("/plans");
      }
    }, 1000);

  } catch (err) {
    console.log("Google Login Error:", err);

    if (err.code === "auth/popup-closed-by-user") {
      setError("Google sign-in was cancelled by the user.");
    } else if (err.code === "auth/cancelled-popup-request") {
      setError("Multiple Google sign-in attempts detected. Please try again.");
    } else if (err.code === "auth/popup-blocked") {
      setError("Google sign-in popup was blocked. Please enable pop-ups.");
    } else if (err.code === "auth/unauthorized-domain") {
      setError("Domain not authorized in Firebase.");
    } else {
      setError("Google Sign-In Failed.");
    }
  }
};


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setsuccessmsg("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword
      );

      const userUid = userCredential.user.uid;
      const snapshot = await get(ref(database, `users/${userUid}`));

      const userData = snapshot.val();
      if (snapshot.exists() && userData.role === "admin") {
        setError("Admins must log in through the Admin tab.");
        await signOut(auth); // Sign out the admin if they tried to log in here
        return;
      }
  const { plan, ageGroup } = userData;
      setsuccessmsg("Login Successful!");
      setError(""); 
      setMessage("");
      const currentTime = Date.now();
      if(ageGroup){
 if (plan && plan.endTime > currentTime) {
   setTimeout(() => {
              navigate("/report"); // Plan is active
      }, 1000);
    } else {
       setTimeout(() => {
        navigate("/plans");
      }, 1000);

    }
  }else{
  setTimeout(() => {
        navigate("/select-age-group");
      }, 1000);
  }
    
    } catch (err) {
      console.error("Email/Password Login Error:", err);
      if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (err.code === "auth/user-not-found") {
        setError("User not found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/invalid-credential") { // More general for wrong user/pass
        setError("Invalid email or password.");
      }
      else {
        setError("Login failed. Please check your credentials.");
      }
    }
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setError("");
    setMessage(""); 
    
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address to reset the password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setMessage("Password reset email sent! Please check your inbox (and spam folder).");
      setEmail(""); // Clear email field after sending
      setShowChangePassword(false); // Optionally go back to login form
    } catch (err) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No user found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(`Failed to send password reset email: ${err.message || "Unknown error."}`);
      }
    }
  };

  return (
    <div>
      <Navbar />

      <div className="login_box">
        <div className="login-leftside">
          <img src={image1} className="img1" alt="Login Illustration" />
        </div>

        <div className="login-rightside">
          <div className="head">
            <img src={thinklogo} className="logo" />
            <h2>User Login</h2>
          </div>
          <form
            onSubmit={showChangePassword ? handleSendResetEmail : handleLogin}
          >
            <div className="form-login">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username" 
              />
            </div>

            {!showChangePassword && (
              <div className="form-login">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-password"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <GrView /> : <BiHide />}
                  </button>
                </div>
              </div>
            )}

            {showChangePassword && (
              <p className="info-message">
                Enter your email. We'll send a password reset link to your inbox.
              </p>
            )}

            <div>
              <div className="Login_submit_and_Create_account">
                <p className="Create_account">
                  Create an account?{" "}
                  <b className="login" onClick={() => navigate("/sign-up")}>
                    Sign Up
                  </b>
                </p>
                <button type="submit" className="btn-login">
                  {showChangePassword ? "Send Reset Link" : "Login"}
                </button>
              </div>
              <h3>
                {showChangePassword ? (
                  <span
                    className="sign"
                    onClick={() => {
                      setShowChangePassword(false);
                      setMessage("");
                      setError(""); 
                    }}
                  >
                    Back to Login
                  </span>
                ) : (
                  <span
                    className="sign"
                    onClick={() => {
                      setShowChangePassword(true);
                      setError(""); 
                      setMessage(""); 
                      setPassword(""); 
                    }}
                  >
                    Forgot password?
                  </span>
                )}
              </h3>
            </div>
            <div className="ErrAndSucHandle">
              {error && <p className="error-message1">{error}</p>}
              {message && <p className="success-message">{message}</p>}
              {successmsg && <p className="success-message">{successmsg}</p>}
            </div>
            <div type="button" onClick={handleGoogleLogin} className="btn-google">
              <img src={googleImg} alt="Google Logo" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;