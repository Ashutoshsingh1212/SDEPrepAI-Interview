import "./env.js";

/* =========================================================
   DOMAIN CONFIGURATION REGISTRY (WITH 2 LEETCODE MEDIUM CHALLENGES)
========================================================= */

export const DOMAINS_CONFIG = {
  react: {
    domainName: "Software Engineering",
    roleName: "React Frontend Developer",
    skills: ["React", "JavaScript", "Hooks", "State Management", "Virtual DOM", "CSS", "Performance Optimization"],
    codingLanguage: "javascript",
    codingChallenges: [
      {
        title: "LeetCode Medium: Optimized useDebounce & Typeahead Hook",
        description: "Implement a custom hook `useDebounce(value, delay)` or debounce utility that delays updating the debounced value until after `delay` ms have elapsed without changes. Handle timer cleanup on unmount and edge cases.",
        starterCode: `function useDebounce(value, delay) {
  // Write your optimized implementation here
  
}

// Or implement standalone debounce function
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
        examples: [
          { input: "useDebounce('search', 400)", output: "Updates value 400ms after user stops typing" }
        ],
        constraints: ["Zero memory leaks", "Cancels pending executions on fast re-renders"]
      },
      {
        title: "LeetCode Medium: Deep Flatten & Transform State Object",
        description: "Implement a function `flattenState(obj)` that flattens a deeply nested state object into single-depth key-value pairs separated by dots (e.g. {'user': {'name': 'Alex', 'geo': {'lat': 12}}} -> {'user.name': 'Alex', 'user.geo.lat': 12}). Handle nested arrays and primitive values.",
        starterCode: `function flattenState(obj, prefix = "", res = {}) {
  // Write your recursive or iterative flattening algorithm here
  
  return res;
}`,
        examples: [
          { input: "{ a: { b: 1, c: [2, 3] } }", output: "{ 'a.b': 1, 'a.c.0': 2, 'a.c.1': 3 }" }
        ],
        constraints: ["Handles nested objects and arrays", "O(N) time complexity where N is total properties"]
      }
    ],
    demoQuestions: [
      "Tell me about yourself and your frontend engineering experience with React.",
      "What are your key strengths as a React developer, and what is one technical area you are actively improving?",
      "Walk me through a complex React project you built. What was the architecture and how did you manage application state?",
      "Why did you choose your specific state management solution over alternative options in that project?",
      "What is the difference between useState and useRef, and when would you choose useRef for non-DOM use cases?",
      "How does React's reconciliation algorithm and Virtual DOM diffing work under the hood?",
      "Explain the exact difference between useMemo and useCallback, and what causes unnecessary component re-renders?",
      "CODING CHALLENGE 1 (LeetCode Medium): Implement an optimized debounce utility or custom hook that avoids race conditions in search inputs.",
      "CODING CHALLENGE 2 (LeetCode Medium): Implement a deep state flattening utility that converts nested state objects into dot-notated paths in O(N) time.",
      "How do you handle error boundaries, component suspension, and code splitting with React.lazy in production?",
      "Describe a challenging production bug you encountered in frontend rendering and how you debugged it step by step."
    ]
  },

  python: {
    domainName: "Software Engineering",
    roleName: "Python Software Engineer",
    skills: ["Python", "OOP", "DSA", "Generators", "Decorators", "Memory Management", "REST APIs"],
    codingLanguage: "python",
    codingChallenges: [
      {
        title: "LeetCode Medium 3: Longest Substring Without Repeating Characters",
        description: "Given a string `s`, find the length of the longest substring without repeating characters using an optimal sliding window approach in O(n) time.",
        starterCode: `def length_of_longest_substring(s: str) -> int:
    # Write your optimal O(n) sliding window solution here
    char_map = {}
    left = 0
    max_len = 0
    
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
        
    return max_len`,
        examples: [
          { input: "s = 'abcabcbb'", output: "3 ('abc')" },
          { input: "s = 'pwwkew'", output: "3 ('wke')" }
        ],
        constraints: ["0 <= s.length <= 5 * 10^4", "Must run in O(n) time and O(min(m, n)) space"]
      },
      {
        title: "LeetCode Medium 15: 3Sum (Unique Triplets)",
        description: "Given an integer array `nums`, return all the unique triplets `[nums[i], nums[j], nums[k]]` such that `i != j, i != k, j != k` and `nums[i] + nums[j] + nums[k] == 0` without duplicates in O(n^2) time.",
        starterCode: `def three_sum(nums: list[int]) -> list[list[int]]:
    # Write your optimal two-pointer solution here
    nums.sort()
    result = []
    
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
                
    return result`,
        examples: [
          { input: "nums = [-1, 0, 1, 2, -1, -4]", output: "[[-1, -1, 2], [-1, 0, 1]]" }
        ],
        constraints: ["3 <= nums.length <= 3000", "No duplicate triplets in output"]
      }
    ],
    demoQuestions: [
      "Tell me about yourself and your background in building software with Python.",
      "What motivated you to specialize in Python development and backend engineering?",
      "Describe the most complex Python project or system you have architected. What problem did it solve?",
      "What architectural challenges did you face in that project regarding scalability or database query performance?",
      "What is the difference between a list and a tuple in Python, and how does memory allocation differ between them?",
      "Explain Python generators and the `yield` keyword. How do they enable memory-efficient stream processing?",
      "What are Python decorators, and how would you build a custom decorator to log execution time or authenticate requests?",
      "CODING CHALLENGE 1 (LeetCode Medium): Solve 'Longest Substring Without Repeating Characters' using an optimal sliding window in O(n) time.",
      "CODING CHALLENGE 2 (LeetCode Medium): Solve '3Sum' to find all unique zero-sum triplets in O(n^2) time using two pointers.",
      "Suppose a production Python API is experiencing high latency under heavy load. How do you profile and eliminate bottlenecks?",
      "Tell me about a time you had a technical disagreement with a teammate regarding code design or architecture. How did you resolve it?"
    ]
  },

  node: {
    domainName: "Software Engineering",
    roleName: "Node.js Backend Developer",
    skills: ["Node.js", "Express.js", "Event Loop", "Async I/O", "REST APIs", "SQL / NoSQL", "Authentication"],
    codingLanguage: "javascript",
    codingChallenges: [
      {
        title: "LeetCode Medium: Sliding Window Rate Limiter",
        description: "Implement a sliding window rate limiter class `RateLimiter` with `isAllowed(userId)` that restricts requests to at most `limit` within a sliding window of `windowMs` milliseconds with memory cleanup.",
        starterCode: `class RateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.userLogs = new Map();
  }

  isAllowed(userId) {
    const now = Date.now();
    if (!this.userLogs.has(userId)) {
      this.userLogs.set(userId, []);
    }
    
    // Filter timestamps within window
    const timestamps = this.userLogs.get(userId).filter(t => now - t < this.windowMs);
    
    if (timestamps.length < this.limit) {
      timestamps.push(now);
      this.userLogs.set(userId, timestamps);
      return true;
    }
    
    this.userLogs.set(userId, timestamps);
    return false;
  }
}`,
        examples: [
          { input: "isAllowed('user1') with limit=3, window=1000", output: "true for first 3 requests, false on 4th within 1s" }
        ],
        constraints: ["Handles high concurrency", "Thread safe in async event loop"]
      },
      {
        title: "LeetCode Medium 2636: Promise Pool / Async Concurrency Queue",
        description: "Given an array of asynchronous functions `functions` and a pool limit `n`, return an asynchronous function `promisePool` that executes all functions with at most `n` running concurrently.",
        starterCode: `async function promisePool(functions, n) {
  let i = 0;
  async function next() {
    if (i >= functions.length) return;
    const fn = functions[i++];
    await fn();
    await next();
  }
  return Promise.all(Array.from({ length: Math.min(n, functions.length) }, next));
}`,
        examples: [
          { input: "functions = [() => sleep(300), () => sleep(400), () => sleep(200)], n = 2", output: "Runs with max 2 concurrent promises" }
        ],
        constraints: ["Resolves only when all promises complete", "Preserves error handling"]
      }
    ],
    demoQuestions: [
      "Tell me about your background as a backend engineer and your experience with Node.js.",
      "What are your core technical strengths in backend design, and what excites you about this role?",
      "Walk me through a production Node.js service or microservice you built. What was the architecture and database strategy?",
      "How did you handle authentication, data validation, and error propagation across that service?",
      "Explain the Node.js Event Loop phases (Timers, Pending I/O, Poll, Check, Close) and how non-blocking I/O works.",
      "What is the difference between process.nextTick(), setImmediate(), and setTimeout() in Node.js?",
      "What are Express middleware functions, and how do you design custom middlewares for error handling and JWT verification?",
      "CODING CHALLENGE 1 (LeetCode Medium): Implement an in-memory Sliding Window Rate Limiter for API clients.",
      "CODING CHALLENGE 2 (LeetCode Medium): Implement a Promise Pool / Async Task Queue with a strict concurrency limit.",
      "How do you design database indexing, connection pooling, and caching with Redis for high-concurrency Node.js APIs?",
      "Describe a situation where a Node.js production service crashed due to memory leak or unhandled rejection. How did you fix it?"
    ]
  },

  java: {
    domainName: "Software Engineering",
    roleName: "Java & Spring Boot Engineer",
    skills: ["Java", "Spring Boot", "Dependency Injection", "Multithreading", "Hibernate / JPA", "REST APIs", "Microservices"],
    codingLanguage: "java",
    codingChallenges: [
      {
        title: "LeetCode Medium 3: Longest Substring Without Repeating Characters",
        description: "Given a string `s`, find the length of the longest substring without repeating characters using an optimal sliding window with a `HashMap` or `HashSet` in Java.",
        starterCode: `import java.util.*;

public class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c)) {
                left = Math.max(left, map.get(c) + 1);
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
        examples: [
          { input: "s = 'abcabcbb'", output: "3 ('abc')" }
        ],
        constraints: ["O(n) time complexity", "O(min(m, n)) space complexity"]
      },
      {
        title: "LeetCode Medium 560: Subarray Sum Equals K",
        description: "Given an array of integers `nums` and an integer `k`, return the total number of continuous subarrays whose sum equals `k` using an optimal Prefix Sum + `HashMap` in O(n) time.",
        starterCode: `import java.util.*;

public class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, 1);
        int count = 0, sum = 0;
        
        for (int n : nums) {
            sum += n;
            if (map.containsKey(sum - k)) {
                count += map.get(sum - k);
            }
            map.put(sum, map.getOrDefault(sum, 0) + 1);
        }
        return count;
    }
}`,
        examples: [
          { input: "nums = [1, 1, 1], k = 2", output: "2" },
          { input: "nums = [1, 2, 3], k = 3", output: "2" }
        ],
        constraints: ["1 <= nums.length <= 2 * 10^4", "Must run in O(n) time using HashMap"]
      }
    ],
    demoQuestions: [
      "Tell me about your software engineering experience with Java and enterprise Spring Boot applications.",
      "What principles do you follow when writing clean, maintainable, and object-oriented Java code?",
      "Walk me through an enterprise Java / Spring Boot application you developed. What was the microservices architecture?",
      "How did you structure database transactions, isolation levels, and JPA/Hibernate mapping in that application?",
      "Explain Inversion of Control (IoC) and Dependency Injection in Spring Framework. What are the different bean scopes?",
      "What is the difference between @Component, @Service, and @Repository annotations in Spring Boot?",
      "How does multithreading work in Java? Explain synchronized, volatile, and CompletableFuture for asynchronous execution.",
      "CODING CHALLENGE 1 (LeetCode Medium): Find the length of the longest substring without repeating characters in O(n) time.",
      "CODING CHALLENGE 2 (LeetCode Medium): Find the total number of continuous subarrays whose sum equals k in O(n) time.",
      "How do you implement Spring Security with JWT tokens, role-based access control (RBAC), and filter chains?",
      "Describe how you would troubleshoot high JVM CPU utilization or OutOfMemoryError in a production Spring Boot service."
    ]
  },

  ai: {
    domainName: "AI / Machine Learning",
    roleName: "AI & Generative AI Specialist",
    skills: ["Python", "PyTorch", "LLMs", "RAG", "Transformers", "Prompt Engineering", "Embeddings", "MLOps"],
    codingLanguage: "python",
    codingChallenges: [
      {
        title: "LeetCode Medium: Cosine Similarity & Top-K Vector Retrieval",
        description: "Implement a function `top_k_similar(query_vector, document_vectors, k)` that computes cosine similarity and returns the indices of the top-k most relevant vectors.",
        starterCode: `import math

def top_k_similar(query_vec: list[float], doc_vecs: list[list[float]], k: int) -> list[int]:
    def cosine(v1, v2):
        dot = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        return dot / (norm1 * norm2) if norm1 and norm2 else 0.0

    scores = [(i, cosine(query_vec, doc)) for i, doc in enumerate(doc_vecs)]
    scores.sort(key=lambda x: x[1], reverse=True)
    return [idx for idx, score in scores[:k]]`,
        examples: [
          { input: "query_vec = [1.0, 0.0], doc_vecs = [[1.0, 0.0], [0.0, 1.0]], k = 1", output: "[0]" }
        ],
        constraints: ["Zero-division safe", "Optimal top-k extraction"]
      },
      {
        title: "LeetCode Medium: Scaled Dot-Product Self-Attention",
        description: "Implement the scaled dot-product attention calculation in pure Python: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V.",
        starterCode: `import math

def scaled_dot_product_attention(Q: list[list[float]], K: list[list[float]], V: list[list[float]]) -> list[list[float]]:
    # Compute Q * K^T / sqrt(d_k), apply row-wise softmax, then multiply by V
    d_k = len(Q[0])
    
    # 1. Matmul Q and K^T
    scores = []
    for q_row in Q:
        row_scores = []
        for k_row in K:
            score = sum(q * k for q, k in zip(q_row, k_row)) / math.sqrt(d_k)
            row_scores.append(score)
        scores.append(row_scores)
        
    # 2. Softmax
    weights = []
    for row in scores:
        exp_row = [math.exp(s) for s in row]
        sum_exp = sum(exp_row)
        weights.append([e / sum_exp for e in exp_row])
        
    # 3. Matmul weights and V
    output = []
    for w_row in weights:
        v_out = [0.0] * len(V[0])
        for w, v_row in zip(w_row, V):
            for col in range(len(V[0])):
                v_out[col] += w * v_row[col]
        output.append(v_out)
        
    return output`,
        examples: [
          { input: "Q, K, V matrices of dimension 2x2", output: "Softmax weighted output matrix 2x2" }
        ],
        constraints: ["Numerical stability", "Correct dimension alignment"]
      }
    ],
    demoQuestions: [
      "Tell me about yourself and your experience in AI, Machine Learning, and Generative AI systems.",
      "What are the most impactful AI techniques or foundation models you have worked with recently?",
      "Describe an end-to-end AI or RAG application you built. How did you design the retrieval and generation pipeline?",
      "How did you handle chunking strategies, embedding models, vector database indexing, and hallucination reduction in that system?",
      "Explain the Transformer architecture and the Self-Attention mechanism (Q, K, V). Why does multi-head attention work so well?",
      "What is the difference between Fine-Tuning and Retrieval-Augmented Generation (RAG)? When would you use each?",
      "Explain the trade-offs between precision, recall, latency, and context window size in production LLM inference.",
      "CODING CHALLENGE 1 (LeetCode Medium): Implement vector cosine similarity and top-K nearest neighbor retrieval in Python.",
      "CODING CHALLENGE 2 (LeetCode Medium): Implement scaled dot-product self-attention mechanism from scratch in Python.",
      "How do you implement evaluation metrics for Generative AI (e.g. RAGAS, BLEU, ROUGE, LLM-as-a-judge)?",
      "Describe how you would optimize token costs, latency, and caching in a high-volume LLM application."
    ]
  },

  data: {
    domainName: "Data Science & Analytics",
    roleName: "Data Scientist & Analytics Engineer",
    skills: ["Python", "SQL", "Statistics", "Pandas", "Data Modeling", "Machine Learning", "ETL"],
    codingLanguage: "python",
    codingChallenges: [
      {
        title: "LeetCode Medium 49: Group Anagrams",
        description: "Given an array of strings `strs`, group the anagrams together in O(N * K) time using character frequency counts as hash map keys.",
        starterCode: `from collections import defaultdict

def group_anagrams(strs: list[str]) -> list[list[str]]:
    groups = defaultdict(list)
    for s in strs:
        count = [0] * 26
        for char in s:
            count[ord(char) - ord('a')] += 1
        groups[tuple(count)].append(s)
    return list(groups.values())`,
        examples: [
          { input: "strs = ['eat','tea','tan','ate','nat','bat']", output: "[['bat'],['nat','tan'],['ate','eat','tea']]" }
        ],
        constraints: ["1 <= strs.length <= 10^4", "Lowercase English letters"]
      },
      {
        title: "LeetCode Medium 523: Continuous Subarray Sum / Window Average",
        description: "Given an integer array `nums` and an integer `k`, return `true` if `nums` has a good subarray of length >= 2 whose elements sum up to a multiple of `k` in O(n) time.",
        starterCode: `def check_subarray_sum(nums: list[int], k: int) -> bool:
    remainder_map = {0: -1}
    curr_sum = 0
    
    for i, num in enumerate(nums):
        curr_sum += num
        rem = curr_sum % k
        if rem in remainder_map:
            if i - remainder_map[rem] >= 2:
                return True
        else:
            remainder_map[rem] = i
            
    return False`,
        examples: [
          { input: "nums = [23, 2, 4, 6, 7], k = 6", output: "True (subarray [2, 4] sums to 6)" }
        ],
        constraints: ["1 <= nums.length <= 10^5", "Must run in O(n) time using HashMap"]
      }
    ],
    demoQuestions: [
      "Tell me about your background in data science, analytics, and statistical modeling.",
      "What is your approach when exploring an unfamiliar dataset with missing values and skewed distributions?",
      "Walk me through an end-to-end data science or analytical project you delivered. What business impact did it achieve?",
      "What statistical models or machine learning algorithms did you evaluate, and how did you prevent overfitting?",
      "Explain the bias-variance tradeoff and how cross-validation helps choose the right model complexity.",
      "What is the difference between Type I and Type II errors in hypothesis testing, and how do you calculate p-value?",
      "How do SQL Window functions (ROW_NUMBER(), RANK(), LEAD(), LAG()) differ from standard GROUP BY aggregations?",
      "CODING CHALLENGE 1 (LeetCode Medium): Group anagrams efficiently in O(N * K) time using character frequency hash mapping.",
      "CODING CHALLENGE 2 (LeetCode Medium): Check continuous subarray sum modulo k in O(n) time using prefix remainder hashing.",
      "How do you design metrics and AB testing frameworks to measure product feature rollouts accurately?",
      "Describe how you handled a scenario where model performance degraded significantly in production."
    ]
  },

  cloud: {
    domainName: "Cloud & DevOps",
    roleName: "DevOps & Cloud Architect",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Monitoring", "Security"],
    codingLanguage: "bash",
    codingChallenges: [
      {
        title: "LeetCode Medium 347 Equivalent: Log Parser for Top-K Failed IP Traffic",
        description: "Write a function or script that parses web server access logs and returns the top K IP addresses with the highest number of failed HTTP requests (status >= 400).",
        starterCode: `from collections import Counter

def top_failed_ips(log_lines: list[str], k: int = 3) -> list[str]:
    failed = []
    for line in log_lines:
        parts = line.strip().split()
        if len(parts) >= 9:
            ip, status = parts[0], parts[-2]
            if status.isdigit() and int(status) >= 400:
                failed.append(ip)
    return [ip for ip, _ in Counter(failed).most_common(k)]`,
        examples: [
          { input: "log_lines containing '192.168.1.1 GET /api 404'", output: "['192.168.1.1']" }
        ],
        constraints: ["Linear scan O(N)", "Handles malformed log strings"]
      },
      {
        title: "LeetCode Medium 207: DAG Configuration Dependency Cycle Detector",
        description: "Given a list of microservice / Terraform module dependencies `prerequisites`, detect if there is any cyclic dependency using Topological Sort (Kahn's Algorithm).",
        starterCode: `from collections import deque

def can_deploy_all(num_services: int, prerequisites: list[list[int]]) -> bool:
    in_degree = [0] * num_services
    adj = [[] for _ in range(num_services)]
    
    for dest, src in prerequisites:
        adj[src].append(dest)
        in_degree[dest] += 1
        
    queue = deque([i for i in range(num_services) if in_degree[i] == 0])
    visited = 0
    
    while queue:
        node = queue.popleft()
        visited += 1
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    return visited == num_services`,
        examples: [
          { input: "num_services = 2, prerequisites = [[1, 0]]", output: "True" },
          { input: "num_services = 2, prerequisites = [[1, 0], [0, 1]]", output: "False (Cycle)" }
        ],
        constraints: ["O(V + E) time complexity", "Correct graph traversal"]
      }
    ],
    demoQuestions: [
      "Tell me about your experience as a DevOps / Cloud engineer and your cloud architecture background.",
      "What core principles guide your approach to Infrastructure as Code (IaC) and continuous delivery?",
      "Walk me through a production cloud infrastructure or Kubernetes cluster you designed and deployed.",
      "How did you implement zero-downtime deployments, auto-scaling, and secrets management in that environment?",
      "Explain the internal architecture of Kubernetes (API Server, etcd, Kubelet, Kube-Proxy, Controller Manager).",
      "What is the difference between a Kubernetes Deployment, StatefulSet, and DaemonSet?",
      "How does Docker networking work (Bridge, Host, Overlay), and how do you optimize Docker image layer caching?",
      "CODING CHALLENGE 1 (LeetCode Medium): Parse production web server logs to detect top-K anomalous failed IP traffic.",
      "CODING CHALLENGE 2 (LeetCode Medium): Detect cyclic dependencies across cloud modules using Topological Sort (DAG).",
      "How do you design a high-availability, multi-region failover strategy with AWS Route53, ALB, and RDS replication?",
      "Describe how you handled a major cloud production outage. What was the root cause and how did you prevent recurrence?"
    ]
  },

  security: {
    domainName: "Cybersecurity",
    roleName: "Security & AppSec Engineer",
    skills: ["OWASP Top 10", "AppSec", "Penetration Testing", "Cryptography", "OAuth2 / IAM", "Threat Modeling", "Network Security"],
    codingLanguage: "javascript",
    codingChallenges: [
      {
        title: "LeetCode Medium: Safe URL Redirect & SSRF Validator",
        description: "Implement a function `isSafeRedirect(targetUrl, allowedHosts)` that validates whether a redirect URL strictly belongs to one of the authorized domains, preventing Open Redirect and SSRF bypass attacks.",
        starterCode: `function isSafeRedirect(targetUrl, allowedHosts) {
  try {
    const url = new URL(targetUrl);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const hostname = url.hostname.toLowerCase();
    return allowedHosts.some(host => {
      const cleanHost = host.toLowerCase();
      return hostname === cleanHost || hostname.endsWith("." + cleanHost);
    });
  } catch (e) {
    return false;
  }
}`,
        examples: [
          { input: "targetUrl='https://app.example.com/dash', allowed=['example.com']", output: "true" }
        ],
        constraints: ["Rejects javascript: and data: protocols", "Blocks spoofed domain bypasses"]
      },
      {
        title: "LeetCode Medium 468: Validate IP Address (IPv4 / IPv6)",
        description: "Given a string `queryIP`, return `'IPv4'` if IP is a valid IPv4 address, `'IPv6'` if IP is a valid IPv6 address or `'Neither'` if it is not a correct IP of any type.",
        starterCode: `function validIPAddress(queryIP) {
  if (queryIP.includes(".")) {
    const parts = queryIP.split(".");
    if (parts.length !== 4) return "Neither";
    for (const p of parts) {
      if (!p || (p.length > 1 && p[0] === "0") || !/^\\d+$/.test(p)) return "Neither";
      const num = Number(p);
      if (num < 0 || num > 255) return "Neither";
    }
    return "IPv4";
  } else if (queryIP.includes(":")) {
    const parts = queryIP.split(":");
    if (parts.length !== 8) return "Neither";
    for (const p of parts) {
      if (!p || p.length > 4 || !/^[0-9a-fA-F]+$/.test(p)) return "Neither";
    }
    return "IPv6";
  }
  return "Neither";
}`,
        examples: [
          { input: "queryIP = '172.16.254.1'", output: "'IPv4'" },
          { input: "queryIP = '2001:0db8:85a3:0:0:8A2E:0370:7334'", output: "'IPv6'" }
        ],
        constraints: ["Strict string parsing without regex shortcuts", "No leading zeros in IPv4"]
      }
    ],
    demoQuestions: [
      "Tell me about your background in cybersecurity, application security, and threat analysis.",
      "What is your approach when conducting a security assessment of a modern web application?",
      "Walk me through a threat modeling or security architecture project you conducted for a production system.",
      "How did you discover, prioritize, and remediate critical security vulnerabilities in that project?",
      "Explain the OWASP Top 10 vulnerabilities and their modern defensive mitigations.",
      "How does Cross-Site Scripting (Stored, Reflected, DOM-based XSS) work, and how do CSP headers protect apps?",
      "Explain the difference between symmetric encryption and asymmetric encryption. When is each used?",
      "CODING CHALLENGE 1 (LeetCode Medium): Implement an open-redirect and SSRF-safe URL validator function.",
      "CODING CHALLENGE 2 (LeetCode Medium): Implement strict IPv4 and IPv6 format verification from scratch.",
      "How do you design and enforce Identity & Access Management (IAM) and Multi-Factor Authentication (MFA)?",
      "Describe how you investigated a simulated or real security incident and contained the breach."
    ]
  },

  mobile: {
    domainName: "Mobile Development",
    roleName: "Mobile Application Developer",
    skills: ["React Native", "iOS", "Android", "Mobile Architecture", "State Management", "Offline Sync", "Performance"],
    codingLanguage: "javascript",
    codingChallenges: [
      {
        title: "LeetCode Medium 146: LRU Cache for Offline Asset Storage",
        description: "Design and implement a data structure for a Least Recently Used (LRU) Cache with `get(key)` and `put(key, value)` operations in O(1) time complexity using a HashMap + Doubly Linked List.",
        starterCode: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`,
        examples: [
          { input: "LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2)", output: "get(2) returns -1" }
        ],
        constraints: ["O(1) average time complexity for both get and put"]
      },
      {
        title: "LeetCode Medium 341: Flatten Nested State Iterator",
        description: "Implement a function `flattenNestedList(nestedList)` that flattens arbitrary depths of nested lists and integers into a single flat array in linear time.",
        starterCode: `function flattenNestedList(nestedList) {
  const result = [];
  function helper(list) {
    for (const item of list) {
      if (Array.isArray(item)) {
        helper(item);
      } else {
        result.push(item);
      }
    }
  }
  helper(nestedList);
  return result;
}`,
        examples: [
          { input: "[[1,1], 2, [1,1]]", output: "[1, 1, 2, 1, 1]" }
        ],
        constraints: ["Handles deep recursion safely", "O(N) time complexity"]
      }
    ],
    demoQuestions: [
      "Tell me about your mobile development experience building production iOS and Android applications.",
      "What are your core technical strengths in mobile architecture, and what mobile framework do you prefer?",
      "Walk me through a production mobile app you developed. What was the state architecture and navigation structure?",
      "How did you handle offline data synchronization, local storage, and background task execution in that app?",
      "Explain how the React Native JavaScript bridge / JSI (JavaScript Interface) and TurboModules work.",
      "How do you optimize mobile app rendering to maintain smooth 60/120 FPS animations without frame drops?",
      "What is the difference between memory management and lifecycle events on Android vs iOS?",
      "CODING CHALLENGE 1 (LeetCode Medium): Implement an LRU Cache to manage mobile memory and asset caching in O(1) time.",
      "CODING CHALLENGE 2 (LeetCode Medium): Implement a flattened state serializer for deep offline state hydration.",
      "How do you handle native module integrations in cross-platform mobile apps?",
      "Describe a severe mobile crash or memory leak issue you diagnosed using Xcode Instruments or Android Profiler."
    ]
  },

  product: {
    domainName: "Product Management",
    roleName: "Technical Product Manager",
    skills: ["Product Strategy", "System Design", "User Journeys", "Metrics & KPIs", "A/B Testing", "Trade-Off Analysis"],
    codingLanguage: "text",
    codingChallenges: [
      {
        title: "LeetCode Medium / System Design: Multi-Channel Notification API Contracts",
        description: "Design the core data schema and RESTful API endpoints for a notification service supporting email, SMS, and in-app push notifications with idempotency and user preferences.",
        starterCode: `/* 
Design API Endpoints & Schema:
1. Endpoints: POST /api/v1/notifications (with idempotency-key)
2. Payload: { recipientId, channels: ["email", "push"], templateId, data: {} }
3. Idempotency handling: Redis distributed lock & deduplication table
4. User preference fallback: Check opt-out matrix before dispatch
*/`,
        examples: [
          { input: "POST /api/v1/notifications", output: "202 Accepted with notification ID" }
        ],
        constraints: ["Idempotent message retries", "User opt-out filtering"]
      },
      {
        title: "LeetCode Medium / System Design: Rate Limiting & Fair-Share Quota Queue",
        description: "Specify the algorithm and contract for fair-share token allocation when multiple client applications burst API requests simultaneously.",
        starterCode: `/*
Token Bucket Algorithm Spec:
1. Bucket capacity: C tokens
2. Refill rate: r tokens/sec
3. Per-tenant isolation: TenantId partition key
4. Burst mitigation: Reject with 429 & Retry-After header
*/`,
        examples: [
          { input: "Tenant exceeds burst threshold", output: "Returns 429 Too Many Requests with Retry-After header" }
        ],
        constraints: ["Fair distribution across tenants", "Zero starvation"]
      }
    ],
    demoQuestions: [
      "Tell me about your background in technical product management and delivering software products.",
      "How do you bridge communication between executive stakeholders, designers, and engineering teams?",
      "Walk me through a high-impact technical product or feature you owned from discovery to launch. What was the outcome?",
      "How did you define success metrics (North Star KPI, acquisition, retention) and track adoption for that product?",
      "How do you prioritize competing engineering initiatives (e.g. paying down technical debt vs building revenue features)?",
      "Explain how you design and analyze A/B tests to make data-driven product decisions without statistical fallacies.",
      "Describe how you handle a situation where engineering estimates exceed the target product launch deadline by 3x.",
      "CODING CHALLENGE 1 (LeetCode Medium): Specify the API contracts and architectural trade-offs for a multi-channel notification engine.",
      "CODING CHALLENGE 2 (LeetCode Medium): Design a Fair-Share Quota and Rate Limiting algorithm for API consumers.",
      "How do you measure and reduce customer churn using product analytics cohorts?",
      "How do you define the long-term vision and technical roadmap for a product in an intensely competitive market?"
    ]
  }
};

/* =========================================================
   OPENAI CLIENT HELPER
========================================================= */

async function openai(messages, temperature = 0.2) {
  const key = process.env.OPENAI_API_KEY;

  if (!key || key.trim() === "") {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
    });

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

/* =========================================================
   HELPER: DETECT DOMAIN CONFIG
========================================================= */

export function resolveDomainConfig(role = "", domainKey = "") {
  const normalized = (role + " " + domainKey).toLowerCase();

  if (normalized.includes("react") || normalized.includes("frontend")) return DOMAINS_CONFIG.react;
  if (normalized.includes("python")) return DOMAINS_CONFIG.python;
  if (normalized.includes("node") || normalized.includes("express") || normalized.includes("backend")) return DOMAINS_CONFIG.node;
  if (normalized.includes("java") || normalized.includes("spring")) return DOMAINS_CONFIG.java;
  if (normalized.includes("ai") || normalized.includes("ml") || normalized.includes("machine learning") || normalized.includes("generative")) return DOMAINS_CONFIG.ai;
  if (normalized.includes("data") || normalized.includes("sql") || normalized.includes("analytics")) return DOMAINS_CONFIG.data;
  if (normalized.includes("devops") || normalized.includes("cloud") || normalized.includes("aws") || normalized.includes("docker")) return DOMAINS_CONFIG.cloud;
  if (normalized.includes("security") || normalized.includes("cyber") || normalized.includes("owasp")) return DOMAINS_CONFIG.security;
  if (normalized.includes("mobile") || normalized.includes("ios") || normalized.includes("android")) return DOMAINS_CONFIG.mobile;
  if (normalized.includes("product") || normalized.includes("pm")) return DOMAINS_CONFIG.product;

  return DOMAINS_CONFIG.react;
}

/* =========================================================
   1. DOMAIN-SPECIFIC INTERVIEW GENERATOR (EXACTLY 2 LEETCODE MEDIUM CODING PROBLEMS)
========================================================= */

export async function generateQuestions({
  role,
  domain,
  difficulty = "Medium",
  jobDescription = "",
  githubSummary = "",
  language = "en-IN"
}) {
  const domainConfig = resolveDomainConfig(role, domain);

  const prompt = `
You are a Senior Principal Technical Interviewer conducting an authentic, rigorous technical interview for a ${difficulty} ${role} position (${domainConfig.domainName}).

Required technical skills to evaluate:
${domainConfig.skills.join(", ")}

JOB DESCRIPTION / FOCUS:
${jobDescription || `Standard ${role} expectations`}

CANDIDATE GITHUB / PROJECTS:
${githubSummary || "No portfolio provided"}

Create EXACTLY 11 realistic interview questions structured strictly across these 5 sequential rounds:

ROUND 1 — INTRODUCTION & BEHAVIORAL (Questions 1 to 2):
1. Friendly greeting and candidate background / experience introduction.
2. Behavioral question regarding teamwork, handling challenges, or motivation for this ${role} role.

ROUND 2 — PROJECT DISCUSSION & ARCHITECTURE (Questions 3 to 4):
3. Deep-dive into a major project candidate built (problem solved, architecture, technical decisions).
4. Follow-up regarding specific challenges, scalability trade-offs, or improvements made in that project.

ROUND 3 — DOMAIN-SPECIFIC TECHNICAL DEEP DIVE (Questions 5 to 7):
Generate 3 technical questions specifically testing ${domainConfig.skills.join(", ")}.
5. Foundational/Core technical concept question (Easy-Medium).
6. In-depth technical architecture/mechanics question (Medium).
7. Advanced optimization, memory, or internal mechanics question (Medium-Hard).

ROUND 4 — CODING INTERVIEW (Questions 8 and 9 - EXACTLY 2 LEETCODE MEDIUM PROBLEMS):
8. State the FIRST LeetCode Medium coding challenge relevant to ${role}. Must start with "CODING CHALLENGE 1 (LeetCode Medium): ".
9. State the SECOND LeetCode Medium coding challenge relevant to ${role}. Must start with "CODING CHALLENGE 2 (LeetCode Medium): ".

ROUND 5 — PRODUCTION SCENARIOS & SYSTEM DESIGN (Questions 10 to 11):
10. Production debugging or troubleshooting incident scenario in ${domainConfig.domainName}.
11. High-scale reliability, caching, security, or cross-functional collaboration scenario.

IMPORTANT RULES:
- Return EXACTLY 11 strings in a valid JSON array.
- Questions 8 and 9 MUST be 2 distinct LeetCode Medium coding challenges with prefixes "CODING CHALLENGE 1 (LeetCode Medium): " and "CODING CHALLENGE 2 (LeetCode Medium): ".
- Do NOT include answers or solutions.

Return ONLY a valid JSON array of 11 question strings.
`;

  try {
    const raw = await openai([
      {
        role: "system",
        content: `You are an elite Staff Technical Interviewer at a Tier-1 tech company. Generate realistic, domain-specific interview questions with exactly 2 LeetCode Medium coding challenges in Round 4.`
      },
      {
        role: "user",
        content: prompt
      }
    ], 0.3);

    if (raw) {
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length >= 10 && parsed.every(q => typeof q === "string" && q.trim().length > 0)) {
        return parsed.map(q => q.trim());
      }
    }
  } catch (err) {
    console.error("AI question generation failed, using rich domain fallback:", err.message);
  }

  return domainConfig.demoQuestions;
}

/* =========================================================
   2. INTELLIGENT CODING EVALUATION ENGINE
========================================================= */

function isValidCodeSnippet(code = "", language = "javascript") {
  const trimmed = (code || "").trim();
  if (trimmed.length < 12) return false;

  // Single word or random letters without punctuation/spaces
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1 && trimmed.length > 8 && !trimmed.includes("(") && !trimmed.includes("{") && !trimmed.includes(";") && !trimmed.includes(":")) {
    return false;
  }

  // Look for legitimate programming syntax constructs across languages
  const lower = trimmed.toLowerCase();
  const syntaxKeywords = [
    "def ", "def(", "class ", "return ", "return(", "function ", "function(",
    "const ", "let ", "var ", "import ", "from ", "package ", "#include",
    "public ", "private ", "protected ", "static ", "void ", "int ", "bool ",
    "string ", "float ", "double ", "char ", "select ", "where ", "insert ",
    "if ", "if(", "for ", "for(", "while ", "while(", "switch ", "case ",
    "try ", "catch ", "except ", "raise ", "throw ", "print(", "console.log",
    "=>", "->", "{", "}", ";", "(", ")", "[", "]", "=", "+", "-", "*", "/",
    "std::", "auto ", "nullptr", "async ", "await ", "lambda ", "val "
  ];

  let matches = 0;
  for (const kw of syntaxKeywords) {
    if (lower.includes(kw)) {
      matches++;
    }
  }

  return matches >= 2;
}

export async function analyzeCodeSolution({
  problem = "",
  code = "",
  language = "javascript",
  domain = "software",
  role = "Software Engineer"
}) {
  const trimmed = (code || "").trim();

  // Strict check for empty or non-code/gibberish input
  if (!trimmed || !isValidCodeSnippet(trimmed, language)) {
    return {
      correctness: "Incorrect / Invalid Syntax",
      isCorrect: false,
      detectedApproach: "None (Invalid Syntax / Random Input)",
      timeComplexity: "N/A",
      spaceComplexity: "N/A",
      bruteForce: {
        approach: "No valid algorithmic structure detected",
        timeComplexity: "N/A",
        candidateVsBruteForce: "The editor contains random text or invalid syntax. Please write an authentic code solution with functions, variables, and logic in your chosen language.",
        optimalApproach: "Optimal algorithmic solution (e.g. Sliding Window / Two Pointers / HashMap)",
        optimalTimeComplexity: "O(n) or optimal"
      },
      codeQuality: {
        score: 0,
        readability: "0/10 - Gibberish / Non-code text",
        modularity: "No functions, classes, or valid declarations",
        edgeCasesHandled: "0/10",
        suggestions: [
          "Declare a function or class matching the problem requirement.",
          "Write syntactically valid code in " + (language || "your chosen language") + "."
        ]
      },
      improvements: [
        "Write actual programming syntax rather than arbitrary characters.",
        "Structure your solution with proper inputs, outputs, and return values."
      ],
      algorithmicHint: "💡 Hint: Carefully identify the problem constraints and choose an appropriate data structure (e.g., HashMap, Two Pointers, or Sliding Window) to solve this in linear or optimal time."
    };
  }

  const prompt = `
You are an expert Algorithmic Coding Interview Evaluator analyzing a candidate's code submission for the role of ${role}.

PROBLEM:
${problem || "Standard algorithmic problem"}

LANGUAGE:
${language}

CANDIDATE CODE:
${code}

EVALUATION CRITERIA:
1. STRICT SYNTAX & LOGIC CHECK: If the code is random gibberish, broken syntax, or meaningless text, set "isCorrect": false, "correctness": "Incorrect / Invalid Syntax", "detectedApproach": "None / Invalid Syntax", "timeComplexity": "N/A", "spaceComplexity": "N/A", and "score": 0.
2. If genuine code is written:
   - Correctness: "Correct" | "Partially Correct" | "Incorrect"
   - Detected Approach: Algorithmic paradigm used (e.g. "Sliding Window", "Two Pointers", "HashMap / Hashing", "Dynamic Programming", "Brute Force Iteration", etc.)
   - Time Complexity: Big-O format
   - Space Complexity: Big-O format
   - Brute force vs optimal comparison
   - Code quality score (0 to 10)
   - Algorithmic Hint: Provide a subtle 1-2 sentence hint to guide optimization without revealing full code.

Return JSON ONLY in this exact format:
{
  "correctness": "Correct | Partially Correct | Incorrect",
  "isCorrect": true,
  "detectedApproach": "e.g. HashMap / Frequency Table",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "bruteForce": {
    "approach": "e.g. Nested loop checking every pair",
    "timeComplexity": "O(n^2)",
    "candidateVsBruteForce": "Comparison text",
    "optimalApproach": "e.g. Single-pass HashMap lookup",
    "optimalTimeComplexity": "O(n)"
  },
  "codeQuality": {
    "score": 8,
    "readability": "Clean and well structured",
    "modularity": "Modular function with clear parameters",
    "edgeCasesHandled": "Handles typical inputs",
    "suggestions": ["Suggestions"]
  },
  "improvements": [
    "Improvement 1",
    "Improvement 2"
  ],
  "algorithmicHint": "💡 Hint: A brief algorithmic hint for this problem."
}
`;

  try {
    const raw = await openai([
      {
        role: "system",
        content: "You are a Senior Staff Software Engineer and Algorithmic Evaluator. Rigorously penalize gibberish/invalid code with 0 score. Return pure JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ], 0.1);

    if (raw) {
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed?.detectedApproach && parsed?.timeComplexity) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Code analysis error:", err.message);
  }

  // Fallback heuristic evaluation
  const lines = code.split("\n").filter(l => l.trim().length > 0);
  const hasMap = code.includes("Map") || code.includes("dict") || code.includes("{}") || code.includes("hash") || code.includes("set") || code.includes("count");
  const hasTwoPointers = code.includes("left") && code.includes("right");
  const hasNestedLoops = (code.match(/for|while/g) || []).length >= 2;
  const hasFunction = code.includes("function") || code.includes("def ") || code.includes("class ") || code.includes("public ") || code.includes("=>");

  if (!hasFunction && lines.length <= 2) {
    return {
      correctness: "Incorrect / Incomplete Function",
      isCorrect: false,
      detectedApproach: "Incomplete Code Fragment",
      timeComplexity: "N/A",
      spaceComplexity: "N/A",
      bruteForce: {
        approach: "Incomplete logic",
        timeComplexity: "N/A",
        candidateVsBruteForce: "Please define a complete function with proper parameters and return values.",
        optimalApproach: "Complete function implementation",
        optimalTimeComplexity: "O(n)"
      },
      codeQuality: {
        score: 2,
        readability: "Incomplete code fragment",
        modularity: "No function definition found",
        edgeCasesHandled: "None",
        suggestions: ["Enclose logic inside a properly named function with parameters."]
      },
      improvements: [
        "Define a full function signature with input parameters and return statement.",
        "Implement algorithmic logic to solve the problem."
      ],
      algorithmicHint: "💡 Hint: Structure your code inside a function and use appropriate data structures to track state efficiently."
    };
  }

  const detectedApproach = hasTwoPointers ? "Two Pointers" : hasMap ? "HashMap / Sliding Window" : hasNestedLoops ? "Brute Force Iteration" : "Linear Scan";
  const timeComplexity = hasTwoPointers || hasMap ? "O(n)" : hasNestedLoops ? "O(n^2)" : "O(n)";
  const spaceComplexity = hasMap ? "O(n)" : "O(1)";
  const isSolid = lines.length >= 4 && (hasMap || hasTwoPointers || hasNestedLoops);

  return {
    correctness: isSolid ? "Correct / Substantially Complete" : "Partially Correct",
    isCorrect: isSolid,
    detectedApproach,
    timeComplexity,
    spaceComplexity,
    bruteForce: {
      approach: "Check all pairs or nested loops",
      timeComplexity: "O(n^2)",
      candidateVsBruteForce: hasMap || hasTwoPointers
        ? "Your approach optimizes pointers/lookups to O(n) linear time, outperforming the O(n^2) brute force."
        : "Your solution uses iteration structure.",
      optimalApproach: "Single-pass algorithm with O(1) lookups or two pointers",
      optimalTimeComplexity: "O(n)"
    },
    codeQuality: {
      score: isSolid ? 8 : 5,
      readability: "Code is structured with variable assignments",
      modularity: "Function defined with parameters",
      edgeCasesHandled: isSolid ? "Standard inputs covered" : "Edge cases need handling",
      suggestions: ["Consider boundary condition checks for empty or single-element inputs."]
    },
    improvements: [
      "Ensure all edge cases (empty collections, boundary limits) are guarded.",
      "Verify time and space complexity optimizations for large inputs."
    ],
    algorithmicHint: "💡 Hint: Consider whether a single-pass hash map or two pointers can achieve O(n) time with O(1) or O(n) space."
  };
}

/* =========================================================
   3. DYNAMIC FOLLOW-UP GENERATOR
========================================================= */

export async function generateFollowUpQuestion({
  currentQuestion = "",
  candidateAnswer = "",
  role = "Software Engineer",
  domain = "software"
}) {
  if (!candidateAnswer || candidateAnswer.trim().length < 15) {
    return {
      needsFollowUp: true,
      followUpQuestion: "Could you expand on that with more technical details or a concrete practical example?",
      evaluation: {
        accuracy: 4,
        communication: 4,
        depth: 3,
        confidence: 4,
        rating: "Needs Improvement"
      }
    };
  }

  const prompt = `
You are a Senior Technical Interviewer conducting an interview for ${role}.

INTERVIEW QUESTION:
"${currentQuestion}"

CANDIDATE'S ANSWER:
"${candidateAnswer}"

Evaluate if the answer is complete or if an intelligent, realistic follow-up question is needed to probe deeper.

Rules:
1. If the answer is vague, shallow, or partially correct, generate a sharp, natural follow-up question (do NOT reveal the correct answer).
2. If the answer is already exceptionally thorough and complete, set needsFollowUp to false.
3. Calculate scores (0-10) for: Technical Accuracy, Communication, Depth of Knowledge, Confidence.
4. Classify rating as: "Excellent" | "Good" | "Average" | "Needs Improvement".

Return JSON ONLY in this format:
{
  "needsFollowUp": true,
  "followUpQuestion": "e.g. That's a good start. How does that behavior change when multiple requests arrive concurrently?",
  "evaluation": {
    "accuracy": 8,
    "communication": 8,
    "depth": 7,
    "confidence": 8,
    "rating": "Good"
  }
}
`;

  try {
    const raw = await openai([
      {
        role: "system",
        content: "You are an expert Technical Interviewer. Return pure JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ], 0.2);

    if (raw) {
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed?.evaluation) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Follow-up generation error:", err.message);
  }

  const words = candidateAnswer.split(/\s+/).length;
  const isSolid = words >= 30;

  return {
    needsFollowUp: !isSolid,
    followUpQuestion: !isSolid ? "Can you explain the trade-offs or a specific scenario where this approach would be most effective?" : null,
    evaluation: {
      accuracy: isSolid ? 8 : 6,
      communication: isSolid ? 8 : 6,
      depth: isSolid ? 7 : 5,
      confidence: isSolid ? 8 : 6,
      rating: isSolid ? "Good" : "Average"
    }
  };
}

/* =========================================================
   4. FULL MULTI-DIMENSIONAL INTERVIEW EVALUATION
========================================================= */

export async function evaluateInterview({
  role = "Software Engineer",
  domain = "software",
  transcript = [],
  codingSubmission = null
}) {
  const domainConfig = resolveDomainConfig(role, domain);
  const text = transcript.map(item => `${item.type}: ${item.content}`).join("\n");

  const prompt = `
You are an expert Senior Staff Hiring Bar Raiser evaluating a candidate for the role of ${role} (${domainConfig.domainName}).

Skills evaluated: ${domainConfig.skills.join(", ")}

FULL INTERVIEW TRANSCRIPT:
${text}

CODING SUBMISSION:
${codingSubmission ? JSON.stringify(codingSubmission) : "No separate coding challenge submitted"}

SCORING CRITERIA:
1. GIBBERISH / MEANINGLESS TEXT / ZERO EFFORT: Score 0-10 overall.
2. SHALLOW / INCOMPLETE RESPONSES: Score 15-45 overall.
3. SOLID / TECHNICAL RESPONSES: Score 55-80 overall.
4. EXCEPTIONAL / SENIOR LEVEL: Score 85-100 overall.

Calculate:
- Overall score (0 to 100)
- Category scores (0 to 10 each):
  - behavioral: Behavioral & Teamwork
  - project: Project Discussion & Technical Decisions
  - technical: Domain Technical Knowledge
  - coding: Coding & LeetCode Medium Problem Solving
  - communication: Clarity & Articulation
- Skill-by-skill breakdown (0 to 10 for each skill in ${JSON.stringify(domainConfig.skills)})
- Readiness Level: "Strong Candidate" | "Interview Ready" | "Improving" | "Beginner" | "Not Ready"
- Strengths (list of 3 specific strengths)
- Weaknesses (list of 2-3 specific areas for improvement)
- Action Plan (3 ordered steps)
- Study Topics (3 specific advanced topics to study)
- Recommended Practice Questions (3 realistic follow-up questions to practice)

Return JSON ONLY in this exact format:
{
  "score": 82,
  "summary": "The candidate demonstrated strong understanding of...",
  "readinessLevel": "Interview Ready",
  "categoryScores": {
    "behavioral": 8,
    "project": 8,
    "technical": 9,
    "coding": 8,
    "communication": 8
  },
  "skillScores": {
    "${domainConfig.skills[0]}": 9,
    "${domainConfig.skills[1]}": 8
  },
  "strengths": [
    "Deep understanding of core architecture",
    "Clear communication when explaining trade-offs"
  ],
  "weaknesses": [
    "Could improve edge-case handling in coding",
    "Needs deeper familiarity with production optimization"
  ],
  "improvements": [
    "Practice solving LeetCode Medium algorithmic problems with strict time constraints",
    "Review internal mechanics of framework diffing and memory management"
  ],
  "studyTopics": [
    "Advanced performance profiling",
    "Distributed system failure modes"
  ],
  "practiceQuestions": [
    "How would you handle race conditions in async operations?",
    "Explain how to architect a high-throughput event processing pipeline."
  ]
}
`;

  try {
    const raw = await openai([
      {
        role: "system",
        content: "You are a Principal Engineering Bar Raiser. Return pure JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ], 0.1);

    if (raw) {
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (typeof parsed?.score === "number" && parsed?.categoryScores) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("AI Full Evaluation error:", err.message);
  }

  // Robust offline fallback calculation
  const userMessages = transcript
    .filter(item => item.type === "User")
    .map(item => item.content.trim())
    .filter(Boolean);

  let totalWords = 0;
  let validAnswers = 0;

  for (const message of userMessages) {
    const words = message.split(/\s+/).filter(Boolean);
    totalWords += words.length;
    if (words.length >= 4 && message.length > 20) {
      validAnswers++;
    }
  }

  if (validAnswers === 0) {
    return {
      score: 5,
      summary: "The candidate submitted incoherent, invalid, or insufficient answers with minimal technical content.",
      readinessLevel: "Not Ready",
      categoryScores: { behavioral: 1, project: 1, technical: 1, coding: 1, communication: 1 },
      skillScores: Object.fromEntries(domainConfig.skills.map(s => [s, 1])),
      strengths: ["Completed the interview session attempt."],
      weaknesses: ["Responses contained non-answers or insufficient technical detail."],
      improvements: ["Provide structured, clear technical explanations with real-world examples."],
      studyTopics: domainConfig.skills.slice(0, 3),
      practiceQuestions: ["Explain core concepts and architectural decisions clearly."]
    };
  }

  const avgWords = Math.round(totalWords / (userMessages.length || 1));
  const baseScore = Math.min(85, Math.max(25, Math.round(validAnswers * 6 + Math.min(30, avgWords * 0.7))));
  const categoryRating = Math.min(10, Math.max(3, Math.round(baseScore / 10)));

  return {
    score: baseScore,
    summary: `The candidate demonstrated practical understanding across ${domainConfig.domainName} topics with good baseline problem-solving abilities.`,
    readinessLevel: baseScore >= 75 ? "Strong Candidate" : baseScore >= 60 ? "Interview Ready" : baseScore >= 40 ? "Improving" : "Beginner",
    categoryScores: {
      behavioral: Math.min(10, categoryRating + 1),
      project: categoryRating,
      technical: categoryRating,
      coding: Math.max(1, categoryRating - 1),
      communication: categoryRating
    },
    skillScores: Object.fromEntries(
      domainConfig.skills.map((s, idx) => [s, Math.min(10, Math.max(3, categoryRating + (idx % 2 === 0 ? 1 : 0)))])
    ),
    strengths: [
      `Solid fundamentals in ${domainConfig.skills[0] || "core domain concepts"}.`,
      "Communicated thought process clearly during technical discussions."
    ],
    weaknesses: [
      "Could elaborate further on production edge cases and system trade-offs.",
      "Practice more LeetCode Medium algorithmic coding under time constraints."
    ],
    improvements: [
      "Explain the architectural reasoning behind technical choices.",
      "Review time and space complexity optimizations for coding questions."
    ],
    studyTopics: domainConfig.skills.slice(0, 3),
    practiceQuestions: [
      `How would you optimize performance in a high-scale ${domainConfig.roleName} application?`,
      "Walk through your step-by-step debugging methodology for production issues."
    ]
  };
}