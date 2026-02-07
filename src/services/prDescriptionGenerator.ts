export function generatePRDescription(
  problemName: string,
  executionTime: string,
  problemType: string,
  difficulty: string,
  authorName: string,
  authorGithub: string,
  solutionFile: string,
  readmeFile: string
): string {

  // Extract GitHub username from URL
  const githubUsername = authorGithub
    ? authorGithub.replace("https://github.com/", "").replace("/", "")
    : "";

  return `# Title
Add solution and documentation for ${problemName}

---

## Summary
This pull request adds a new solution along with its corresponding documentation.

The implementation follows the repository’s standard structure and focuses on correctness, clarity, and consistency.

---

## Execution Time
${executionTime || "N/A"}

---

## Purpose / Context
The purpose of this contribution is to:

- Implement a working solution for the given problem  
- Maintain a consistent and organized repository structure  
- Improve readability and traceability of solutions  
- Document the approach for future reference  

This change ensures the solution is easy to understand and reuse.

---

## Overview of Implementation
- Implemented the core logic to solve the problem.  
- Followed a clear, step-by-step approach.  
- Ensured the solution handles standard and edge cases.  
- Returned the expected output as per the problem requirements.

---

## Key Design Points

### Clear Logic Flow
- Logic is written in a straightforward and traceable manner.  
- Steps are easy to follow and debug.

### Maintainability
- Code is structured to be readable and reusable.  
- Avoids unnecessary complexity.

### Safety
- Does not introduce side effects unless required.  
- Input handling follows expected constraints.

---

## Comparison / Rationale

### Current Implementation
- Prioritizes clarity and correctness.  
- Suitable for learning, review, and maintenance.

### Alternative Approaches
- Other approaches may improve performance or resource usage.  
- The chosen approach balances simplicity and reliability.

---

## Trade-offs

| Aspect | Decision |
|------|---------|
| Readability | Prioritized |
| Performance | Acceptable |
| Complexity | Kept minimal |
| Extensibility | High |

---

## Files Added / Modified
- ${solutionFile} — Solution implementation  
- ${readmeFile} — Documentation

---

## How to Test
1. Run the solution with sample inputs.  
2. Verify the output matches expected results.  
3. Test edge cases where applicable.

---

## Notes
- Implementation follows repository conventions.  
- Can be optimized or extended in future iterations.

---

## Author

**${authorName}**

[![GitHub](https://img.shields.io/badge/GitHub-${githubUsername}-blue)](${authorGithub})
`;
}
