import React, { useState } from "react";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL || "https://sdeprepai.onrender.com";

const steps = [
  "Role",
  "Skills",
  "Questions",
  "Settings",
  "Evaluation",
  "Review",
];

const roles = [
  ["Frontend Developer", "React • JavaScript • CSS"],
  ["Backend Developer", "Node.js • APIs • SQL"],
  ["Full Stack Developer", "React • Node.js • SQL"],
  ["AI Engineer", "Python • ML • LLMs"],
  ["Data Scientist", "Python • SQL • Statistics"],
  ["DevOps Engineer", "AWS • Docker • Kubernetes"],
];

const domains = [
  [
    "software",
    "Software Engineering",
    "Frontend, backend, full stack, APIs and system design",
  ],
  [
    "ai",
    "AI / Machine Learning",
    "ML, deep learning, LLMs, RAG and AI engineering",
  ],
  [
    "data",
    "Data",
    "SQL, analytics, data science and data engineering",
  ],
  [
    "cloud",
    "DevOps & Cloud",
    "AWS, Docker, Kubernetes, CI/CD and cloud architecture",
  ],
  [
    "security",
    "Cybersecurity",
    "Application, network and cloud security",
  ],
  [
    "mobile",
    "Mobile Development",
    "Android, iOS, Flutter and React Native",
  ],
  [
    "product",
    "Product / Design",
    "Product strategy, UX/UI and case studies",
  ],
];

const skills = {
  software: [
    "React",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Express",
    "Python",
    "Java",
    "REST APIs",
    "SQL",
    "MongoDB",
    "Redis",
    "Docker",
    "System Design",
    "DSA",
  ],

  ai: [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "Generative AI",
    "LLMs",
    "RAG",
    "Prompt Engineering",
    "Fine-Tuning",
    "AI Agents",
    "MLOps",
  ],

  data: [
    "SQL",
    "Python",
    "Statistics",
    "Data Analytics",
    "Data Science",
    "Power BI",
    "Tableau",
    "Data Engineering",
    "Spark",
    "ETL",
  ],

  cloud: [
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Terraform",
    "Linux",
    "Networking",
    "Cloud Architecture",
  ],

  security: [
    "OWASP",
    "Network Security",
    "Application Security",
    "Cloud Security",
    "Penetration Testing",
    "SOC",
    "Cryptography",
    "IAM",
  ],

  mobile: [
    "Android",
    "Kotlin",
    "Java",
    "iOS",
    "Swift",
    "Flutter",
    "React Native",
  ],

  product: [
    "Product Management",
    "UX/UI",
    "Product Strategy",
    "User Research",
    "Product Analytics",
    "Case Studies",
  ],
};

const questionTypes = [
  "Technical",
  "Problem Solving",
  "Behavioral",
  "Coding",
  "System Design",
  "SQL",
];

const experienceLevels = [
  "Intern",
  "Entry Level",
  "Junior",
  "Mid Level",
  "Senior",
  "Lead",
];

function createInitialForm() {
  return {
    candidateName: "",
    email: "",

    role: "",

    experience: "Mid Level",

    domain: "software",

    selectedSkills: [
      "React",
      "JavaScript",
      "Node.js",
    ],

    weights: {
      React: 40,
      JavaScript: 30,
      "Node.js": 30,
    },

    questionCount: 10,

    questionTypes: [
      "Technical",
      "Problem Solving",
      "Behavioral",
    ],

    difficulty: "Medium",

    duration: 45,

    date: "",

    time: "",

    adaptive: true,

    followUp: true,

    resumeBased: false,

    camera: false,

    microphone: true,

    evaluation: {
      technical: 30,
      problemSolving: 25,
      communication: 15,
      coding: 15,
      systemDesign: 10,
      confidence: 5,
    },

    aiInstructions:
      "Focus on practical, real-world questions and ask follow-ups when the candidate demonstrates strong understanding.",
  };
}

/* =========================================================
   SMALL REUSABLE COMPONENTS
========================================================= */

function Intro({
  number,
  title,
  description,
}) {
  return (
    <div className="step-intro">
      <span>{number}</span>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function ReviewBlock({
  title,
  value,
  tags = [],
  onEdit,
}) {
  return (
    <div className="review-block">
      <div>
        <h3>{title}</h3>

        <button
          type="button"
          className="text-btn"
          onClick={onEdit}
        >
          Edit
        </button>
      </div>

      <strong>{value}</strong>

      {tags.length > 0 && (
        <div className="review-tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RecruiterDashboard({
  onBack,
}) {

  const [mode, setMode] = useState("home");

  const [profile, setProfile] = useState({
    name: "",
    company: "",
    designation: "",
    email: "",
  });

  const [step, setStep] = useState(0);

  const [form, setForm] = useState(
    createInitialForm()
  );

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [created, setCreated] = useState(null);

  /* =======================================================
     FORM UPDATE
  ======================================================= */

  const updateForm = (patch) => {
    setForm((previous) => ({
      ...previous,
      ...patch,
    }));
  };

  const selectedSkills =
    form.selectedSkills;

  const domainSkills =
    skills[form.domain] || [];

  /* =======================================================
     TOTAL EVALUATION
  ======================================================= */

  const totalEvaluation =
    Object.values(form.evaluation).reduce(
      (total, value) =>
        total + Number(value || 0),
      0
    );

  /* =======================================================
     TOTAL SKILL WEIGHT
  ======================================================= */

  const totalSkillWeight =
    selectedSkills.reduce(
      (total, skill) =>
        total +
        Number(form.weights[skill] || 0),
      0
    );

  /* =======================================================
     ROLE PRESETS
  ======================================================= */

  const chooseRole = (role) => {
    const presets = {
      "Frontend Developer": [
        "React",
        "JavaScript",
        "TypeScript",
      ],

      "Backend Developer": [
        "Node.js",
        "REST APIs",
        "SQL",
      ],

      "Full Stack Developer": [
        "React",
        "JavaScript",
        "Node.js",
        "SQL",
      ],

      "AI Engineer": [
        "Python",
        "Machine Learning",
        "LLMs",
      ],

      "Data Scientist": [
        "Python",
        "SQL",
        "Statistics",
      ],

      "DevOps Engineer": [
        "AWS",
        "Docker",
        "Kubernetes",
      ],
    };

    const selected =
      presets[role] || selectedSkills;

    const weights = {};

    selected.forEach((skill, index) => {
      if (selected.length === 1) {
        weights[skill] = 100;
      } else if (index === 0) {
        weights[skill] = 40;
      } else {
        weights[skill] = Math.floor(
          60 /
            (selected.length - 1)
        );
      }
    });

    updateForm({
      role,
      selectedSkills: selected,
      weights,
    });
  };

  /* =======================================================
     DOMAIN
  ======================================================= */

  const chooseDomain = (domain) => {
    const list = (
      skills[domain] || []
    ).slice(0, 3);

    const weights = {};

    if (list.length === 1) {
      weights[list[0]] = 100;
    } else if (list.length === 2) {
      weights[list[0]] = 50;
      weights[list[1]] = 50;
    } else {
      list.forEach((skill, index) => {
        weights[skill] =
          index === 0 ? 40 : 30;
      });
    }

    updateForm({
      domain,
      selectedSkills: list,
      weights,
    });
  };

  /* =======================================================
     SKILL TOGGLE
  ======================================================= */

  const toggleSkill = (skill) => {
    const exists =
      selectedSkills.includes(skill);

    if (exists) {
      const nextSkills =
        selectedSkills.filter(
          (item) => item !== skill
        );

      const nextWeights = {
        ...form.weights,
      };

      delete nextWeights[skill];

      updateForm({
        selectedSkills: nextSkills,
        weights: nextWeights,
      });

      return;
    }

    const nextSkills = [
      ...selectedSkills,
      skill,
    ];

    const nextWeights = {
      ...form.weights,
      [skill]: 20,
    };

    updateForm({
      selectedSkills: nextSkills,
      weights: nextWeights,
    });
  };

  /* =======================================================
     QUESTION TYPE
  ======================================================= */

  const toggleQuestionType = (
    type
  ) => {
    const exists =
      form.questionTypes.includes(type);

    const nextTypes = exists
      ? form.questionTypes.filter(
          (item) => item !== type
        )
      : [
          ...form.questionTypes,
          type,
        ];

    updateForm({
      questionTypes: nextTypes,
    });
  };

  /* =======================================================
     NEXT STEP
  ======================================================= */

  const nextStep = () => {
    setError("");

    if (
      step === 0 &&
      !form.role.trim()
    ) {
      setError(
        "Choose a role or enter a job title."
      );
      return;
    }

    if (
      step === 1 &&
      selectedSkills.length === 0
    ) {
      setError(
        "Select at least one skill."
      );
      return;
    }

    if (
      step === 2 &&
      form.questionTypes.length === 0
    ) {
      setError(
        "Select at least one question type."
      );
      return;
    }

    if (
      step === 4 &&
      totalEvaluation !== 100
    ) {
      setError(
        `Evaluation weights must total 100%. Current total: ${totalEvaluation}%.`
      );
      return;
    }

    setStep((current) =>
      Math.min(
        steps.length - 1,
        current + 1
      )
    );
  };

  /* =======================================================
     PREVIOUS STEP
  ======================================================= */

  const previousStep = () => {
    setError("");

    setStep((current) =>
      Math.max(0, current - 1)
    );
  };

  /* =======================================================
     EMAIL VALIDATION
  ======================================================= */

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};
  /* =======================================================
     CREATE INTERVIEW
  ======================================================= */

  const createInterview = async () => {
    setError("");

    if (
      !form.candidateName.trim()
    ) {
      setError(
        "Please enter the candidate name."
      );
      setStep(5);
      return;
    }

 if (!isValidEmail(form.email)) {
      setError(
        "Please enter a valid candidate email address."
      );
      setStep(5);
      return;
    }

   
    if (!form.date) {
      setError(
        "Please select an interview date."
      );
      setStep(3);
      return;
    }

    if (!form.time) {
      setError(
        "Please select an interview time."
      );
      setStep(3);
      return;
    }

    if (selectedSkills.length === 0) {
      setError(
        "Please select at least one skill."
      );
      setStep(1);
      return;
    }

    if (
      form.questionTypes.length === 0
    ) {
      setError(
        "Please select at least one question type."
      );
      setStep(2);
      return;
    }

    if (totalEvaluation !== 100) {
      setError(
        `Evaluation weights must total 100%. Current total: ${totalEvaluation}%.`
      );
      setStep(4);
      return;
    }

    setLoading(true);

    try {
      const domainName =
        domains.find(
          (domain) =>
            domain[0] === form.domain
        )?.[1] || form.domain;

      const jobDescription = [
        `Domain: ${domainName}`,

        `Experience: ${form.experience}`,

        `Skills: ${selectedSkills.join(
          ", "
        )}`,

        `Skill weights: ${JSON.stringify(
          form.weights
        )}`,

        `Question types: ${form.questionTypes.join(
          ", "
        )}`,

        `Question count: ${form.questionCount}`,

        `Difficulty: ${form.difficulty}`,

        `Evaluation weights: ${JSON.stringify(
          form.evaluation
        )}`,

        `Adaptive: ${form.adaptive}`,

        `Follow-ups: ${form.followUp}`,

        `Resume-based: ${form.resumeBased}`,

        `Camera: ${form.camera}`,

        `Microphone: ${form.microphone}`,

        `Interview date: ${form.date}`,

        `Interview time: ${form.time}`,

        `AI Instructions: ${form.aiInstructions}`,
      ].join("\n");

      /* ===================================================
         API REQUEST
      =================================================== */

      const res = await axios.post(
        `${API}/api/v1/pre-interview`,
        {
          candidateName:
            form.candidateName,

          email: form.email,

          role: form.role,

          difficulty:
            form.difficulty,

          duration:
            form.duration,

          github: "",

          jobDescription,
          language: "en-IN",
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("staff_token") || ""}` } }
      );

      /* ===================================================
         IMPORTANT FIX

         Your old code used:

         response.data

         But the axios response variable is:

         res

         Therefore we use:

         res.data
      =================================================== */

      setCreated({
        ...form,

        id:
          res.data?.id ||
          "Created",

        questions:
          res.data?.questions ||
          [],

        interviewLink: res.data?.interviewUrl || "",
        emailSent: Boolean(res.data?.emailSent),
        emailError: res.data?.emailError || "",
      });

      setMode("success");
    } catch (err) {
      console.error(
        "Create interview error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not create the interview. Make sure the backend is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     SUCCESS PAGE
  ======================================================= */

  if (mode === "success") {
    return (
      <div className="recruiter-page">
        <div className="success-screen">

          <div className="success-mark">
            ✓
          </div>

          <div className="recruiter-eyebrow">
            INTERVIEW READY
          </div>

          <h1>
            Interview Created
          </h1>

          <p>
            {created?.role} •{" "}
            {created?.experience} •{" "}
            {created?.duration} minutes
          </p>

          <div className="success-card">

            <div>
              <span>
                Candidate
              </span>

              <strong>
                {created?.candidateName}
              </strong>
            </div>

            <div>
              <span>
                Candidate Email
              </span>

              <strong>
                {created?.email}
              </strong>
            </div>

            <div>
              <span>
                Interview ID
              </span>

              <strong>
                {created?.id}
              </strong>
            </div>

            <div>
              <span>
                Date
              </span>

              <strong>
                {created?.date}
              </strong>
            </div>

            <div>
              <span>
                Time
              </span>

              <strong>
                {created?.time}
              </strong>
            </div>

          </div>

          <div className="success-card">
            <div><span>Email status</span><strong>{created?.emailSent ? "✓ Invitation email sent" : `⚠ Email not sent${created?.emailError ? `: ${created.emailError}` : ""}`}</strong></div>
          </div>

          {created?.interviewLink && (
            <div className="success-card">

              <div>
                <span>
                  Candidate Interview Link
                </span>

                <strong>
                  {created.interviewLink}
                </strong>
              </div>

            </div>
          )}

          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setForm(
                createInitialForm()
              );

              setStep(0);

              setMode("home");

              setError("");
            }}
          >
            Back to Recruiter
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setForm(
                createInitialForm()
              );

              setStep(0);

              setMode("builder");

              setError("");
            }}
          >
            Create Another
          </button>

        </div>
      </div>
    );
  }

  /* =======================================================
     HOME
  ======================================================= */

  if (mode === "home") {
    return (
      <div className="recruiter-page">

        <div className="recruiter-shell">

  <div className="builder-hero-card">
    <div>
      <div className="recruiter-eyebrow">
        RECRUITER PROFILE
      </div>

      <h2>My Profile</h2>

      <p>
        Add your recruiter and company information.
      </p>
    </div>

    <div className="two-col">

      <label>
        Your Name

        <input
          type="text"
          value={profile.name}
          onChange={(event) =>
            setProfile({
              ...profile,
              name: event.target.value,
            })
          }
          placeholder="Your full name"
        />
      </label>

      <label>
        Company Name

        <input
          type="text"
          value={profile.company}
          onChange={(event) =>
            setProfile({
              ...profile,
              company: event.target.value,
            })
          }
          placeholder="Company name"
        />
      </label>

      <label>
        Designation

        <input
          type="text"
          value={profile.designation}
          onChange={(event) =>
            setProfile({
              ...profile,
              designation: event.target.value,
            })
          }
          placeholder="HR Manager / Recruiter"
        />
      </label>

      <label>
        Recruiter Email

        <input
          type="email"
          value={profile.email}
          onChange={(event) =>
            setProfile({
              ...profile,
              email: event.target.value,
            })
          }
          placeholder="your@email.com"
        />
      </label>

    </div>
  </div>

  <header className="recruiter-header">

            <div>

              <div className="recruiter-eyebrow">
                RECRUITER WORKSPACE
              </div>

              <h1>
                Interview Studio
              </h1>

              <p>
                Build structured AI
                interviews by role,
                skill and evaluation
                criteria.
              </p>

            </div>

            <div className="recruiter-actions">

              <button
                type="button"
                className="secondary-btn"
                onClick={onBack}
              >
                ← Back
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  setError("");
                  setMode("builder");
                }}
              >
                ＋ Create Interview
              </button>

            </div>

          </header>

          <section className="builder-hero-card">

            <div>

              <div className="hero-icon">
                ✦
              </div>

              <h2>
                Build an AI interview
                in six steps
              </h2>

              <p>
                Configure role, skills,
                questions, interview
                behavior and scoring
                before you invite a
                candidate.
              </p>

            </div>

            <div className="hero-flow">

              {steps.map(
                (item, index) => (
                  <span key={item}>
                    {index + 1}. {item}

                    {index <
                    steps.length - 1
                      ? " → "
                      : ""}
                  </span>
                )
              )}

            </div>

          </section>

          <div className="section-heading">

            <h2>
              Start with a role
              template
            </h2>

            <p>
              Choose a common role
              to pre-fill the builder.
            </p>

          </div>

          <div className="role-grid">

            {roles.map(
              ([name, description]) => (
                <button
                  type="button"
                  className="role-template"
                  key={name}
                  onClick={() => {
                    chooseRole(name);
                    setMode("builder");
                  }}
                >

                  <strong>
                    {name}
                  </strong>

                  <span>
                    {description}
                  </span>

                  <b>›</b>

                </button>
              )
            )}

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     BUILDER
  ======================================================= */

  return (
    <div className="recruiter-page">

      <div className="recruiter-shell builder-shell">

        <header className="recruiter-header">

          <div>

            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setError("");
                setMode("home");
              }}
            >
              ← Recruiter
            </button>

            <div className="recruiter-eyebrow">
              INTERVIEW BUILDER
            </div>

            <h1>
              Create Interview
            </h1>

          </div>

          <span className="hint">
            Step {step + 1} of{" "}
            {steps.length}
          </span>

        </header>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div className="builder-progress">

          {steps.map(
            (item, index) => (
              <div
                key={item}
                className={[
                  "builder-step",
                  index === step
                    ? "current"
                    : "",
                  index < step
                    ? "done"
                    : "",
                ].join(" ")}
              >

                <span>
                  {index < step
                    ? "✓"
                    : index + 1}
                </span>

                {item}

              </div>
            )
          )}

        </div>

        <div className="builder-card">

          <div className="step-content">

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="builder-error">
                {error}
              </div>
            )}

            {/* =================================================
                STEP 1 — ROLE
            ================================================= */}

            {step === 0 && (
              <>
                <Intro
                  number="01"
                  title="What role are you hiring for?"
                  description="Choose a role and experience level. The AI uses this to calibrate the interview."
                />

                <label>
                  Job Title

                  <input
                    type="text"
                    value={form.role}
                    onChange={(event) =>
                      updateForm({
                        role:
                          event.target
                            .value,
                      })
                    }
                    placeholder="e.g. Full Stack Developer"
                    autoComplete="off"
                  />
                </label>

                <h3>
                  Popular Roles
                </h3>

                <div className="role-grid compact">

                  {roles.map(
                    ([name, description]) => (
                      <button
                        type="button"
                        className={[
                          "role-template",
                          form.role === name
                            ? "selected"
                            : "",
                        ].join(" ")}
                        key={name}
                        onClick={() =>
                          chooseRole(name)
                        }
                      >

                        <strong>
                          {name}
                        </strong>

                        <span>
                          {description}
                        </span>

                      </button>
                    )
                  )}

                </div>

                <h3>
                  Experience Level
                </h3>

                <div className="choice-row">

                  {experienceLevels.map(
                    (level) => (
                      <button
                        type="button"
                        className={[
                          "choice",
                          form.experience ===
                          level
                            ? "selected"
                            : "",
                        ].join(" ")}
                        key={level}
                        onClick={() =>
                          updateForm({
                            experience:
                              level,
                          })
                        }
                      >
                        {level}
                      </button>
                    )
                  )}

                </div>
              </>
            )}

            {/* =================================================
                STEP 2 — SKILLS
            ================================================= */}

            {step === 1 && (
              <>
                <Intro
                  number="02"
                  title="What skills should this interview evaluate?"
                  description="Select a domain and the exact skills the AI should test."
                />

                <h3>
                  Domain
                </h3>

                <div className="domain-grid">

                  {domains.map(
                    ([
                      id,
                      name,
                      description,
                    ]) => (
                      <button
                        type="button"
                        className={[
                          "domain-card",
                          form.domain === id
                            ? "selected"
                            : "",
                        ].join(" ")}
                        key={id}
                        onClick={() =>
                          chooseDomain(id)
                        }
                      >

                        <strong>
                          {name}
                        </strong>

                        <small>
                          {description}
                        </small>

                      </button>
                    )
                  )}

                </div>

                <h3>
                  Skills
                </h3>

                <div className="skill-grid">

                  {domainSkills.map(
                    (skill) => {
                      const selected =
                        selectedSkills.includes(
                          skill
                        );

                      return (
                        <button
                          type="button"
                          className={[
                            "skill-chip",
                            selected
                              ? "selected"
                              : "",
                          ].join(" ")}
                          key={skill}
                          onClick={() =>
                            toggleSkill(
                              skill
                            )
                          }
                        >
                          {selected
                            ? "✓"
                            : "+"}{" "}
                          {skill}
                        </button>
                      );
                    }
                  )}

                </div>

                <h3>
                  Skill Weighting{" "}
                  <span className="hint">
                    optional
                  </span>
                </h3>

                <div className="weight-list">

                  {selectedSkills.map(
                    (skill) => (
                      <div
                        className="weight-row"
                        key={skill}
                      >

                        <strong>
                          {skill}
                        </strong>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            form.weights[
                              skill
                            ] ?? 0
                          }
                          onChange={(
                            event
                          ) =>
                            updateForm({
                              weights: {
                                ...form.weights,
                                [skill]:
                                  Number(
                                    event
                                      .target
                                      .value
                                  ),
                              },
                            })
                          }
                        />

                        <span>
                          %
                        </span>

                      </div>
                    )
                  )}

                  <div className="evaluation-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      {totalSkillWeight}%
                    </strong>

                  </div>

                </div>
              </>
            )}

            {/* =================================================
                STEP 3 — QUESTIONS
            ================================================= */}

            {step === 2 && (
              <>
                <Intro
                  number="03"
                  title="Configure questions"
                  description="Choose the number, type and difficulty. Your backend AI can use these settings when generating questions."
                />

                <div className="two-col">

                  <label>
                    Number of Questions

                    <select
                      value={
                        form.questionCount
                      }
                      onChange={(event) =>
                        updateForm({
                          questionCount:
                            Number(
                              event.target
                                .value
                            ),
                        })
                      }
                    >
                      {[5, 8, 10, 12, 15, 20].map(
                        (count) => (
                          <option
                            key={count}
                            value={count}
                          >
                            {count}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    Difficulty

                    <select
                      value={
                        form.difficulty
                      }
                      onChange={(event) =>
                        updateForm({
                          difficulty:
                            event.target
                              .value,
                        })
                      }
                    >
                      {[
                        "Easy",
                        "Medium",
                        "Hard",
                      ].map(
                        (level) => (
                          <option
                            key={level}
                            value={level}
                          >
                            {level}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                </div>

                <h3>
                  Question Types
                </h3>

                <div className="choice-row">

                  {questionTypes.map(
                    (type) => {
                      const selected =
                        form.questionTypes.includes(
                          type
                        );

                      return (
                        <button
                          type="button"
                          className={[
                            "choice",
                            selected
                              ? "selected"
                              : "",
                          ].join(" ")}
                          key={type}
                          onClick={() =>
                            toggleQuestionType(
                              type
                            )
                          }
                        >
                          {selected
                            ? "✓ "
                            : ""}
                          {type}
                        </button>
                      );
                    }
                  )}

                </div>

                <div className="ai-box">

                  <div>
                    <strong>
                      AI Question Generation
                    </strong>

                    <p>
                      Questions will be
                      generated from the
                      role, skills,
                      difficulty and
                      instructions.
                    </p>
                  </div>

                  <span className="toggle-button on">
                    AI ON
                  </span>

                </div>

                <label>
                  AI Instructions

                  <textarea
                    value={
                      form.aiInstructions
                    }
                    onChange={(event) =>
                      updateForm({
                        aiInstructions:
                          event.target
                            .value,
                      })
                    }
                    rows={6}
                    placeholder="Tell the AI interviewer how to conduct the interview..."
                  />
                </label>
              </>
            )}

            {/* =================================================
                STEP 4 — SETTINGS
            ================================================= */}

            {step === 3 && (
              <>
                <Intro
                  number="04"
                  title="Interview settings"
                  description="Configure duration, scheduling and AI behavior."
                />

                <div className="two-col">

                  <label>
                    Duration

                    <select
                      value={
                        form.duration
                      }
                      onChange={(event) =>
                        updateForm({
                          duration:
                            Number(
                              event.target
                                .value
                            ),
                        })
                      }
                    >
                      {[15, 30, 45, 60].map(
                        (duration) => (
                          <option
                            key={duration}
                            value={duration}
                          >
                            {duration} minutes
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    Interview Date

                    <input
                      type="date"
                      value={form.date}
                      onChange={(event) =>
                        updateForm({
                          date:
                            event.target
                              .value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Interview Time

                    <input
                      type="time"
                      value={form.time}
                      onChange={(event) =>
                        updateForm({
                          time:
                            event.target
                              .value,
                        })
                      }
                    />
                  </label>

                </div>

                <h3>
                  AI Interviewer
                  Behavior
                </h3>

                <div className="toggle-list">

                  {[
                    [
                      "adaptive",
                      "Adaptive difficulty",
                    ],
                    [
                      "followUp",
                      "Ask follow-up questions",
                    ],
                    [
                      "resumeBased",
                      "Ask resume-based questions",
                    ],
                  ].map(
                    ([key, label]) => (
                      <button
                        type="button"
                        key={key}
                        className={[
                          "toggle-row",
                          form[key]
                            ? "on"
                            : "",
                        ].join(" ")}
                        onClick={() =>
                          updateForm({
                            [key]:
                              !form[key],
                          })
                        }
                      >

                        <span>
                          {label}
                        </span>

                        <i>
                          {form[key]
                            ? "ON"
                            : "OFF"}
                        </i>

                      </button>
                    )
                  )}

                </div>

                <h3>
                  Candidate Experience
                </h3>

                <div className="toggle-list">

                  {[
                    [
                      "microphone",
                      "Enable microphone",
                    ],
                    [
                      "camera",
                      "Enable camera",
                    ],
                  ].map(
                    ([key, label]) => (
                      <button
                        type="button"
                        key={key}
                        className={[
                          "toggle-row",
                          form[key]
                            ? "on"
                            : "",
                        ].join(" ")}
                        onClick={() =>
                          updateForm({
                            [key]:
                              !form[key],
                          })
                        }
                      >

                        <span>
                          {label}
                        </span>

                        <i>
                          {form[key]
                            ? "ON"
                            : "OFF"}
                        </i>

                      </button>
                    )
                  )}

                </div>
              </>
            )}

            {/* =================================================
                STEP 5 — EVALUATION
            ================================================= */}

            {step === 4 && (
              <>
                <Intro
                  number="05"
                  title="How should candidates be evaluated?"
                  description="Set the scoring model used in the final AI report."
                />

                <div className="evaluation-list">

                  {[
                    [
                      "technical",
                      "Technical Knowledge",
                    ],
                    [
                      "problemSolving",
                      "Problem Solving",
                    ],
                    [
                      "communication",
                      "Communication",
                    ],
                    [
                      "coding",
                      "Coding Ability",
                    ],
                    [
                      "systemDesign",
                      "System Design",
                    ],
                    [
                      "confidence",
                      "Confidence",
                    ],
                  ].map(
                    ([key, label]) => (
                      <div
                        className="evaluation-row"
                        key={key}
                      >

                        <strong>
                          {label}
                        </strong>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            form.evaluation[
                              key
                            ]
                          }
                          onChange={(
                            event
                          ) =>
                            updateForm({
                              evaluation: {
                                ...form.evaluation,
                                [key]:
                                  Number(
                                    event
                                      .target
                                      .value
                                  ),
                              },
                            })
                          }
                        />

                        <span>
                          %
                        </span>

                      </div>
                    )
                  )}

                </div>

                <div className="evaluation-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    {totalEvaluation}%
                  </strong>

                </div>

                <div className="ai-box">

                  <div>
                    <strong>
                      AI Recommendation
                    </strong>

                    <p>
                      The report can
                      summarize strengths,
                      gaps, skill scores
                      and a hiring
                      recommendation.
                    </p>
                  </div>

                  <span className="toggle-button on">
                    ENABLED
                  </span>

                </div>
              </>
            )}

            {/* =================================================
                STEP 6 — REVIEW
            ================================================= */}

            {step === 5 && (
              <>
                <Intro
                  number="06"
                  title="Review your interview"
                  description="Confirm the configuration before creating the interview."
                />

                <ReviewBlock
                  title="Role"
                  value={`${
                    form.role ||
                    "Not selected"
                  } • ${
                    form.experience
                  }`}
                  onEdit={() =>
                    setStep(0)
                  }
                />

                <ReviewBlock
                  title="Domain & Skills"
                  value={
                    domains.find(
                      (domain) =>
                        domain[0] ===
                        form.domain
                    )?.[1] ||
                    form.domain
                  }
                  tags={selectedSkills}
                  onEdit={() =>
                    setStep(1)
                  }
                />

                <ReviewBlock
                  title="Questions"
                  value={`${form.questionCount} questions • ${form.difficulty}`}
                  tags={
                    form.questionTypes
                  }
                  onEdit={() =>
                    setStep(2)
                  }
                />

                <ReviewBlock
                  title="Settings"
                  value={`${form.duration} min • ${
                    form.date ||
                    "No date"
                  } ${
                    form.time || ""
                  }`}
                  tags={[
                    [
                      form.adaptive,
                      "Adaptive",
                    ],
                    [
                      form.followUp,
                      "Follow-ups",
                    ],
                    [
                      form.resumeBased,
                      "Resume-based",
                    ],
                  ]
                    .filter(
                      ([enabled]) =>
                        enabled
                    )
                    .map(
                      ([, label]) =>
                        label
                    )}
                  onEdit={() =>
                    setStep(3)
                  }
                />

                <ReviewBlock
                  title="Evaluation"
                  value={`${totalEvaluation}% configured`}
                  onEdit={() =>
                    setStep(4)
                  }
                />

                {/* =================================================
                    CANDIDATE DETAILS
                ================================================= */}

                <div className="candidate-fields">

                  <h3>
                    Candidate Details
                  </h3>

                  <p className="hint">
                    Enter the candidate's
                    details. The candidate
                    email will be used by
                    the backend to send the
                    interview invitation.
                  </p>

                  <div className="two-col">

                    <label>
                      Candidate Name

                      <input
                        type="text"
                        value={
                          form.candidateName
                        }
                        onChange={(event) =>
                          updateForm({
                            candidateName:
                              event.target
                                .value,
                          })
                        }
                        placeholder="Candidate full name"
                        autoComplete="name"
                      />
                    </label>

                    <label>
                      Candidate Email

                      <input
                        type="email"
                        value={
                          form.email
                        }
                        onChange={(event) =>
                          updateForm({
                            email:
                              event.target
                                .value,
                          })
                        }
                        placeholder="candidate@example.com"
                        autoComplete="email"
                      />

                      <small className="hint">
                        Example:
                        candidate@gmail.com
                      </small>

                    </label>

                  </div>

                </div>
              </>
            )}

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="builder-footer">

            <button
              type="button"
              className="secondary-btn"
              onClick={
                previousStep
              }
              disabled={step === 0}
            >
              ← Back
            </button>

            {step <
            steps.length - 1 ? (
              <button
                type="button"
                className="primary-btn"
                onClick={
                  nextStep
                }
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                className="primary-btn"
                onClick={
                  createInterview
                }
                disabled={loading}
              >
                {loading
                  ? "Creating…"
                  : "Create Interview ✓"}
              </button>
            )}

          </footer>

        </div>

      </div>

    </div>
  );
}