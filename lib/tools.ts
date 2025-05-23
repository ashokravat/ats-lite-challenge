import { Candidate, FilterPlan, RankingPlan, Stats } from "../types";

// Common job title variations
const JOB_TITLE_SYNONYMS: Record<string, string[]> = {
  engineer: ["developer", "programmer", "coder", "swe", "dev"],
  developer: ["engineer", "programmer", "coder", "swe", "dev"],
  "machine learning": ["ml", "ai", "artificial intelligence"],
  frontend: ["front end", "front-end", "ui", "client-side"],
  backend: ["back end", "back-end", "server-side"],
  "full stack": ["fullstack", "full-stack"],
  devops: ["dev ops", "dev-ops", "operations"],
  product: ["product development", "product management"],
};

// Common skill name variations
const SKILL_SYNONYMS: Record<string, string[]> = {
  react: ["reactjs", "react.js"],
  node: ["nodejs", "node.js"],
  javascript: ["js", "ecmascript"],
  typescript: ["ts"],
  python: ["py"],
  "machine learning": ["ml"],
  "artificial intelligence": ["ai"],
  aws: ["amazon web services"],
  gcp: ["google cloud", "google cloud platform"],
  azure: ["microsoft azure"],
};

function extractRoleFromTitle(title: string): string | null {
  // Common engineering job roles
  const roles = [
    "engineer",
    "developer",
    "architect",
    "specialist",
    "designer",
    "manager",
    "lead",
    "analyst",
    "scientist",
    "administrator",
    "devops",
    "sre",
    "qa",
    "tester",
  ];

  // Check for specific roles in the title
  for (const role of roles) {
    if (title.includes(role)) {
      return role;
    }
  }

  return null;
}

function matchJobTitle(
  candidateTitle: string,
  queryTitle: string,
  strictMode: boolean = true
): boolean {
  const candidateLower = candidateTitle.toLowerCase().trim();
  const queryLower = queryTitle.toLowerCase().trim();

  // Exact match
  if (candidateLower === queryLower) {
    return true;
  }

  // For strict mode, we need to be very precise
  if (strictMode) {
    // Define key words that must match exactly
    const frontendKeywords = ["frontend", "front-end", "front end"];
    const backendKeywords = ["backend", "back-end", "back end"];
    const fullstackKeywords = ["fullstack", "full-stack", "full stack"];
    const roleKeywords = ["engineer", "developer"];

    // Check if candidate title contains any frontend/backend/fullstack keywords
    const hasFrontend = frontendKeywords.some((keyword) =>
      candidateLower.includes(keyword)
    );
    const hasBackend = backendKeywords.some((keyword) =>
      candidateLower.includes(keyword)
    );
    const hasFullstack = fullstackKeywords.some((keyword) =>
      candidateLower.includes(keyword)
    );

    // Check if query title contains any frontend/backend/fullstack keywords
    const queryHasFrontend = frontendKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );
    const queryHasBackend = backendKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );
    const queryHasFullstack = fullstackKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );

    // Check if both titles contain a role keyword
    const hasRole = roleKeywords.some((keyword) =>
      candidateLower.includes(keyword)
    );
    const queryHasRole = roleKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );

    // For frontend queries, candidate MUST have frontend in title
    if (queryHasFrontend && !hasFrontend) {
      return false;
    }

    // For backend queries, candidate MUST have backend in title
    if (queryHasBackend && !hasBackend) {
      return false;
    }

    // For fullstack queries, candidate MUST have fullstack in title
    if (queryHasFullstack && !hasFullstack) {
      return false;
    }

    // If query specifies engineer/developer, candidate must be an engineer/developer
    if (queryHasRole && !hasRole) {
      return false;
    }

    if (
      (queryHasFrontend && hasFrontend) ||
      (queryHasBackend && hasBackend) ||
      (queryHasFullstack && hasFullstack)
    ) {
      return true;
    }

    // If no specific category matched, return false
    return false;
  }

  // For non-strict mode (fallback to more lenient matching)
  // Direct contains match
  if (
    candidateLower.includes(queryLower) ||
    queryLower.includes(candidateLower)
  ) {
    return true;
  }

  return false;
}

// To match job titles and skills with some flexibility
function isSemanticMatch(
  target: string,
  sources: string | string[],
  options: {
    exactMatch?: boolean; // Require exact match instead of partial
    fieldType?: string; // The type of field we're matching (title, skills, etc.)
  } = {}
): boolean {
  const targetLower = target.toLowerCase();
  const sourceArray = Array.isArray(sources) ? sources : [sources];
  const { exactMatch = false, fieldType = "" } = options;

  for (const source of sourceArray) {
    const sourceLower = source.toLowerCase();

    // For exact matching mode (stricter)
    if (exactMatch) {
      // For titles, be very specific about roles
      if (fieldType === "title") {
        // Extract the core role from both source and target
        const sourceRole = extractRoleFromTitle(sourceLower);
        const targetRole = extractRoleFromTitle(targetLower);

        // If we could extract roles, they must match
        if (sourceRole && targetRole && sourceRole === targetRole) {
          return true;
        }

        // Check if the source exactly matches the target or a significant part of it
        const targetWords = targetLower.split(/\s+/);
        const lastWordOfTarget = targetWords[targetWords.length - 1];

        // If the last word matches (often the role: Engineer, Developer)
        if (
          sourceLower.includes(lastWordOfTarget) &&
          lastWordOfTarget.length > 5
        ) {
          // And the first word also matches (often the specialty: Frontend, Backend)
          if (
            sourceLower.includes(targetWords[0]) &&
            targetWords[0].length > 3
          ) {
            return true;
          }
        }

        // For exact title matches
        return targetLower === sourceLower;
      }

      // For skills, check for exact skill match
      if (fieldType === "skills") {
        return (
          targetLower === sourceLower ||
          targetLower.replace(".", "") === sourceLower.replace(".", "") ||
          targetLower.replace(".js", "") === sourceLower.replace(".js", "")
        );
      }

      // For other fields, require exact match
      return targetLower === sourceLower;
    }

    // Direct contains match
    if (
      targetLower.includes(sourceLower) ||
      sourceLower.includes(targetLower)
    ) {
      return true;
    }

    // Check all parts of the target against the source (for compound titles)
    const targetParts = targetLower.split(/\s+/);
    for (const part of targetParts) {
      if (sourceLower.includes(part) && part.length > 2) {
        return true;
      }
    }

    // Check synonym groups
    for (const [baseWord, synonyms] of Object.entries(JOB_TITLE_SYNONYMS)) {
      if (
        (sourceLower.includes(baseWord) &&
          synonyms.some((s) => targetLower.includes(s))) ||
        (targetLower.includes(baseWord) &&
          synonyms.some((s) => sourceLower.includes(s)))
      ) {
        return true;
      }
    }

    // Skill-specific synonyms for skills field
    for (const [baseSkill, skillSynonyms] of Object.entries(SKILL_SYNONYMS)) {
      if (
        (sourceLower.includes(baseSkill) &&
          skillSynonyms.some((s) => targetLower.includes(s))) ||
        (targetLower.includes(baseSkill) &&
          skillSynonyms.some((s) => sourceLower.includes(s)))
      ) {
        return true;
      }
    }
  }

  return false;
}

// Function to filter candidates based on a filter plan with strict matching
export function smartFilterCandidates(
  allCandidates: Candidate[],
  plan: FilterPlan | null,
  options: { strictMatch?: boolean; debugMode?: boolean } = {}
): Candidate[] {
  if (!plan || (!plan.include && !plan.exclude)) {
    return allCandidates;
  }

  const { strictMatch = true, debugMode = false } = options;

  return allCandidates.filter((candidate) => {
    let includeMatch = true;
    let excludeMatch = false;

    // For debugging
    const matchResults: Record<string, boolean> = {};

    // Handle include criteria - ALL fields must match (AND operation)
    if (plan.include) {
      includeMatch = Object.entries(plan.include).every(([key, value]) => {
        const candidateValue = candidate[key];
        let fieldMatch = false;

        // Handle undefined values
        if (candidateValue === undefined) {
          fieldMatch = false;
          if (debugMode) matchResults[key] = false;
        }
        // For title field, use special handling
        else if (key === "title") {
          if (Array.isArray(value)) {
            fieldMatch = value.some((title) => {
              if (
                typeof title === "string" &&
                typeof candidateValue === "string"
              ) {
                const titleMatch = matchJobTitle(
                  candidateValue,
                  title,
                  strictMatch
                );
                return titleMatch;
              }
              return false;
            });
          } else if (
            typeof value === "string" &&
            typeof candidateValue === "string"
          ) {
            fieldMatch = matchJobTitle(candidateValue, value, strictMatch);
          }
          if (debugMode) matchResults[key] = fieldMatch;
        }
        // Handle array of possible values (for synonyms/variations)
        else if (Array.isArray(value)) {
          if (typeof candidateValue === "string") {
            // Special handling for skills field which uses semicolons
            if (key === "skills" || key === "tags") {
              const skillsList = candidateValue
                .split(";")
                .map((s) => s.trim().toLowerCase());
              fieldMatch = value.some((v) => {
                if (typeof v === "string") {
                  return skillsList.some((skill) =>
                    isSemanticMatch(skill, v, {
                      exactMatch: strictMatch,
                      fieldType: key,
                    })
                  );
                }
                return false;
              });
            } else {
              // For other string fields, check if any value matches
              fieldMatch = value.some((v) => candidateValue === v);
            }
          } else {
            fieldMatch = value.includes(candidateValue);
          }
          if (debugMode) matchResults[key] = fieldMatch;
        }
        // Handle string comparisons
        else if (
          typeof value === "string" &&
          typeof candidateValue === "string"
        ) {
          // For skills, check if any skill in the list matches exactly
          if (key === "skills" || key === "tags") {
            const skillsList = candidateValue
              .split(";")
              .map((s) => s.trim().toLowerCase());
            fieldMatch = skillsList.some((skill) =>
              isSemanticMatch(skill, value, {
                exactMatch: strictMatch,
                fieldType: key,
              })
            );
          }
          // For location, allow semantic matching
          else if (key === "location") {
            fieldMatch = isSemanticMatch(candidateValue, value);
          }
          // For other fields, do case-insensitive comparison
          else {
            fieldMatch = candidateValue.toLowerCase() === value.toLowerCase();
          }
          if (debugMode) matchResults[key] = fieldMatch;
        }
        // Handle numeric range comparisons
        else if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          const numValue = Number(candidateValue);
          if (isNaN(numValue)) {
            fieldMatch = false;
          } else {
            if (value.min !== undefined && numValue < value.min) {
              fieldMatch = false;
            } else if (value.max !== undefined && numValue > value.max) {
              fieldMatch = false;
            } else {
              fieldMatch = true;
            }
          }
          if (debugMode) matchResults[key] = fieldMatch;
        }
        // Handle boolean and exact matches
        else {
          fieldMatch = candidateValue === value;
          if (debugMode) matchResults[key] = fieldMatch;
        }

        return fieldMatch;
      });
    }

    // Handle exclude criteria - ANY field must NOT match (OR operation)
    if (plan.exclude) {
      excludeMatch = Object.entries(plan.exclude).some(([key, value]) => {
        const candidateValue = candidate[key];
        let fieldMatch = false;

        if (candidateValue === undefined) {
          fieldMatch = false;
          if (debugMode) matchResults[key] = true;
        } else if (key === "title") {
          if (Array.isArray(value)) {
            fieldMatch = value.some((title) => {
              if (
                typeof title === "string" &&
                typeof candidateValue === "string"
              ) {
                const titleMatch = matchJobTitle(
                  candidateValue,
                  title,
                  strictMatch
                );
                return titleMatch;
              }
              return false;
            });
          } else if (
            typeof value === "string" &&
            typeof candidateValue === "string"
          ) {
            fieldMatch = matchJobTitle(candidateValue, value, strictMatch);
          }
          if (debugMode) matchResults[key] = fieldMatch;
        } else if (Array.isArray(value)) {
          if (typeof candidateValue === "string") {
            // Special handling for skills field which uses semicolons
            if (key === "skills" || key === "tags") {
              const skillsList = candidateValue
                .split(";")
                .map((s) => s.trim().toLowerCase());
              fieldMatch = value.some((v) => {
                if (typeof v === "string") {
                  return skillsList.some((skill) =>
                    isSemanticMatch(skill, v, {
                      exactMatch: strictMatch,
                      fieldType: key,
                    })
                  );
                }
                return false;
              });
            } else {
              // For other string fields, check if any value matches
              fieldMatch = value.some((v) => candidateValue === v);
            }
          } else {
            fieldMatch = value.includes(candidateValue);
          }
          if (debugMode) matchResults[key] = fieldMatch;
        } else if (
          typeof value === "string" &&
          typeof candidateValue === "string"
        ) {
          if (key === "skills" || key === "tags") {
            const skillsList = candidateValue
              .split(";")
              .map((s) => s.trim().toLowerCase());
            fieldMatch = skillsList.some((skill) =>
              isSemanticMatch(skill, value, {
                exactMatch: strictMatch,
                fieldType: key,
              })
            );
          } else if (key === "location") {
            fieldMatch = isSemanticMatch(candidateValue, value);
          } else {
            fieldMatch = candidateValue.toLowerCase() === value.toLowerCase();
          }
          if (debugMode) matchResults[key] = fieldMatch;
        } else if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          const numValue = Number(candidateValue);
          if (isNaN(numValue)) {
            fieldMatch = false;
          } else {
            if (value.min !== undefined && numValue < value.min) {
              fieldMatch = true;
            } else if (value.max !== undefined && numValue > value.max) {
              fieldMatch = true;
            } else {
              fieldMatch = false;
            }
          }
          if (debugMode) matchResults[key] = fieldMatch;
        } else {
          fieldMatch = candidateValue === value;
          if (debugMode) matchResults[key] = fieldMatch;
        }
        return fieldMatch;
      });
    }
    return includeMatch && !excludeMatch;
  });
}

// Function to filter candidates based on a filter plan
export function filterCandidates(
  allCandidates: Candidate[],
  plan: FilterPlan | null,
  options: { flexibleMatching?: boolean; debug?: boolean } = {}
): Candidate[] {
  const { flexibleMatching = false, debug = true } = options;

  // If no plan, return all candidates
  if (!plan) return allCandidates;

  // Check if we have title filtering
  const hasTitle = plan.include && "title" in plan.include;

  // For title filtering, ALWAYS use strict matching first
  if (hasTitle) {
    // Try with strict title matching first
    const strictResults = smartFilterCandidates(allCandidates, plan, {
      strictMatch: true,
      debugMode: debug,
    });

    // If we have strict matches, always return those
    if (strictResults.length > 0) {
      return strictResults;
    }

    // Only if strict matching returns no results and flexibleMatching is explicitly enabled
    if (flexibleMatching) {
      const relaxedResults = smartFilterCandidates(allCandidates, plan, {
        strictMatch: false,
        debugMode: debug,
      });

      if (relaxedResults.length > 0) {
        return relaxedResults;
      }
    }
    return [];
  }

  const results = smartFilterCandidates(allCandidates, plan, {
    strictMatch: !flexibleMatching,
    debugMode: debug,
  });

  return results;
}

// Function to rank candidates based on a ranking plan
export function rankCandidates(
  candidates: Candidate[],
  plan: RankingPlan | null
): Candidate[] {
  if (!plan || !plan.primary) {
    return candidates;
  }

  return [...candidates].sort((a, b) => {
    // Primary sort
    const primaryField = plan.primary.field;
    const primaryOrder = plan.primary.order;

    // Get values, defaulting to empty string or 0 if undefined
    const aValue =
      a[primaryField] ?? (typeof a[primaryField] === "string" ? "" : 0);
    const bValue =
      b[primaryField] ?? (typeof b[primaryField] === "string" ? "" : 0);

    let comparison = 0;

    // Compare based on type
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
    } else {
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }

    // Apply sort order
    const primaryResult = primaryOrder === "desc" ? -comparison : comparison;

    // If primary sort resulted in a tie and we have tie breakers, use them
    if (
      primaryResult === 0 &&
      plan.tie_breakers &&
      plan.tie_breakers.length > 0
    ) {
      return plan.tie_breakers.reduce((result, tieBreaker) => {
        if (result !== 0) return result; // If a previous tie-breaker resolved the tie, use that

        const tieField = tieBreaker.field;
        const tieOrder = tieBreaker.order;

        const aTieValue =
          a[tieField] ?? (typeof a[tieField] === "string" ? "" : 0);
        const bTieValue =
          b[tieField] ?? (typeof b[tieField] === "string" ? "" : 0);

        let tieComparison = 0;

        if (typeof aTieValue === "string" && typeof bTieValue === "string") {
          tieComparison = aTieValue.localeCompare(bTieValue);
        } else if (
          typeof aTieValue === "boolean" &&
          typeof bTieValue === "boolean"
        ) {
          tieComparison = aTieValue === bTieValue ? 0 : aTieValue ? 1 : -1;
        } else {
          tieComparison =
            aTieValue < bTieValue ? -1 : aTieValue > bTieValue ? 1 : 0;
        }

        return tieOrder === "desc" ? -tieComparison : tieComparison;
      }, 0);
    }

    return primaryResult;
  });
}

// Function to aggregate statistics from candidates
export function aggregateStats(candidates: Candidate[]): Stats {
  if (candidates.length === 0) {
    return { count: 0, avg_experience: 0, top_skills: [] };
  }

  const count = candidates.length;

  // Calculate average experience
  const totalExperience = candidates.reduce((sum, candidate) => {
    return sum + (candidate.years_experience || 0);
  }, 0);
  const avg_experience = parseFloat((totalExperience / count).toFixed(1));

  // Extract and count skills
  const skillsCounter: Record<string, number> = {};
  candidates.forEach((candidate) => {
    if (candidate.skills) {
      const skillsList = candidate.skills
        .split(";")
        .map((skill) => skill.trim());
      skillsList.forEach((skill) => {
        skillsCounter[skill] = (skillsCounter[skill] || 0) + 1;
      });
    }
  });

  // Sort skills by frequency
  const top_skills = Object.entries(skillsCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((entry) => entry[0]);

  return { count, avg_experience, top_skills };
}