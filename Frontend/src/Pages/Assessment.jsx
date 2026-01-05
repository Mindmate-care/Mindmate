import React, { useState, useEffect, useMemo } from "react";
import assessmentQuestions from "../data/assessmentQuestions";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Assessment = () => {
  const categories = Object.keys(assessmentQuestions);

  // ✅ Randomly select 2 questions per category on mount
  const selectedQuestions = useMemo(() => {
    const result = {};
    categories.forEach((category) => {
      const allQuestions = assessmentQuestions[category];
      // Fisher-Yates shuffle
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      // Pick first 2
      result[category] = shuffled.slice(0, 2);
    });
    return result;
  }, []);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({
    brain: 0,
    math: 0,
    logic: 0,
    puzzle: 0,
    concentration: 0,
  });

  const navigate = useNavigate();

  // 🔒 Block reassessment if already completed
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.isAssessmentCompleted) {
      navigate("/home");
    }
  }, [navigate]);

  const category = categories[currentCategoryIndex];
  const categoryQuestions = selectedQuestions[category];
  const question = categoryQuestions[currentQuestionIndex];

  const handleAnswer = (selected) => {
    // Update score first
    setScores((prevScores) => {
      const currentCategory = categories[currentCategoryIndex];
      const updatedScores = { ...prevScores };

      // +10 only if correct (max 20 per category now)
      if (selected === question.answer) {
        updatedScores[currentCategory] += 10;
      }

      return updatedScores;
    });

    // Navigation logic (separate from score update)
    const isLastQuestionInCategory =
      currentQuestionIndex >= categoryQuestions.length - 1; // 2 questions max

    const isLastCategory = currentCategoryIndex >= categories.length - 1;

    if (!isLastQuestionInCategory) {
      setCurrentQuestionIndex((prevIdx) => prevIdx + 1);
    } else if (!isLastCategory) {
      setCurrentCategoryIndex((prevCatIdx) => prevCatIdx + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Last question of last category → submit
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    try {
      const finalScores = scores;

      // Calculate weak areas from final scores (max 20 per category now)
      const entries = Object.entries(finalScores);
      const nonZeroEntries = entries.filter(([, v]) => v > 0);
      const baseArray = nonZeroEntries.length ? nonZeroEntries : entries;

      const minScore = Math.min(...baseArray.map(([, v]) => v));
      let weakAreas = baseArray
        .filter(([, v]) => v === minScore)
        .map(([k]) => k);

      if (weakAreas.length === 0) {
        weakAreas = ["logic"];
      }

      const payload = {
        scores: finalScores,
        weakAreas,
      };

      const res = await API.post("/assessment/submit", payload);

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      toast.success("Assessment completed successfully! 🎉");
      navigate("/home");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit assessment");
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "auto" }}>
      <h2>Quick Cognitive Assessment 🧠</h2>
      <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
        {categories.length * 2} random questions selected across 5 categories
      </p>

      <div className="mt-4 mb-3">
        <div className="d-flex justify-content-between">
          <span>
            Category: <strong>{category.toUpperCase()}</strong>
          </span>
          <span>
            Q {currentQuestionIndex + 1} / {categoryQuestions.length} •{" "}
            Category {currentCategoryIndex + 1} / {categories.length}
          </span>
        </div>
      </div>

      <h4 style={{ marginTop: 20 }}>{question.question}</h4>

      <div className="d-grid gap-2">
        {question.options.map((opt, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(opt)}
            className="btn btn-outline-primary py-3 fw-medium rounded-3"
            style={{
              cursor: "pointer",
              borderWidth: "2px",
              transition: "all 0.2s",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Assessment;
