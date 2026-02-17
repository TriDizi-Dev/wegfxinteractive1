import React, { useEffect, useState } from "react";
import "./Piechart.css"; // Make sure this path is correct for your CSS file
import Think from "../../assets/AllWebpAssets/Asset3.webp"; // Import your logo image
import { auth, database } from "../../Firebase/firebase";
import { ref, get, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../Components/Navbar/Navbar";
import Welcome from "../../assets/AllWebpAssets/Asset9.webp"; // Import your logo image
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";


function PiePage() {
  const [ageGroup, setAgeGroup] = useState("Beginner");
  const [Userdata, setUserdata] = useState({});
  const [outerRadius, setOuterRadius] = useState(180);
  const [questionData, setQuestionData] = useState([]);
  console.log(questionData, "UserdataUserdata");

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const subject = payload[0].name;
      const stats = Userdata.quizStats?.[subject];

      if (stats) {
        return (
          <div className="custom-tooltip">
            <p>
              <strong>{subject}</strong>
            </p>
            <p>
              {stats.correct} / {stats.attempted} correct
            </p>
          </div>
        );
      } else {
        return (
          <div className="custom-tooltip">
            <p>
              <strong>{subject}</strong>
            </p>
            <p>No attempts yet</p>
          </div>
        );
      }
    }

    return null;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = ref(database, "questions");
        const snapshot = await get(questionsRef);

        if (snapshot.exists()) {
          const questions = snapshot.val();

          const subjectCount = {};
          Object.values(questions).forEach((q) => {
            // Normalize the age group for both comparison values
            const normalizeAge = (str) => str?.replace(/–/g, "-")?.trim();
            const userAge = normalizeAge(Userdata?.ageGroup?.age);
            const questionAge = normalizeAge(q.age_group);

            // Filter by matching age group
            if (userAge === questionAge) {
              const type = q.question_type;
              if (type) {
                subjectCount[type] = (subjectCount[type] || 0) + 1;
              }
            }
          });

          const chartData = Object.entries(subjectCount).map(
            ([name, value]) => ({
              name,
              value,
            })
          );

          setQuestionData(chartData);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    if (Userdata?.ageGroup?.age) {
      fetchQuestions();
    }
  }, [Userdata]);

  const SUBJECT_COLOR_MAP = {
    Maths: "#7B3FA3",
    English: "#0072BC",
    Social: "#00B7F1",
    Science: "#00B050",
    Computers: "#F7941E",
    GK: "red",
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontWeight: "bold",
          fontSize: "14px",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {questionData[index].name}
      </text>
    );
  };

  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 768) {
        setOuterRadius(150); // smaller radius for mobile
      } else {
        setOuterRadius(180); // default for desktop
      }
    };

    updateRadius(); // set initially
    window.addEventListener("resize", updateRadius); // update on resize

    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  const navigate = useNavigate("");
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
  const handleAgeGroupChange = (event) => {
    setAgeGroup(event.target.value);
  };

  const handleStartClick = () => {
    console.log(`Starting with age group: ${ageGroup}`);
    navigate("/quiz");

  };
  const emailfun = ()=>{
    window.location.href="mailto:info@wegfx.com"
  }

  return (
    <div>
      <Navbar />

      <div className="pie">
        <div className="think-logo">
          <img src={Think} alt="Think" className="think-logo-image" />
        </div>
        <div className="app-container">
          <main className="app-main-content">

            <div className="welcome-section">
              <img
                src={Welcome}
                alt="WelcomeImage"
                className="Welcome_Image"
              ></img>
              <p className="welcome-message">{Userdata?.name}</p>
              {/* <p className="highlight-name"></p> */}
              <p className="ready-message">Ready to conquer today?</p>
              <p className="learning-message">Let's make learning awesome!</p>

              <div className="foundation-section">
                <p className="foundation-title">{Userdata?.ageGroup?.title}</p>
                <p className="age-range">Age {Userdata?.ageGroup?.age} years</p>
                <div className="input-group">
                  <button className="start-button" onClick={handleStartClick}>
                    Start
                  </button>
                </div>
              </div>
            </div>
            <div className="pie-chart-section">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={questionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={outerRadius}
                    labelLine={false}
                    label={CustomLabel}
                    dataKey="value"
                  >
                    {questionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SUBJECT_COLOR_MAP[entry?.name]} // fallback color
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* </div> */}
          </main>
        </div>
      </div>
      <p className="Suppot_text">For any inquiries, please reach out via email : <span onClick={()=>emailfun()}>info@wegfx.com</span></p>
    </div>
  );
}

export default PiePage;
