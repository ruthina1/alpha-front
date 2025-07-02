import '../styles/question.css';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { saveScoreOffline, getPendingScores, markScoreSynced } from '../utils/indexedDB';

export default function Question() {
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { stream, semester, university, year, exam } = location.state || {};

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!stream || !semester || !university || !year || !exam) {
          console.error('Missing exam context.');
          return;
        }

        const queryParams = new URLSearchParams({
          stream,
          semester,
          university,
          year,
          exam,
        }).toString();

        const response = await fetch(`http://localhost:5000/questions/?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch questions.');

        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [stream, semester, university, year, exam]);

  useEffect(() => {
    const syncPendingScores = async () => {
      if (navigator.onLine) {
        const pending = await getPendingScores();
        for (const entry of pending) {
          try {
            const response = await fetch('http://localhost:5000/scores/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(entry),
            });

            if (response.ok) {
              await markScoreSynced(entry.id);
              console.log(`✅ Score ID ${entry.id} synced successfully`);
            } else {
              console.warn(`❌ Failed to sync score ID ${entry.id}`);
            }
          } catch (error) {
            console.error(`🚫 Sync error for score ID ${entry.id}:`, error);
          }
        }
      }
    };

    syncPendingScores();
    window.addEventListener('online', syncPendingScores);
    return () => window.removeEventListener('online', syncPendingScores);
  }, []);

  const handleChoiceSelect = (questionId, choiceId) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = () => setSubmitted(true);

  const correctCount = questions.filter(
    q => answers[q.id] === q.correctChoiceId
  ).length;

  const handleSaveScore = async () => {
    const payload = {
      id: Date.now(),
      score: correctCount,
      total: questions.length,
      answers,
      stream,
      semester,
      university,
      year,
      exam,
      synced: false,
    };

    try {
      const online = navigator.onLine;

      if (online) {
        const response = await fetch('http://localhost:5000/scores/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          alert('Score submitted successfully!');
        } else {
          console.warn('Failed to sync online. Saving offline instead.');
          await saveScoreOffline(payload);
        }
      } else {
        await saveScoreOffline(payload);
        alert('You are offline. Score saved locally and will sync when online.');
      }
    } catch (err) {
      console.error('Save error:', err);
      await saveScoreOffline(payload);
    }
  };

  const handleBackClick = () => navigate('/Year');

  return (
    <div className="question-container">
      <div className={`sidebar-container-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar />
        <button className="close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">×</button>
      </div>

      <div className="side-question">
        <div className="header-mobile">
          <button className="burger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <div className="burger-line"></div>
            <div className="burger-line"></div>
            <div className="burger-line"></div>
          </button>
          <img src={require('../images/logo.jpg')} alt="Logo" className="logo2" />
        </div>

        <Header />

        <main className="main-content with-shadow">
          <h1 className="page-title">
            {exam?.toUpperCase()} Exam - {stream} Stream ({semester} Semester) - {university}, {year}
          </h1>

          {questions.length === 0 ? (
            <p>Loading questions...</p>
          ) : (
            <>
              {questions.map((q, idx) => (
                <div key={q.id} className="question-block">
                  <h2 className="question-text">
                    {idx + 1}. {q.questionText}
                  </h2>
                  <ul className="choices">
                    {q.choices.map(c => (
                      <li
                        key={c.id}
                        className={`choice ${
                          submitted && c.id === q.correctChoiceId
                            ? 'correct'
                            : submitted && answers[q.id] === c.id
                            ? 'incorrect'
                            : answers[q.id] === c.id
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() => handleChoiceSelect(q.id, c.id)}
                      >
                        <span className="custom-radio">
                          {answers[q.id] === c.id && <span className="checked-dot"></span>}
                        </span>
                        {c.text}
                      </li>
                    ))}
                  </ul>
                  {submitted && (
                    <p className="description">
                      {
                        q.choices.find(c => c.id === q.correctChoiceId)?.description
                      }
                    </p>
                  )}
                </div>
              ))}

              {!submitted ? (
                <div className="button-group">
                  <button onClick={handleSubmit} className="submit-btn">Submit Answers</button>
                  <button onClick={handleSaveScore} className="save-btn">Save Score</button>
                </div>
              ) : (
                <div className="score">
                  You scored {correctCount} / {questions.length}
                </div>
              )}
            </>
          )}
        </main>

        <button onClick={handleBackClick} className="back-btn">← Go Back</button>
      </div>
    </div>
  );
}
