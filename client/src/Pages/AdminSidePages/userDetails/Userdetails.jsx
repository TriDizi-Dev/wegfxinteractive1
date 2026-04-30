import React, { useEffect, useState } from "react";
import { ref, get, remove } from "firebase/database";
import { auth, database } from "../../../Firebase/firebase";
import moment from "moment";
import "./UserDetails.css";
import thinklogo from "../../../assets/AllWebpAssets/Asset3.webp";

const UserDetails = () => {
  const [users, setUsers] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const waitForAuth = () =>
          new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
              unsubscribe();
              resolve(user);
            });
          });

        const currentUser = await waitForAuth();

        if (!currentUser) {
          setError("You must be logged in to access this page.");
          setLoading(false);
          return;
        }

        const roleSnapshot = await get(
          ref(database, `users/${currentUser.uid}/role`)
        );

        const role = roleSnapshot.val();
        if (role !== "admin") {
          setError("Access denied. Only admins can view this page.");
          setLoading(false);
          return;
        }

        const usersRef = ref(database, "users");
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          setUsers(snapshot.val());
        } else {
          setError("No user data found.");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
console.log(Object.entries(users),"fhfghvbnv");

  const handleDeleteUser = async (uid) => {
   

    try {
      await remove(ref(database, `users/${uid}`));

      setUsers((prev) => {
        const updated = { ...prev };
        delete updated[uid];
        return updated;
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  if (loading) return <p className="loading">🔄 Loading user data...</p>;
  if (error) return <p className="error-message">⚠️ {error}</p>;

  return (
    <div className="admin-wrapper">
      <div className="logo-container">
        <img src={thinklogo} className="logo1" />
      </div>
      <h1 className="admin-title">📋 User Activity Overview</h1>
      <h1 className="admin-title">Total users : {Object.entries(users).length-1}</h1>

      {Object.entries(users)
      .filter(([uid]) => uid !== auth.currentUser?.uid)
      .sort(([, a], [, b]) => {
        const dateA = a?.plan?.startTime || 0;
        const dateB = b?.plan?.startTime || 0;
        return dateB - dateA; 
      })
      .map(([uid, user]) => (
          <div key={uid} className="user-card">
            <div className="User_firstDetails">
               <h2 className="user-email" title={user.email}>
              👤 {user.name}
            </h2>
            <h2 className="user-email" title={user.email}>
              📧 {user.email}
            </h2>
           
</div>
            <div className="info-grid">
              <div>
                <p>
                  <strong>📂 category :</strong> {user?.ageGroup?.title || "N/A"}
                </p>
                <p>
                  <strong>💳 Plan Type:</strong> {user.plan?.type === "starter" ? "Trial Pack" : user.plan?.type === "pro" ? "Basic": user.plan?.type === "elite" ? "Super Saver" : "N/A"}
                </p>
                <p>
                  <strong>⏳ Start:</strong>{" "}
                  {user.plan?.startTime
                    ? moment(user.plan.startTime).format("LLL")
                    : "N/A"}
                </p>
                <p>
                  <strong>🕒 End:</strong>{" "}
                  {user.plan?.endTime
                    ? moment(user.plan.endTime).format("LLL")
                    : "N/A"}
                </p>
              </div>

              <div>
                <p>
                  <strong>🧮 Total Categories:</strong>{" "}
                  {/* {Object.keys(user.quizStats || {}).length} */}
                  6
                </p>
                <p>
                  <strong>📂 Categories Attempted:</strong>{" "}
                  {Object.keys(user.quizStats || {}).join(", ") ||
                    "None"}
                </p>
                
                {/* <p>
                  <strong>🔁 Total Quiz Attempts:</strong>{" "}
                  {Object.values(user.quizTracking || {}).reduce(
                    (total, cat) => total + Object.keys(cat || {}).length,
                    0
                  )}
                </p> */}
              </div>
            </div>

            <button className="delete-btn" onClick={() => handleDeleteUser(uid)}>
              🗑️ Delete User
            </button>
          </div>
        ))}
    </div>
  );
};

export default UserDetails;
