import React, { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { auth, database } from "../../Firebase/firebase";
import { get, ref } from "firebase/database"; 
import Logo from "../../assets/AllWebpAssets/WeGfx_black_logo.webp";
import LogoWhite from "../../assets/AllWebpAssets/WeGfx_white_logo.webp";
import { useLocation } from "react-router-dom";
import "./Navbar.css";
import { signOut } from "firebase/auth";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export const Navbar = () => {
  const [Userdata, setUserdata] = useState({});
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const userRef = ref(database, `users/${uid}`); 
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserdata(data || {});
        }
      }
    };
    fetchUser();
  }, []);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const location = useLocation();

  const hideBackButtonPaths = ["/", "/sign-up","/wselect-age-group"];
  const hideLogo = ["/", "/sign-up"];

  const shouldHideBackButton = hideBackButtonPaths.includes(location.pathname);
  const shouldHideLog = hideLogo.includes(location.pathname);

  return (
    <div className="Main_NavBar_Css">
      <div className="Main_Logo_Image">
        {location.pathname === "/select-age-group" ? (
          <img src={LogoWhite} alt="Name" />
        ) : (
          <img src={Logo} alt="Name" />
        )}
        <div>
          {!shouldHideBackButton && (
            <div
              className="back-arrow-btn"        
              onClick={() => window.history.back()}
            >
              ← Back
              {/* <button>
              Sign Out
              </button> */}
            </div>
           )} 
          {/* Other navbar content */}
        </div>
      </div>
      {!shouldHideLog && (
        <div className="quiz-user-info">
          <span
            style={{
              color: location.pathname === "/select-age-group" && "white",
            }}
          >
            {Userdata.name}
          </span>
          <div
            
            onClick={() => setShowLogout(!showLogout)}
          >
            <AccountCircleIcon className="user-avatar"/>
            {showLogout && (
              <div className="logout-popup">
                <button onClick={handleLogout}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
