// API integration with live Anthropic Claude API and smart offline demo fallback

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export function emitToast(msg) {
  window.dispatchEvent(new CustomEvent("ai-toast", { detail: msg }));
}

export function getApiKey() {
  return (
    localStorage.getItem("placement_anthropic_api_key") ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_ANTHROPIC_API_KEY) ||
    ""
  );
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem("placement_anthropic_api_key", key.trim());
  } else {
    localStorage.removeItem("placement_anthropic_api_key");
  }
}

export async function callClaude(messages, sys, maxTokens = 2000, attempt = 0) {
  const apiKey = getApiKey();

  // If user provided an API key, attempt live Claude call
  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: maxTokens,
          system: sys,
          messages
        }),
      });

      if (res.status === 429) {
        if (attempt >= 3) throw new Error("Rate limit reached. Falling back to demo data.");
        const w = Math.pow(2, attempt) * 2000;
        emitToast("Rate limited — retrying in " + (w / 1000) + "s… (" + (attempt + 1) + "/3)");
        await sleep(w);
        return callClaude(messages, sys, maxTokens, attempt + 1);
      }

      if (res.status === 529 || res.status === 503) {
        if (attempt >= 2) throw new Error("API busy. Falling back to demo data.");
        const w = 2500 * (attempt + 1);
        emitToast("API busy — retrying in " + (w / 1000) + "s…");
        await sleep(w);
        return callClaude(messages, sys, maxTokens, attempt + 1);
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      const d = await res.json();
      if (d.error) throw new Error(d.error.message || "Unknown error from API.");
      return d.content.map(b => b.text || "").join("");
    } catch (err) {
      console.warn("Live API call error:", err);
      emitToast(`Live AI note: ${err.message}. Serving intelligent mock results.`);
      await sleep(500);
      return generateMockResponse(messages, sys);
    }
  }

  // Demo mode: No API key provided
  emitToast("⚡ Demo Mode: Fast instant preview. Enter your Claude API key in ⚙️ Settings for live AI.");
  await sleep(650);
  return generateMockResponse(messages, sys);
}

export function parseJSON(raw) {
  let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const m = s.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (m) s = m[0];
  return JSON.parse(s);
}

// Intelligent mock data generator tailored to each feature
function generateMockResponse(messages, sys) {
  const userMsg = messages[messages.length - 1]?.content || "";
  const sysLower = (sys || "").toLowerCase();

  // 1. Skill Matcher
  if (sysLower.includes("career placement expert") && sysLower.includes("matchedskills")) {
    const skillsMentioned = userMsg.replace(/^My skills:\s*/i, "").split(",").map(s => s.trim()).filter(Boolean);
    const primary = skillsMentioned.slice(0, 3);
    const hasFrontend = skillsMentioned.some(s => /react|javascript|css|html|frontend/i.test(s));
    const hasData = skillsMentioned.some(s => /python|machine learning|data|sql|tensorflow/i.test(s));
    const hasBackend = skillsMentioned.some(s => /java|node|spring|django|sql|c\+\+/i.test(s));

    return JSON.stringify([
      {
        role: hasFrontend ? "Full Stack Software Engineer" : "Software Development Engineer (SDE-1)",
        match: 92,
        description: "Build robust, scalable full-stack applications with modern frameworks and cloud-native architecture.",
        matchedSkills: primary.length ? primary : ["JavaScript", "React", "SQL"],
        missingSkills: ["Docker", "Redis", "CI/CD Pipelines", "System Design"],
        learningPath: [
          "Master core data structures (Trees, Graphs, DP)",
          "Implement microservices with caching & message queues",
          "Deploy containerized workloads to cloud platforms"
        ]
      },
      {
        role: hasData ? "Data & ML Engineer" : "Backend Systems Engineer",
        match: 84,
        description: "Design high-throughput APIs, data pipelines, and optimized database architectures.",
        matchedSkills: skillsMentioned.filter(s => /sql|python|java|node/i.test(s)).length ? skillsMentioned.filter(s => /sql|python|java|node/i.test(s)) : ["SQL", "Python"],
        missingSkills: ["Apache Kafka", "Kubernetes", "Database Sharding"],
        learningPath: [
          "Study query optimization and execution plans",
          "Build event-driven distributed message consumers",
          "Practice concurrent programming and locks"
        ]
      },
      {
        role: "Cloud DevOps & Platform Associate",
        match: 76,
        description: "Automate build pipelines, orchestrate infrastructure as code, and monitor production reliability.",
        matchedSkills: skillsMentioned.filter(s => /aws|docker|linux|git/i.test(s)).length ? skillsMentioned.filter(s => /aws|docker|linux|git/i.test(s)) : ["Git", "Linux Basics"],
        missingSkills: ["Terraform", "Kubernetes", "Prometheus & Grafana"],
        learningPath: [
          "Configure automated GitHub Actions workflows",
          "Master multi-stage Docker builds",
          "Earn AWS Certified Solutions Architect Associate"
        ]
      },
      {
        role: "Technical Solutions Consultant",
        match: 71,
        description: "Bridge customer business requirements with technical delivery and enterprise system integrations.",
        matchedSkills: primary.slice(0, 2),
        missingSkills: ["System Integration", "REST/GraphQL APIs", "Client Communication"],
        learningPath: [
          "Practice architectural technical presentations",
          "Analyze enterprise case studies and SLAs",
          "Build proof-of-concept integrations"
        ]
      }
    ]);
  }

  // 2. ATS Scanner
  if (sysLower.includes("ats analyzer")) {
    return JSON.stringify({
      score: 82,
      verdict: "Strong Candidate Profile — High ATS Pass Rate",
      strengths: [
        "Well-defined technical skill stack clearly aligned with software engineering roles",
        "Clear project descriptions highlighting technologies used",
        "Standard chronological education and experience layout"
      ],
      weaknesses: [
        "Bullet points need more quantifiable metrics (e.g. % performance increase, users served)",
        "Missing keywords for automated testing and cloud deployment pipelines",
        "Action verbs in experience sections can be more impactful (use 'Architected', 'Spearheaded' instead of 'Worked on')"
      ],
      keywordsFound: ["JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs", "Agile"],
      keywordsMissing: ["Docker", "CI/CD", "Jest/Cypress", "Unit Testing", "AWS", "Performance Optimization"],
      improvements: [
        "Quantify achievement in every project: replace 'built an app' with 'developed app reducing latency by 35%'",
        "Incorporate explicit mentions of unit test coverage and git collaboration",
        "Add direct hyperlinks to live demo deployments and public GitHub repositories",
        "Ensure consistent date formatting (e.g. 'MMM YYYY - MMM YYYY') throughout"
      ],
      formattingIssues: [
        "Ensure single-column layout for ATS parser compatibility",
        "Avoid graphics or icon fonts for bullet points"
      ]
    });
  }

  // 3. Resume Builder
  if (sysLower.includes("resume writer") && sysLower.includes("ats-optimised")) {
    let payload = {};
    try { payload = JSON.parse(userMsg); } catch (_) {}
    const p = payload.personal || {};

    return JSON.stringify({
      summary: `Proactive and detail-oriented Software Engineer with a solid foundation in modern web technologies and computer science principles. Experienced in engineering reliable web applications, designing RESTful APIs, and collaborating in agile team environments. Committed to continuous learning, clean code practices, and delivering measurable impact.`,
      experience: (payload.experience && payload.experience.length) ? payload.experience.map(exp => ({
        title: exp.title || "Software Engineering Intern",
        company: exp.company || "Tech Innovations Ltd",
        duration: exp.duration || "Jan 2024 - Present",
        bullets: [
          `Engineered responsive, accessible front-end interfaces utilizing modern frameworks, elevating user engagement by 28%.`,
          `Designed and integrated scalable REST API endpoints, reducing average response latency by 40ms across 15k+ daily requests.`,
          `Collaborated in cross-functional agile sprints, participating in code reviews, automated CI/CD releases, and unit testing.`
        ]
      })) : [
        {
          title: "Software Engineering Intern",
          company: "NextGen Technologies",
          duration: "May 2024 - Jul 2024",
          bullets: [
            "Architected full-stack modules using React and Node.js, boosting workflow completion rates by 30%.",
            "Implemented state management and normalized database schemas for fast real-time synchronization.",
            "Spearheaded comprehensive unit test coverage, cutting regression bugs by 22% prior to production."
          ]
        }
      ],
      projects: (payload.projects && payload.projects.length) ? payload.projects.map(prj => ({
        name: prj.name || "Placement Readiness Web Application",
        tech: prj.tech || "React, Node.js, PostgreSQL",
        bullets: [
          `Developed end-to-end full-stack web application with secure authentication and real-time interactive assessment features.`,
          `Optimized client-side bundle size and database queries, achieving a 98+ Google Lighthouse performance score.`,
          `Deployed production build on cloud infrastructure with automated CI/CD pipelines and monitoring.`
        ]
      })) : [
        {
          name: "PlacementAI Analytics Portal",
          tech: "React, Node.js, MongoDB",
          bullets: [
            "Engineered predictive placement evaluation dashboard providing personalized roadmaps and interview analytics.",
            "Integrated asynchronous task pipelines and caching layers to support concurrent student test sessions."
          ]
        }
      ],
      skills: {
        technical: payload.skills?.technical?.length ? payload.skills.technical : ["React", "JavaScript", "TypeScript", "Node.js", "Express", "SQL"],
        soft: payload.skills?.soft?.length ? payload.skills.soft : ["Problem Solving", "Agile Collaboration", "Technical Communication", "Adaptability"],
        languages: payload.skills?.languages?.length ? payload.skills.languages : ["English", "Hindi"],
        tools: payload.skills?.tools?.length ? payload.skills.tools : ["Git", "GitHub", "Docker", "VS Code", "Postman"]
      }
    });
  }

  // 4. Company Guide
  if (sysLower.includes("tech placement expert") && sysLower.includes("mustlearnskills")) {
    const coMatch = userMsg.match(/Company:\s*(.+)/i);
    const coName = coMatch ? coMatch[1].trim() : "Target Company";

    return JSON.stringify({
      overview: `${coName} is a top tier technology employer known for rigorous hiring standards, robust training programs, and extensive career growth opportunities for engineering graduates.`,
      mustLearnSkills: [
        { name: "Data Structures & Algorithms", why: "Core foundation of online assessments and live technical problem-solving rounds.", level: "MUST" },
        { name: "Object-Oriented Programming (OOP)", why: "Key concepts (Inheritance, Polymorphism, Abstraction) tested in technical interviews.", level: "MUST" },
        { name: "SQL & Relational Databases", why: "Essential for data modeling, querying, and backend problem questions.", level: "MUST" },
        { name: "Operating Systems & Networking", why: "Core CS topics frequently asked in technical screenings.", level: "GOOD" },
        { name: "System Design & Architecture", why: "Differentiator for high-package digital/product engineer roles.", level: "GOOD" },
        { name: "Cloud & Containerization (AWS/Docker)", why: "Gives significant competitive advantage during final evaluations.", level: "BONUS" }
      ],
      interviewRounds: [
        { round: "Round 1: National Qualifier / Online Assessment", description: "Timed test covering Quantitative Aptitude, Logical Reasoning, Verbal Ability, and 2 hands-on coding challenges." },
        { round: "Round 2: Technical Interview 1", description: "DSA problem solving on code editor, project deep dive, and core computer science fundamentals." },
        { round: "Round 3: Technical & System Discussion", description: "Scenario-based problem solving, database schema design, and technical problem analysis." },
        { round: "Round 4: HR & Leadership Fit", description: "Assessment of communication skills, behavioral STAR questions, cultural fit, and relocation flexibility." }
      ],
      topicsToStudy: [
        "Arrays, Strings & Two Pointers",
        "Binary Trees & BST Traversals",
        "Dynamic Programming (1D & 2D)",
        "SQL Joins & Group By Queries",
        "Deadlocks & Process Synchronization",
        "REST API Design Principles",
        "STAR Behavioral Stories"
      ],
      insiderTips: [
        "Practice coding in standard IDLE / raw text editors without autocompletion.",
        "Be ready to explain the Big-O time and space complexity for every solution you suggest.",
        "Know your resume projects inside out — expect questions on database schema and error handling.",
        "Always articulate your thought process aloud before jumping straight into code."
      ],
      salaryRanges: [
        { role: "Standard SDE Track", ctc: "4.0 - 5.5 LPA" },
        { role: "Digital / Specialized Track", ctc: "7.5 - 9.5 LPA" },
        { role: "Prime / Product Engineering Track", ctc: "11.0 - 16.0 LPA" }
      ],
      culture: ["Continuous Learning", "Team Collaboration", "Global Delivery", "Engineering Innovation"]
    });
  }

  // 5. Roadmap Planner
  if (sysLower.includes("placement coach") && sysLower.includes("phases")) {
    const coMatch = userMsg.match(/Company:([^ ]+)/i);
    const co = coMatch ? coMatch[1] : "Target Placement";

    return JSON.stringify({
      summary: `Comprehensive preparation roadmap tailored to crack technical and aptitude rounds at ${co}.`,
      totalWeeks: 8,
      totalHours: 160,
      dailyHours: 3,
      phases: [
        {
          name: "Phase 1: Core Fundamentals & Aptitude",
          icon: "⚡",
          color: "#00d4ff",
          weekRange: "Weeks 1-2",
          weeks: [
            {
              week: 1,
              title: "Aptitude Fundamentals & Array/String DSA",
              tasks: [
                "Solve 25 quantitative aptitude questions daily (Percentages, Profit & Loss)",
                "Master two-pointer and sliding window coding patterns",
                "Review Big-O time and space complexities",
                "Practice core OOP principles in your primary language"
              ],
              weeklyGoal: "Achieve 85% accuracy in timed basic aptitude and array challenges."
            },
            {
              week: 2,
              title: "Linked Lists, Stacks & Queues",
              tasks: [
                "Implement Singly, Doubly Linked Lists and reverse operations",
                "Solve classic stack challenges (Valid Parentheses, Min Stack)",
                "Study Logical Reasoning (Syllogisms, Blood Relations)",
                "Write basic SQL queries with JOINs and aggregate functions"
              ],
              weeklyGoal: "Master all linear data structures and foundational SQL queries."
            }
          ]
        },
        {
          name: "Phase 2: Non-Linear Structures & Core CS",
          icon: "🧠",
          color: "#7c3aed",
          weekRange: "Weeks 3-5",
          weeks: [
            {
              week: 3,
              title: "Binary Trees & Binary Search Trees",
              tasks: [
                "Master BFS/DFS traversals and lowest common ancestor",
                "Solve top 15 BST insertion, deletion, and validation problems",
                "Revise Operating Systems (Processes, Threads, Semaphores)",
                "Prepare concise elevator pitch and project summary"
              ],
              weeklyGoal: "Confidently solve medium tree problems within 25 minutes."
            },
            {
              week: 4,
              title: "Graphs & Dynamic Programming",
              tasks: [
                "Implement Graph representations, BFS, DFS, and topological sort",
                "Solve 0/1 Knapsack, Coin Change, and LCS DP patterns",
                "Review Computer Networks (TCP 3-way handshake, DNS, HTTP/S)",
                "Practice timed company-specific coding tests"
              ],
              weeklyGoal: "Conquer graph traversals and standard 1D/2D DP problems."
            },
            {
              week: 5,
              title: "Resume Projects & System Design",
              tasks: [
                "Document architecture diagrams and API contracts for projects",
                "Prepare answers for technical trade-offs and bottleneck fixes",
                "Practice database normalization and indexing questions",
                "Conduct peer mock interview for project walkthrough"
              ],
              weeklyGoal: "Defend every line of code and architectural decision on resume."
            }
          ]
        },
        {
          name: "Phase 3: Company Mock Drills & Final Polish",
          icon: "🎯",
          color: "#10b981",
          weekRange: "Weeks 6-8",
          weeks: [
            {
              week: 6,
              title: "Company Past Papers & Timed OA Drills",
              tasks: [
                "Solve 2 full-length past company placement papers",
                "Review tricky verbal ability and reading comprehension rules",
                "Practice whiteboarding solutions without IDE autocompletion",
                "Identify and plug remaining algorithmic weak points"
              ],
              weeklyGoal: "Complete timed assessments with >90% benchmark score."
            },
            {
              week: 7,
              title: "Mock Interviews & Behavioral STAR Prep",
              tasks: [
                "Simulate 3 technical interviews focusing on communication",
                "Draft STAR behavioral responses for leadership and conflict scenarios",
                "Review company recent projects, culture, and business values",
                "Polish live coding presentation and question-asking etiquette"
              ],
              weeklyGoal: "Seamless verbal articulation and interview presence."
            },
            {
              week: 8,
              title: "Final Rehearsal & Peak Confidence",
              tasks: [
                "Review consolidated algorithmic cheat sheet and formulas",
                "Perform light mock assessment and verify hardware/camera setup",
                "Get adequate rest and maintain peak mental readiness",
                "Enter placement drive with complete confidence and calm"
              ],
              weeklyGoal: "Peak mental, technical, and psychological readiness."
            }
          ]
        }
      ],
      interviewRounds: [
        {
          round: "Online Assessment (OA)",
          description: "Timed aptitude and coding challenge eliminating 70% candidates.",
          howToPrepare: "Focus on speed, accurate edge case handling, and time budgeting.",
          keyTopics: ["Arrays & Strings", "Number Theory", "Binary Search"]
        },
        {
          round: "Technical Interview 1 & 2",
          description: "Live coding with interviewer, project grilling, and core CS fundamentals.",
          howToPrepare: "Think aloud, discuss complexity before coding, test code manually.",
          keyTopics: ["Trees/Graphs", "SQL Queries", "OOP Design Patterns"]
        },
        {
          round: "HR & Leadership Assessment",
          description: "Evaluation of long-term fit, communication clarity, and situational maturity.",
          howToPrepare: "Structure answers with the STAR technique and research company ethos.",
          keyTopics: ["Conflict Resolution", "Career Goals", "Team Collaboration"]
        }
      ],
      dailySchedule: [
        { day: "Monday", focus: "DSA Problem Solving (Arrays/Strings/Pointers)", hours: "3 hrs" },
        { day: "Tuesday", focus: "Quantitative Aptitude & Logical Drills", hours: "2.5 hrs" },
        { day: "Wednesday", focus: "Trees, Graphs & Dynamic Programming", hours: "3 hrs" },
        { day: "Thursday", focus: "Core CS: DBMS, OS & Computer Networks", hours: "2.5 hrs" },
        { day: "Friday", focus: "Resume Projects & System Design Deep Dive", hours: "3 hrs" },
        { day: "Saturday", focus: "Full-Length Timed Placement Simulation", hours: "3.5 hrs" },
        { day: "Sunday", focus: "Weekly Review, Mock Interview & Flashcards", hours: "2 hrs" }
      ],
      finalWeekPlan: [
        "Review short notes and formula cheat-sheets rather than learning new topics",
        "Test web camera, microphone, internet stability, and coding IDE",
        "Rehearse your 60-second professional self-introduction",
        "Ensure resume copies and formal attire are prepared in advance",
        "Maintain 8 hours of sleep and high hydration before test day"
      ],
      doNotForget: [
        "Always explain your brute force thought process before coding optimal solutions",
        "Clarify input constraints and boundary cases (null, negatives, large values)",
        "Write clean, readable variable and method names in live interviews",
        "Prepare 2 intelligent questions to ask the interviewer at the end"
      ]
    });
  }

  // 6. Mock Interview Questions
  if (sysLower.includes("interviewer at") && sysLower.includes("interview questions")) {
    return JSON.stringify([
      {
        question: "Can you walk me through the architecture of a major technical project you built, and explain why you chose the specific tech stack?",
        type: "Technical",
        hint: "Highlight architectural trade-offs, state management, and backend database decisions.",
        difficulty: "Medium"
      },
      {
        question: "Given an unsorted array of integers, how would you find two numbers that sum up to a specific target in O(n) time complexity?",
        type: "Coding",
        hint: "Consider using a Hash Map to store seen complements while iterating through the array.",
        difficulty: "Easy"
      },
      {
        question: "Explain the ACID properties in database management systems and why they are critical for enterprise transactional systems.",
        type: "Technical",
        hint: "Define Atomicity, Consistency, Isolation, and Durability with a concrete bank transfer example.",
        difficulty: "Medium"
      },
      {
        question: "Tell me about a challenging bug or performance bottleneck you encountered during development and how you systematically debugged it.",
        type: "Technical",
        hint: "Walk through observation, profiling, hypothesis testing, and the verified resolution.",
        difficulty: "Medium"
      },
      {
        question: "Describe a situation where project requirements changed close to a deadline. How did you prioritize and execute?",
        type: "Behavioural",
        hint: "Use the STAR method: explain the Situation, Task, your proactive Action, and the successful Result.",
        difficulty: "Easy"
      },
      {
        question: "What happens under the hood when a user types a URL into a browser and presses Enter?",
        type: "Technical",
        hint: "Cover DNS lookup, TCP handshake, TLS negotiation, HTTP request/response, and DOM rendering.",
        difficulty: "Hard"
      }
    ]);
  }

  // 7. Mock Interview Evaluation
  if (sysLower.includes("interviewer at") && sysLower.includes("evaluate answer")) {
    const ans = userMsg.replace(/^Q:[^\n]+\nAnswer:\s*/i, "").trim();
    const len = ans.length;
    let score = len > 200 ? 9 : len > 80 ? 8 : len > 30 ? 6 : 4;
    let verdict = score >= 8 ? "Excellent" : score >= 6 ? "Good" : "Average";

    return JSON.stringify({
      score: score,
      verdict: verdict,
      feedback: len > 80
        ? "Solid explanation! You conveyed technical understanding clearly and structured your points well. To improve further, include specific performance metrics and mention edge-case handling."
        : "You touched on the correct general concept, but the answer would benefit from greater technical depth, concrete examples, and structured delivery.",
      idealAnswer: "An ideal response begins with a clear definition, walks through the practical mechanism or algorithm step-by-step, addresses boundary conditions, and concludes with real-world architectural implications."
    });
  }

  // 8. Aptitude Quiz
  if (sysLower.includes("aptitude mcq")) {
    return JSON.stringify([
      {
        question: "A train running at 60 km/hr crosses a platform 200 m long in 27 seconds. What is the length of the train?",
        options: ["250 metres", "200 metres", "300 metres", "150 metres"],
        correct: 0,
        explanation: "Speed in m/s = 60 * (5/18) = 50/3 m/s. Total distance = Speed * Time = (50/3) * 27 = 450 m. Length of train = 450 - 200 = 250 m.",
        category: "Quantitative Aptitude",
        difficulty: "Easy"
      },
      {
        question: "If 'POND' is coded as 'RSTL', how is 'HEAR' coded in that language?",
        options: ["JIGZ", "JGHZ", "JJGZ", "JGIZ"],
        correct: 1,
        explanation: "Each letter is shifted forward: P(+2)=R, O(+4)=S, N(+6)=T, D(+8)=L. For HEAR: H(+2)=J, E(+4)=I... wait: H(+2)->J, E(+2)->G, A(+7)->H, R(+8)->Z => JGHZ.",
        category: "Logical Reasoning",
        difficulty: "Medium"
      },
      {
        question: "A can do a work in 12 days and B in 16 days. They worked together for 4 days. What fraction of work is left?",
        options: ["5/12", "7/12", "1/3", "1/4"],
        correct: 0,
        explanation: "A's 1-day work = 1/12, B's = 1/16. Together 1 day = (4+3)/48 = 7/48. In 4 days = 4 * 7/48 = 7/12. Remaining work = 1 - 7/12 = 5/12.",
        category: "Quantitative Aptitude",
        difficulty: "Medium"
      },
      {
        question: "Choose the word that is most nearly OPPOSITE in meaning to 'PRUDENT':",
        options: ["Cautious", "Reckless", "Judicious", "Frugal"],
        correct: 1,
        explanation: "'Prudent' means acting with care and forethought. 'Reckless' is the opposite, meaning heedless of danger or consequences.",
        category: "Verbal Ability",
        difficulty: "Easy"
      },
      {
        question: "In how many different ways can the letters of the word 'LEADING' be arranged so that the vowels always come together?",
        options: ["360", "480", "720", "5040"],
        correct: 2,
        explanation: "Vowels in LEADING are E, A, I (3 vowels). Treat (EAI) as 1 unit. Total units = 4 consonants + 1 unit = 5 units => 5! = 120. The 3 vowels can be arranged among themselves in 3! = 6 ways. Total = 120 * 6 = 720.",
        category: "Quantitative Aptitude",
        difficulty: "Hard"
      },
      {
        question: "Point A is 10m West of Point B. Point C is 10m North of Point B. In which direction is Point A with respect to Point C?",
        options: ["North-East", "South-West", "North-West", "South-East"],
        correct: 1,
        explanation: "Point C is North of B, and Point A is West of B. Looking from C to A, A is to the South and to the West, which is South-West.",
        category: "Logical Reasoning",
        difficulty: "Easy"
      },
      {
        question: "The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?",
        options: ["4 years", "8 years", "10 years", "2 years"],
        correct: 0,
        explanation: "Let ages be x, x+3, x+6, x+9, x+12. Sum = 5x + 30 = 50 => 5x = 20 => x = 4 years.",
        category: "Quantitative Aptitude",
        difficulty: "Easy"
      },
      {
        question: "Find the missing number in the series: 4, 9, 25, 49, 121, ___",
        options: ["144", "169", "196", "225"],
        correct: 1,
        explanation: "The series consists of squares of prime numbers: 2^2=4, 3^2=9, 5^2=25, 7^2=49, 11^2=121. The next prime number is 13, so 13^2 = 169.",
        category: "Logical Reasoning",
        difficulty: "Medium"
      }
    ]);
  }

  // Fallback generic object
  return JSON.stringify({ message: "Success", timestamp: Date.now() });
}
