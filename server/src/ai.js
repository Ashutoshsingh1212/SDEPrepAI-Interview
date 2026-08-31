import "./env.js";

const demoQuestions = [
  "Tell me about yourself and the technical experience that makes you suitable for this role.",

  "What are the most important technical concepts you would expect to use in this role, and how have you applied them?",

  "Explain a challenging technical problem you solved and walk me through your approach step by step.",

  "How would you design a scalable and maintainable system for a production application related to this role?",

  "Given an array of numbers, how would you find duplicate elements efficiently, and what would be the time and space complexity?",

  "Suppose your application becomes significantly slower as the number of users increases. How would you identify and optimise the bottleneck?",

  "Tell me about the most important project you have built. What problem does it solve and what was your technical contribution?",

  "Describe the architecture of one of your projects, including the frontend, backend, database and communication between them.",

  "How have you deployed an application to production, and what problems did you face during deployment?",

  "Imagine users report that your production application is failing randomly. How would you debug and investigate the issue?",

  "Describe a situation where you received critical feedback on your work. How did you respond and what did you change?",

  "You are given a new feature with unclear requirements and a short deadline. How would you communicate with your team and decide what to build?"
];

async function openai(messages, temperature = 0.2) {
  const key = process.env.OPENAI_API_KEY;

  if (!key || key.trim() === "") {
    console.warn("OPENAI_API_KEY is not configured. Using demo questions.");
    return null;
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature,
          messages
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`OpenAI error (${response.status}):`, errText);
      return null;
    }

    const json = await response.json();

    return json.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("OpenAI request failed:", err.message);
    return null;
  }
}

export async function generateQuestions({
  role,
  difficulty,
  jobDescription,
  githubSummary,
  language = "en-IN"
}) {
  const prompt = `
You are conducting a realistic professional interview for a ${difficulty} ${role} candidate.

Create EXACTLY 12 interview questions.

The questions must be personalised to the candidate's selected role, job description and project experience.

ROLE:
${role}

DIFFICULTY:
${difficulty}

JOB DESCRIPTION:
${jobDescription || "General software engineering role"}

CANDIDATE GITHUB / PROJECT INFORMATION:
${githubSummary || "Not available"}

LANGUAGE:
${language}

QUESTION STRUCTURE:

1. Introduction and background — EXACTLY 1 question
Ask about the candidate's background, relevant experience and suitability for the role.

2. Core technical knowledge — EXACTLY 3 questions
Ask technical questions specifically related to the ${role} position.
Questions must test practical and real-world technical knowledge.

3. DSA and problem solving — EXACTLY 2 questions
Ask questions involving:
- Data structures
- Algorithms
- Time complexity
- Space complexity
- Optimisation
- Problem solving

Adapt the difficulty to ${difficulty}.

4. Candidate projects — EXACTLY 2 questions
Ask about projects the candidate has actually built.
Focus on:
- Architecture
- Technologies used
- Technical decisions
- Challenges
- Trade-offs
- Improvements

If GitHub information is available, personalise these questions using that information.

5. Deployment and production — EXACTLY 1 question
Ask about one of:
- Deployment
- APIs
- Databases
- Debugging
- Scalability
- Security
- Production issues
- Performance

6. Communication and behavioural skills — EXACTLY 2 questions
Ask about:
- Teamwork
- Communication
- Failure
- Feedback
- Conflict
- Decision making
- Problem solving

7. Final technical scenario — EXACTLY 1 question
Give one realistic company-style technical scenario related specifically to the ${role} role.

IMPORTANT RULES:

- The total number of questions MUST be EXACTLY 12.
- Questions must feel like a real professional company interview.
- Do NOT ask generic repeated questions.
- Every question must be different.
- Technical questions must match the selected role.
- DSA questions should be practical and interview-level.
- Project questions should use GitHub information when available.
- Ask questions clearly and professionally.
- Do NOT include answers.
- Do NOT include explanations.
- Do NOT include numbering inside question strings.
- Return questions only.

Return ONLY a valid JSON array containing EXACTLY 12 question strings.

Example format:

[
  "Question one?",
  "Question two?",
  "Question three?"
]
`;

  try {
    const raw = await openai(
      [
        {
          role: "system",
          content:
            "You are an expert Senior Technical Interviewer. Generate realistic, role-specific interview questions. Follow the requested question count and category distribution exactly."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      0.4
    );

    if (raw) {
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      if (
        Array.isArray(parsed) &&
        parsed.length === 12 &&
        parsed.every(
          (question) =>
            typeof question === "string" && question.trim().length > 0
        )
      ) {
        return parsed.map((question) => question.trim());
      }

      console.warn(
        "AI did not return exactly 12 valid questions. Using fallback questions."
      );
    }
  } catch (err) {
    console.error("Question generation error:", err.message);
  }

  return demoQuestions;
}

export async function evaluateInterview({ role, transcript }) {
  const text = transcript
    .map((item) => `${item.type}: ${item.content}`)
    .join("\n");

  const systemPrompt = `
You are a strict, professional Senior Technical Interviewer evaluating a candidate for the role of ${role}.

Evaluate the candidate based on:

- Technical accuracy
- Depth of knowledge
- Problem-solving ability
- Communication
- Project understanding
- Practical engineering knowledge
- Ability to explain trade-offs

STRICT SCORING RULES:

1. GIBBERISH / RANDOM TYPING / NONSENSE:
If the candidate inputs random letters, meaningless text, disconnected words or non-answers, assign a score between 0 and 10 out of 100.

2. VAGUE / SHALLOW ANSWERS:
If answers are very short, generic or lack technical understanding, assign approximately 15 to 40.

3. PARTIALLY GOOD ANSWERS:
If the candidate demonstrates some technical knowledge but lacks depth, assign approximately 40 to 65.

4. SOLID / TECHNICAL ANSWERS:
If answers are technically accurate, structured and demonstrate practical understanding, assign approximately 65 to 80.

5. EXCEPTIONAL ANSWERS:
If the candidate demonstrates deep technical knowledge, strong reasoning, practical experience and excellent communication, assign approximately 85 to 100.

Return JSON ONLY in this exact format:

{
  "score": <number from 0 to 100>,
  "summary": "<brief 2 to 3 sentence evaluation>",
  "strengths": [
    "<strength 1>",
    "<strength 2>"
  ],
  "weaknesses": [
    "<weakness 1>",
    "<weakness 2>"
  ],
  "improvements": [
    "<improvement 1>",
    "<improvement 2>"
  ]
}
`;

  try {
    const raw = await openai(
      [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Evaluate this interview transcript:\n\n${text}`
        }
      ],
      0.1
    );

    if (raw) {
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const result = JSON.parse(cleaned);

      if (
        typeof result?.score === "number" &&
        result.score >= 0 &&
        result.score <= 100
      ) {
        return result;
      }
    }
  } catch (err) {
    console.error("AI Evaluation error:", err.message);
  }

  // Offline fallback evaluation

  const userMessages = transcript
    .filter((item) => item.type === "User")
    .map((item) => item.content.trim())
    .filter(Boolean);

  let validAnswers = 0;
  let totalWords = 0;

  for (const message of userMessages) {
    const words = message.split(/\s+/).filter(Boolean);

    totalWords += words.length;

    if (words.length >= 4 && message.length > 25) {
      validAnswers++;
    }
  }

  if (validAnswers === 0) {
    return {
      score: 5,
      summary:
        "The candidate submitted incoherent, invalid or insufficient answers containing little meaningful technical content.",
      strengths: ["The interview session was completed."],
      weaknesses: [
        "Responses contained random typing, non-answers or insufficient detail."
      ],
      improvements: [
        "Provide clear and structured answers.",
        "Explain technical concepts using practical examples."
      ]
    };
  }

  const averageWords =
    userMessages.length > 0
      ? Math.round(totalWords / userMessages.length)
      : 0;

  let score = Math.min(60, validAnswers * 5 + Math.min(30, averageWords));

  score = Math.max(15, Math.round(score));

  return {
    score,
    summary:
      "The candidate provided some meaningful responses, but the offline evaluation cannot fully measure technical accuracy or depth.",
    strengths: [
      "The candidate attempted to answer multiple questions.",
      "Responses contained some meaningful explanation."
    ],
    weaknesses: [
      "Technical depth could not be fully verified without AI evaluation.",
      "Some answers may require more structured explanations and examples."
    ],
    improvements: [
      "Explain the reasoning behind technical decisions.",
      "Include practical examples, trade-offs and complexity analysis where relevant."
    ]
  };
}