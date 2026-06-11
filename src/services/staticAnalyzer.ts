export interface AnalysisResult {
  patterns: string[];
  estimatedComplexity?: string;
}

export function analyzeCode(
  code: string,
  language: string,
  problemName: string
): AnalysisResult {
  const patternsSet = new Set<string>();
  const codeLower = code.toLowerCase();
  const titleLower = problemName.toLowerCase();

  // =============================
  // 1. DATA STRUCTURE SCANNING
  // =============================

  // Linked List
  if (
    code.includes("ListNode") ||
    code.includes("ListNode*") ||
    code.includes("struct Node") ||
    /\b(next|prev|head|tail)\b/.test(codeLower) ||
    titleLower.includes("linked list") ||
    titleLower.includes("list")
  ) {
    patternsSet.add("Linked List");
  }

  // Hash Map / Set
  if (
    /\b(hashmap|hashset|dict|defaultdict|unordered_map|unordered_set|set\s*\(|map\s*\(|btreehashmap|btreeset)\b/i.test(codeLower) ||
    code.includes("Map<") ||
    code.includes("Set<") ||
    code.includes("new Map") ||
    code.includes("new Set") ||
    /\{\s*\}/.test(codeLower) ||
    titleLower.includes("duplicate") ||
    titleLower.includes("anagram") ||
    titleLower.includes("hash") ||
    titleLower.includes("map") ||
    titleLower.includes("two sum")
  ) {
    patternsSet.add("Hash Map / Set");
  }

  // Heap / Priority Queue
  if (
    /\b(priorityqueue|priority_queue|heapq|heappush|heappop|heapify|binaryheap|minheap|maxheap)\b/i.test(codeLower) ||
    titleLower.includes("heap") ||
    titleLower.includes("priority") ||
    titleLower.includes("kth largest") ||
    titleLower.includes("kth smallest")
  ) {
    patternsSet.add("Heap / Priority Queue");
  }

  // Stack
  if (
    /\bstack\b/i.test(codeLower) ||
    code.includes("Stack<") ||
    titleLower.includes("stack") ||
    titleLower.includes("bracket") ||
    titleLower.includes("parentheses")
  ) {
    patternsSet.add("Stack");
  }

  // Queue / Deque
  if (
    /\b(queue|deque|arraydeque|poll|pollfirst|polllast|offer|offerlast|offerfirst|popleft|appendleft|vecdeque)\b/i.test(codeLower) ||
    code.includes("Queue<") ||
    titleLower.includes("queue")
  ) {
    patternsSet.add("Queue / Deque");
  }

  // Graph / Tree
  if (
    code.includes("TreeNode") ||
    /\b(treenode|root|adj|adjlist|adjacency|children|inorder|preorder|postorder)\b/i.test(codeLower) ||
    titleLower.includes("tree") ||
    titleLower.includes("bst") ||
    titleLower.includes("graph") ||
    titleLower.includes("node") ||
    titleLower.includes("path")
  ) {
    patternsSet.add("Graph / Tree");
  }

  // Matrix / Grid
  if (
    /(\[\]\s*\[\]|vector\s*<\s*vector|grid|matrix)/i.test(codeLower) ||
    titleLower.includes("matrix") ||
    titleLower.includes("grid") ||
    titleLower.includes("island") ||
    titleLower.includes("board")
  ) {
    patternsSet.add("Matrix / Grid");
  }

  // =============================
  // 2. ALGORITHMIC PATTERNS
  // =============================

  // Two Pointers
  const hasLeftRightPointers = /\b(left|right)\b/i.test(codeLower) && 
                               !/\b(left|right)\b/i.test(titleLower) &&
                               !codeLower.includes("->left") && 
                               !codeLower.includes("->right") && 
                               !codeLower.includes(".left") && 
                               !codeLower.includes(".right");

  if (
    /\b(slow|fast|ptr1|ptr2|pointer|p1|p2)\b/i.test(codeLower) ||
    hasLeftRightPointers ||
    /\bwhile\s*\(\s*(left|i|lo)\s*<\s*(right|j|hi)\s*\)/i.test(codeLower) ||
    titleLower.includes("two pointer") ||
    titleLower.includes("palindrome")
  ) {
    patternsSet.add("Two Pointers");
  }

  // BFS
  if (
    (/\b(queue|deque)\b/i.test(codeLower) && /\b(poll|popleft|shift|pop|pollfirst)\b/i.test(codeLower) && /\b(while|empty)\b/i.test(codeLower)) ||
    titleLower.includes("bfs") ||
    titleLower.includes("breadth") ||
    titleLower.includes("level order")
  ) {
    patternsSet.add("BFS");
  }

  // DFS / Backtracking
  if (
    /\b(dfs|backtrack|backtracking|solve|helper|traverse|recursion|recursive)\b/i.test(codeLower) ||
    titleLower.includes("dfs") ||
    titleLower.includes("depth") ||
    titleLower.includes("backtrack") ||
    titleLower.includes("combination") ||
    titleLower.includes("permutation") ||
    titleLower.includes("subset")
  ) {
    patternsSet.add("DFS / Backtracking");
  }

  // Sorting
  if (
    /\b(sort|sorted|quicksort|mergesort)\b/i.test(codeLower) ||
    titleLower.includes("sort")
  ) {
    patternsSet.add("Sorting");
  }

  // Dynamic Programming
  if (
    /\b(dp|memo|cache|memoization|tabulation|lru_cache)\b/i.test(codeLower) ||
    /dp\s*\[/i.test(codeLower) ||
    titleLower.includes("dynamic programming") ||
    titleLower.includes("knapsack") ||
    titleLower.includes("robber") ||
    titleLower.includes("subsequence") ||
    titleLower.includes("climbing stairs")
  ) {
    patternsSet.add("Dynamic Programming");
  }

  // Binary Search
  if (
    /\b(binarysearch|binary_search|mid|low|high)\b/i.test(codeLower) ||
    /\bwhile\s*\(\s*(low|left)\s*<=\s*(high|right)\s*\)/i.test(codeLower) ||
    titleLower.includes("binary search") ||
    titleLower.includes("search in")
  ) {
    patternsSet.add("Binary Search");
  }

  // Bit Manipulation
  if (
    /(&|\||\^|<<|>>|~)\s*=?/i.test(codeLower) && !/\b(if|while|&&|\|\|)\b/.test(codeLower) ||
    /\b(xor|bitwise|bitmask|shift|bit)\b/i.test(codeLower) ||
    titleLower.includes("bit") ||
    titleLower.includes("xor") ||
    titleLower.includes("power of")
  ) {
    patternsSet.add("Bit Manipulation");
  }

  // Sliding Window
  if (
    (/\b(left|right|window|size|width)\b/i.test(codeLower) && /\b(max|min|length)\b/i.test(codeLower)) ||
    titleLower.includes("sliding window") ||
    titleLower.includes("substring") ||
    titleLower.includes("subarray")
  ) {
    patternsSet.add("Sliding Window");
  }

  // Math
  if (
    /%|math|gcd|lcm|mod|modulo|prime|factorial|power|sqrt/i.test(codeLower) ||
    titleLower.includes("math") ||
    titleLower.includes("number") ||
    titleLower.includes("sum") ||
    titleLower.includes("digits")
  ) {
    patternsSet.add("Math / Number Theory");
  }

  // String
  if (
    titleLower.includes("string") ||
    titleLower.includes("anagram") ||
    titleLower.includes("word") ||
    titleLower.includes("palindrome")
  ) {
    patternsSet.add("String Manipulation");
  }

  // Traversal (Fallback standard pattern)
  if (patternsSet.size === 0) {
    patternsSet.add("Traversal");
    patternsSet.add("Simulation");
  }

  // =============================
  // 3. COMPLEXITY ESTIMATION
  // =============================
  let estimatedComplexity = "Likely Linear";

  const hasBinarySearch = patternsSet.has("Binary Search");
  const hasRecursion = /\b(dfs|backtrack|helper|solve)\b/i.test(codeLower);

  // Check nested loop patterns
  const hasNestedLoops = /(for|while)[\s\S]*?(for|while)/i.test(codeLower) && 
                         (codeLower.split(/\b(for|while)\b/i).length - 1) >= 2;

  let isQuadratic = false;
  if (hasNestedLoops) {
    const lines = code.split("\n");
    let loopDepth = 0;
    let maxDepth = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("for") || trimmed.startsWith("while")) {
        loopDepth++;
        if (loopDepth > maxDepth) {
          maxDepth = loopDepth;
        }
      }
      if (trimmed === "}" || trimmed === "};" || trimmed.startsWith("}")) {
        if (loopDepth > 0) {
          loopDepth--;
        }
      }
    }
    if (maxDepth >= 2) {
      isQuadratic = true;
    }
  }

  if (patternsSet.has("BFS")) {
    estimatedComplexity = "Likely Linear"; // BFS queue-based traversals are linear
  } else if (hasRecursion && patternsSet.has("Dynamic Programming")) {
    estimatedComplexity = "Likely Linear"; // Memoized DP
  } else if (hasRecursion && (patternsSet.has("DFS / Backtracking") || titleLower.includes("combination") || titleLower.includes("permutation") || titleLower.includes("subset"))) {
    estimatedComplexity = "Likely Exponential";
  } else if (isQuadratic) {
    estimatedComplexity = "Likely Quadratic";
  } else if (hasBinarySearch) {
    estimatedComplexity = "Likely Logarithmic";
  } else {
    const hasLoops = /\b(for|while)\b/i.test(codeLower);
    if (!hasLoops) {
      estimatedComplexity = "Likely Constant";
    } else {
      estimatedComplexity = "Likely Linear";
    }
  }

  return {
    patterns: Array.from(patternsSet),
    estimatedComplexity
  };
}
