import React, { useEffect, useState } from "react";
import { ref, get, set } from "firebase/database";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../Components/AuthContext";
import "./Quiz.css";
import backgroundImg from "../../../assets/home/bg.jpg";
import logo from "../../../assets/home/logo.gif";
import think from "../../../assets/AllWebpAssets/Asset3.webp";
import ribbon from "../../../assets/home/congratulation.png";
import trophy from "../../../assets/home/trophy.png";
import { auth, database } from "../../../Firebase/firebase";
import { CgProfile } from "react-icons/cg";
import { Navbar } from "../../../Components/Navbar/Navbar";
import Foundation from "../../../assets/AllWebpAssets/Asset5.webp";
import Explosive from "../../../assets/AllWebpAssets/Asset6.webp";
import FutureReaady from "../../../assets/AllWebpAssets/Asset7.webp";
import congrates from "../../../assets/AllWebpAssets/Asset16.webp";
import Correct from "../../../assets/AllWebpAssets/Correct_Answer.wav";
import Wrong from "../../../assets/AllWebpAssets/wrong_answer.wav";

const QuizComponent = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [category, setCategory] = useState("Maths");
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [feedback, setFeedback] = useState("");
  const [quizOver, setQuizOver] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [Userdata, setUserdata] = useState({});

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
  useEffect(() => {
    if (Userdata?.ageGroup?.age) {
      fetchQuestions("Maths");
    }
  }, [Userdata]);

  useEffect(() => {
    if (!currentUser) return;
    get(ref(database, "questions")).then((snapshot) => {
      const catSet = new Set();
      snapshot.forEach((snap) => {
        const q = snap.val();
        if (q.question_type) catSet.add(q.question_type);
      });
      setCategories([...catSet]);
    });
  }, [currentUser]);

  const fetchQuestions = async (cat) => {
    setLoading(true);

    const uid = currentUser?.uid;
    if (!uid) return;

    const allSnap = await get(ref(database, "questions"));
    const fullList = [];

    allSnap.forEach((snap) => {
      const q = snap.val();
      const normalizeAgeGroup = (str) => str.replace(/–/g, "-");
      if (
        q.question_type === cat &&
        normalizeAgeGroup(q.age_group) ===
          normalizeAgeGroup(Userdata?.ageGroup?.age)
      ) {
        fullList.push({ ...q, id: snap.key });
      }
    });

    const trackingRef = ref(database, `users/${uid}/quizTracking/${cat}`);
    const trackingSnap = await get(trackingRef);
    const attemptedIds = trackingSnap.exists()
      ? trackingSnap.val().attempted || []
      : [];

    let unattempted = fullList.filter((q) => !attemptedIds.includes(q.id));

    if (unattempted.length < 30) {
      unattempted = [...fullList];
      await set(trackingRef, { attempted: [] });
    }

    const shuffled = [...unattempted].sort(() => 0.5 - Math.random());
    const selected30 = shuffled.slice(0, 30);

    const newAttemptedIds = [...attemptedIds, ...selected30.map((q) => q.id)];
    await set(trackingRef, { attempted: newAttemptedIds });

    setCategory(cat);
    setQuestions(selected30);
    setCurrentIndex(0);
    setSelectedOption("");
    setFeedback("");
    setScore(0);
    setQuizOver(false);
    setLoading(false);
  };
  useEffect(() => {
    new Audio(Correct).load();
    new Audio(Wrong).load();
  }, []);

  const playSound = (sound) => {
    const audio = new Audio(sound);
    audio.play().catch((err) => {
      console.warn("Audio playback failed:", err);
    });
  };

  const handleAnswer = (option) => {
    if (selectedOption) return;
    const current = questions[currentIndex];
    const isCorrect = option === current.answer;
    setSelectedOption(option);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setScore((prev) => prev + 1);
      playSound(Correct); // Play correct sound
    } else {
      playSound(Wrong); // Play wrong sound
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption("");
      setFeedback("");
    } else {
      setQuizOver(true);
      await updateQuizStats();
    }
  };

  const handleRestart = () => {
    fetchQuestions(category);
  };

  const updateQuizStats = async () => {
    if (!currentUser || !category) return;

    const uid = currentUser.uid;
    const statsRef = ref(database, `users/${uid}/quizStats/${category}`);

    const newCorrect = score;
    const newAttempted = questions.length;

    try {
      await set(statsRef, {
        correct: newCorrect,
        attempted: newAttempted,
      });
    } catch (err) {
      console.error("❌ Failed to update quiz stats:", err);
    }
  };

  let MainImage;
  if (Userdata?.ageGroup?.title === "Foundation Thinkers") {
    MainImage = Foundation;
  } else if (Userdata?.ageGroup?.title === "Explorative Thinkers") {
    MainImage = Explosive;
  } else if (Userdata?.ageGroup?.title === "Future - Ready Thinkers") {
    MainImage = FutureReaady;
  } else {
    return null;
  }

  if (authLoading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/" />;

  return (
    <div className="quiz-wrapper">
      <Navbar />
      <div className="quiz-header-center">
        <img src={MainImage} alt="Think" />
      </div>

      <div className="quiz-categories">
        {categories.map((cat, i) => (
          <button
            key={i}
            className={`quiz-tab color-${i % 6} ${
              cat === category ? "active" : ""
            }`}
            onClick={() => fetchQuestions(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="quiz-loading">Loading...</div>
      ) : quizOver ? (
        <div className="quiz-congrats">
          <img src={congrates} className="congrats-banner" alt="congrats" />
          <div className="Quiz_Complete_Buttom_Section">
            <div>
              <h2>You Completed the Objectives</h2>
              <p className="user-name">
                <span>Name :</span> {Userdata.name}
              </p>
              <p className="user-name">
                <span>Group : </span>
                {Userdata.ageGroup.title}
              </p>
              <p className="user-name score">
                <span>Score :</span> {score * 10} / {questions.length * 10}
              </p>
            </div>
            <div>
              <img src={trophy} className="trophy-image" alt="trophy" />
            </div>
          </div>
          <button className="restart-btn" onClick={handleRestart}>
            Restart
          </button>
        </div>
      ) : questions.length === 0 ? (
        <div className="quiz-no-questions">
          <h2>No questions available for this category and age group.</h2>
        </div>
      ) : (
        <div className="quiz-question-box">
          <h3>
            Q{currentIndex + 1}: {questions[currentIndex]?.question}
          </h3>
          <div className="quiz-options">
            {questions[currentIndex] &&
              ["option1", "option2", "option3", "option4"].map((opt, i) => {
                const currentQ = questions[currentIndex];
                if (!currentQ[opt]) return null; // skip undefined options

                const isCorrectOption = currentQ[opt] === currentQ.answer;
                const isSelected = selectedOption === currentQ[opt];

                const optionClass = selectedOption
                  ? isCorrectOption
                    ? "correct"
                    : isSelected
                    ? "wrong"
                    : ""
                  : "";

                return (
                  <button
                    key={i}
                    className={`quiz-option-btn ${optionClass}`}
                    onClick={() => handleAnswer(currentQ[opt])}
                    disabled={!!selectedOption}
                  >
                    <span className="option-label">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="option-text">{currentQ[opt]}</span>
                  </button>
                );
              })}
          </div>

          {selectedOption && (
            <div className="quiz-feedback-text">
              {feedback === "correct" ? (
                <>
                  <p className="feedback-correct">✅ Correct Answer!</p>
                </>
              ) : (
                <>
                  <p className="feedback-wrong">
                    ❌ Wrong Answer. The correct answer is:{" "}
                    <strong>{questions[currentIndex].answer}</strong>
                  </p>
                </>
              )}
            </div>
          )}

          <div className="Quiz_Next_Button">
            <button
              className="quiz-next-btn"
              onClick={handleNext}
              disabled={!selectedOption}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
