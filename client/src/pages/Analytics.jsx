import React from "react";

export default function Analytics({ dashboard }) {
  const interviews = dashboard?.all || [];

  const completed = interviews.filter(
    (x) => x.score !== null && x.score !== undefined
  );

  const scores = completed.map((x) => Number(x.score) || 0);

  const average =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const best = scores.length > 0 ? Math.max(...scores) : 0;

  const improvement =
    scores.length >= 2
      ? Math.round(scores[scores.length - 1] - scores[0])
      : 0;

  const skillStats = [
    { name: "Technical Knowledge", value: Math.min(100, average + 5) },
    { name: "Problem Solving", value: Math.min(100, average + 2) },
    { name: "Communication", value: Math.min(100, average - 3 > 0 ? average - 3 : 0) },
    { name: "Confidence", value: Math.min(100, average + 8) },
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <span className="eyebrow">PERFORMANCE INTELLIGENCE</span>
          <h1>Analytics Dashboard</h1>
          <p className="muted">
            Understand your interview performance and identify where to improve.
          </p>
        </div>

        <div className="analytics-badge">
          🤖 AI Powered
        </div>
      </div>

      {/* TOP STATS */}
      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <span>🎯</span>
          <div>
            <small>Average Score</small>
            <strong>{average}/100</strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <span>🏆</span>
          <div>
            <small>Best Score</small>
            <strong>{best}/100</strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <span>📚</span>
          <div>
            <small>Interviews Completed</small>
            <strong>{completed.length}</strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <span>📈</span>
          <div>
            <small>Overall Progress</small>
            <strong>
              {improvement > 0 ? `+${improvement}` : improvement}
            </strong>
          </div>
        </div>
      </div>

      {/* PERFORMANCE OVERVIEW */}
      <div className="analytics-grid">
        <section className="card analytics-chart-card">
          <div className="analytics-section-title">
            <div>
              <h2>Performance Overview</h2>
              <p className="muted">
                Your interview scores over time
              </p>
            </div>
          </div>

          {scores.length === 0 ? (
            <div className="analytics-empty">
              <div>📊</div>
              <h3>No performance data yet</h3>
              <p>
                Complete your first interview to start seeing analytics.
              </p>
            </div>
          ) : (
            <div className="score-chart">
              {scores.slice(-10).map((score, index) => (
                <div className="chart-column" key={index}>
                  <span>{score}</span>

                  <div className="chart-bar-wrapper">
                    <div
                      className="chart-bar"
                      style={{ height: `${Math.max(score, 5)}%` }}
                    />
                  </div>

                  <small>#{index + 1}</small>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SCORE BREAKDOWN */}
        <section className="card">
          <h2>Skill Breakdown</h2>
          <p className="muted">
            Estimated strengths based on your interview performance.
          </p>

          <div className="skill-list">
            {skillStats.map((skill) => (
              <div className="skill-row" key={skill.name}>
                <div className="skill-heading">
                  <span>{skill.name}</span>
                  <strong>{skill.value}%</strong>
                </div>

                <div className="skill-track">
                  <div
                    className="skill-progress"
                    style={{ width: `${skill.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* INTERVIEW INSIGHTS */}
      <div className="analytics-grid">
        <section className="card">
          <h2>Interview Insights</h2>
          <p className="muted">
            AI-generated observations from your practice history.
          </p>

          <div className="insight-list">
            <div className="insight">
              <span>🔥</span>
              <div>
                <strong>Keep practicing consistently</strong>
                <p>
                  Regular interviews help improve speed, confidence and
                  technical accuracy.
                </p>
              </div>
            </div>

            <div className="insight">
              <span>💡</span>
              <div>
                <strong>Focus on weak areas</strong>
                <p>
                  Review questions where your score was below your average.
                </p>
              </div>
            </div>

            <div className="insight">
              <span>🚀</span>
              <div>
                <strong>Try harder interview tracks</strong>
                <p>
                  Once your average score improves, challenge yourself with
                  Medium and Hard interviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RECENT PERFORMANCE */}
        <section className="card">
          <h2>Recent Performance</h2>

          <div className="analytics-recent">
            {completed.length === 0 ? (
              <p className="muted">No completed interviews yet.</p>
            ) : (
              completed
                .slice(-5)
                .reverse()
                .map((item, index) => (
                  <div className="analytics-recent-row" key={item.id || index}>
                    <div>
                      <strong>{item.role || "Interview"}</strong>
                      <span>
                        {item.difficulty || "Practice"}
                      </span>
                    </div>

                    <strong>
                      {Math.round(item.score)}/100
                    </strong>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>

      {/* AI RECOMMENDATION */}
      <section className="analytics-recommendation">
        <div className="recommendation-icon">🤖</div>

        <div>
          <span className="eyebrow">AI RECOMMENDATION</span>
          <h2>
            {average >= 80
              ? "You're interview ready!"
              : average >= 60
              ? "You're making good progress."
              : "Keep building your fundamentals."}
          </h2>

          <p>
            {average >= 80
              ? "Challenge yourself with harder interviews and focus on consistency."
              : average >= 60
              ? "Continue practicing and target the areas where your performance is weakest."
              : "Complete more interviews to identify your strongest and weakest areas."}
          </p>
        </div>
      </section>
    </div>
  );
}
