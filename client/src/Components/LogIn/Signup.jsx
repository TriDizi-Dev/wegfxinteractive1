import React, { useState } from "react";
import image1 from "../../assets/Login/image1.svg";
import ThinkLogo from "../../assets/AllWebpAssets/Asset3.webp";
import { useNavigate } from "react-router-dom";
// import pic1 from "../../assets/Login/Picture12.png"
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { ref, set, database, auth, get } from "../../Firebase/firebase";
import { GrGoogle, GrView } from "react-icons/gr";
import { BiHide } from "react-icons/bi";
import "./Signup.css";
import { FcGoogle } from "react-icons/fc";
import { Navbar } from "../Navbar/Navbar";
import googleImg from "../../assets/AllWebpAssets/Asset8.webp";


// const setStorageItem = (key, value) => {
//   try {
//     sessionStorage.setItem(key, value);
//   } catch {
//     localStorage.setItem(key, value);
//   }
// };

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setsuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const [redirectHandled, setRedirectHandled] = useState(false);
  const navigate = useNavigate();

  const handleUserSignup = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();
    const trimmedConfirm = confirm.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedName || !trimmedConfirm) {
      setError("All fields are required.");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const existingMethods = await fetchSignInMethodsForEmail(
        auth,
        trimmedEmail
      );
      if (existingMethods.length > 0) {
        setError("Email already exists. Please log in.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword
      );

      await set(ref(database, `users/${userCredential.user.uid}`), {
        name: trimmedName,
        email: trimmedEmail,
        role: "user",
      });
      setTimeout(() => {
        navigate("/");
      }, 3000);
      // alert("Signup Successful");
      setError(""); 
      setsuccess("Signup successful !");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-email") setError("Invalid email format.");
      else if (err.code === "auth/weak-password")
        setError("Password should be at least 6 characters.");
      else if(err.code ==="auth/email-already-in-use")
        setError("Email already Exist");
      else setError("Signup failed.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("")
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
        const result = await signInWithPopup(auth, provider);
        const email = result.user.email;

        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes("password")) {
          setError("This email is already registered with Email/Password.");
          await signOut(auth);
          return;
        }

        const uid = result.user.uid;
        const userRef = ref(database, `users/${uid}`);
        const snapshot = await get(userRef);
const userData = snapshot.val();
        if (!snapshot.exists()) {
          const name = result.user.displayName || "";
          await set(userRef, { name, email, role: "user" });
        }
  const { plan, ageGroup } = userData;

        setError(""); 
                  setsuccess("Google Sign up Successful!");

             if(ageGroup){
 if (plan && plan.endTime > currentTime) {
  setTimeout(() => {
        navigate("/report");
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
           if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled by the user.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Multiple Google sign-in attempts detected. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Google sign-in popup was blocked. Please enable pop-ups for this site or try again on a mobile device.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Your domain is not authorized for Google Sign-In. Please contact support.");
      } else {
        setError(`Google Sign-In Failed`);
        console.log(err.message,"Error Msg");
        
      }
    }
    
  };

  return (
    <div className="LogIn_main">
      <Navbar />

      <div className="login-wrapper">
        <div className="login-box">
          <div className="signup-left">
            <img src={image1} className="image1" />
          </div>

          <div className="signup-right">
            <div className="heading">
              <img src={ThinkLogo} className="logeimage" alt="Logo" />
              <h2>Create an account</h2>
            </div>

            <form onSubmit={handleUserSignup}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-password"
                  >
                    {showPassword ? <GrView /> : <BiHide />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <div className="para">
                <p>
                  Already have an account?{" "}
                  <b className="signup" onClick={() => navigate("/")}>
                    Login
                  </b>
                </p>
                <button type="submit" className="btn-Sinup">
                  Sign Up
                </button>
              </div>
              {error && <p className="error-message2">{error}</p>}
              {success && (
                <p className="error-message2 succesMsg_signup">{success}</p>
              )}

              <p onClick={handleGoogleLogin} className="google">
                 <img src={googleImg} alt="googleImg" />
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
