import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, database } from "../../../Firebase/firebase";
import { ref, set } from "firebase/database";
import "./PaymentSuccess.css"

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) return;

      const uid = user.uid;
      const plan = params.get("plan");
      const now = Date.now();
      let expiry;

      if (plan === "starter") {
        expiry = now + 7 * 24 * 60 * 60 * 1000;
      } else if (plan === "pro") {
        expiry = now + 30 * 24 * 60 * 60 * 1000;
      } else if (plan === "elite") {
        expiry = now + 90 * 24 * 60 * 60 * 1000;
      } else {
        alert("Invalid plan selected");
        return;
      }

      const planRef = ref(database, `users/${uid}/plan`);
      set(planRef, {
        type: plan,
        startTime: now,
        endTime: expiry,
      }).then(() => {
        navigate("/report", { state: { type: plan } });
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="payment-success-container">
      <h2 className="payment-message">Verifying payment and activating your plan...</h2>
    </div>
  );
};

export default PaymentSuccess;
