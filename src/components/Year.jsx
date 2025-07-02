import Header from "./Header";
import Sidebar from "./Sidebar";
import "../styles/year.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState,useEffect } from "react";

export default function Year() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // These come from Registration
  const selectedUniversity = location.state?.selectedUniversity || "Unknown University";
  const [selectedStream, setSelectedStream] = useState("Loading...");
  const [selectedSemester, setSelectedSemester] = useState("Loading...");

  const handleBackClick = () => {
    navigate("/Universities");
  };


   useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const response = await fetch("https://your-backend-api.com/api/getUserRegistration", {
          method: "GET",
          credentials: "include", // if your API uses cookies/session
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch registration data");
        }

        const data = await response.json();
        setSelectedStream(data.selectedStream || "Unknown Stream");
        setSelectedSemester(data.selectedSemester || "Unknown Semester");
      } catch (error) {
        console.error(error);
        setSelectedStream("Unknown Stream");
        setSelectedSemester("Unknown Semester");
      }
    };

    fetchRegistration();
  }, []);
  
  const handleYearClick = (year) => {
    let targetPath = "";

    if (selectedStream === "Natural" && selectedSemester === "First") {
      targetPath = "/NaturalFirst";
    } else if (selectedStream === "Natural" && selectedSemester === "Second") {
      targetPath = "/NaturalSecond";
    } else if (selectedStream === "Social" && selectedSemester === "First") {
      targetPath = "/SocialFirst";
    } else if (selectedStream === "Social" && selectedSemester === "Second") {
      targetPath = "/SocialSecond";
    } else {
      alert("Invalid stream/semester selection.");
      return;
    }

    navigate(targetPath, {
      state: {
        selectedUniversity,
        selectedStream,
        selectedSemester,
        selectedYear: year
      }
    });
  };

  return (
    <div className="year-container">
      <div className={`sidebar-container-wrapper ${sidebarOpen ? "open" : ""}`}>
        <Sidebar />
        <button
          className="close-btn"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      <div className="side-year">
        <div className="header-mobile">
          <button
            className="burger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <div className="burger-line"></div>
            <div className="burger-line"></div>
            <div className="burger-line"></div>
          </button>
          <img
            src={require("../images/logo.jpg")}
            alt="Logo"
            className="logo2"
          />
        </div>

        <Header />

        <h1 className="page-title">Select Year</h1>
        <h2 style={{ marginTop: "10px" }}>
          {selectedUniversity} University
        </h2>
        <p style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
          Stream: {selectedStream} | Semester: {selectedSemester}
        </p>

        <div className="year">
          {["2012", "2013", "2014", "2015", "2016", "2017"].map((year) => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <button className="back-btn" onClick={handleBackClick}>
          ← back
        </button>
      </div>
    </div>
  );
}
