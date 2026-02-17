import React, { useEffect, useState } from "react";
import "./Kids.css";
import girl from "../../assets/Pieimages/girlb.png";
import boy1 from "../../assets/Pieimages/boy1b.png";
import boy2 from "../../assets/Pieimages/boy2b.png";
import Think from "../../assets/AllWebpAssets/Asset3.webp";
import { useNavigate } from "react-router-dom";
import { auth, database } from "../../Firebase/firebase";
import { ref, get, update } from "firebase/database";
import { Navbar } from "../../Components/Navbar/Navbar";

function Kids() {
  const [userdata, setUserdata] = useState("");
  const [uid, setUid] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        setUid(uid);
        const userRef = ref(database, `users/${uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserdata(data);
        }
      }
    };
    fetchUser();
  }, []);

  const handleAgeGroupSelect = async (ageGroup) => {
    if (!uid) return;
    const userRef = ref(database, `users/${uid}`);
    await update(userRef, { ageGroup });
    const currentTime = Date.now();
    const plan = userdata?.plan;
    if (plan && plan.endTime > currentTime) {
      navigate("/report"); // Plan is active
    } else {
      navigate("/plans"); // Plan is expired or doesn't exist
    }
  };

  return (
    <>
      <Navbar />
      <div className="main-container">
        <img src={Think} alt="Think1" className="thinkimage" />
        <div className="tittle">
          <h2 className="tagline">
            Empowering <span className="highlight-blue">kids</span> to step out
            boldly into the future!
          </h2>
        </div>
        <div className="thinker-sections">
          <div
            className="thinker-card1"
            onClick={() =>
              handleAgeGroupSelect({
                age: "5–8",
                title: "Foundation Thinkers",
              })
            }
          >
            <img
              src={girl}
              alt="Foundation Thinker"
              className="thinker-image1"
            />
            <div>
              <h2 className="thinker-title foundation-color">
                Foundation Thinkers
              </h2>
              <p className="thinker-age">Age 5–8 years</p>
            </div>
          </div>

          <div
            className="thinker-card2"
            onClick={() =>
              handleAgeGroupSelect({
                age: "9–12",
                title: "Explorative Thinkers",
              })
            }
          >
            <img
              src={boy1}
              alt="Explorative Thinker"
              className="thinker-image"
            />
            <div>
              <h2 className="thinker-title explorative-color">
                Explorative Thinkers
              </h2>
              <p className="thinker-age">Age 9–12 years</p>
            </div>
          </div>

          <div
            className="thinker-card3"
            onClick={() =>
              handleAgeGroupSelect({
                age: "13–16",
                title: "Future - Ready Thinkers",
              })
            }
          >
            <img
              src={boy2}
              alt="Future-Ready Thinker"
              className="thinker-image2"
            />
            <div>
              <h2 className="thinker-title future-ready-color">
                Future - Ready Thinkers
              </h2>
              <p className="thinker-age">Age 13–16 years</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Kids;
