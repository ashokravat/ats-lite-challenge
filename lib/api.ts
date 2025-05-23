import { OpenAI } from "openai";
import { ProcessingPlans, Stats, Candidate } from '../types';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Need this for browser usage
});

// Function to extract JSON from content
function extractJsonFromContent(content: string): string {
  // Handle content wrapped in markdown code blocks
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = content.match(jsonRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  // If no code blocks, return the original content
  return content.trim();
}

// Function to generate processing plans based on user query
export async function generatePlans(query: string, headers: string[]): Promise<ProcessingPlans> {
  const prompt = `
  You are ATS-Lite, an applicant tracking system assistant. 
  Given a CSV of candidates with the following headers: ${headers.join(', ')},
  interpret the following recruiter query and respond only with a valid JSON containing filter and rank plans.
  
  Query: "${query}"

  IMPORTANT: If the query appears to be just a greeting (like "hi", "hello", etc.) or is too vague to 
  create a meaningful filter, do NOT generate filter criteria. Instead, return:
  
  {
    "isConversational": true
  }
  
  Otherwise, for valid search queries, generate filter and rank plans as follows:
    
  VERY IMPORTANT: Filter plans require candidates to match ALL fields in the include object.
  Be careful not to add too many fields or criteria that would make the results too restrictive.

  When interpreting queries:
  - Be careful with terms like "developer", "engineer", etc. - if they appear with specific skills, 
    the user is likely looking for candidates with those skills regardless of job title.
    For example, "Node.js developers" should find anyone with Node.js skills, not just those with "developer" in their title.
  - Only filter by title when the user is clearly looking for a specific job role, such as "Frontend Engineers" or "DevOps team"
  - For title searches like "Give me machine learning engineers" or "Show me frontend developers":
     - Focus on filtering by the JOB TITLE, not by skills
     - Example: For "machine learning engineers" use title:["Machine Learning Engineer", "ML Engineer"]
  - For skill searches like "Find people who know React" or "developers with Python experience":
     - Focus on filtering by SKILLS, not by job title
     - Example: For "React developers" use skills:"React"
  
  When creating the filter plan, be flexible with terminology and understand common variations:
  - For job titles: "ML Engineer" = "Machine Learning Engineer", "Frontend Developer" = "Frontend Engineer", etc.
  - For skills: "React" should match "ReactJS", "Node" should match "Node.js", etc.
  - Be aware that skills might be part of a semicolon-separated list in the "skills" field
  - Remember that users type natural language and might use abbreviations or synonyms
  
  
  For natural language queries about salary:
  - "lower salary" -> filter by desired_salary_usd with appropriate maximum
  - "high salary" -> filter or rank by desired_salary_usd
  
  Response format must be exactly:
  {
    "filter": {
      "include": {
        // properties to match (be flexible with synonyms and variations)
        // examples: 
        // "title": ["Machine Learning Engineer", "ML Engineer", "AI Engineer"] 
        // "skills": "React"
        // "location": "India"
        // "years_experience": {"min": 3}
        // "desired_salary_usd": {"max": 100000} // for lower salary
      },
      "exclude": {
        // properties to exclude
      }
    },
    "rank": {
      "primary": {
        "field": "years_experience",
        "order": "desc"
      },
      "tie_breakers": [
        {"field": "availability_weeks", "order": "asc"}
      ]
    }
  }
  
  IMPORTANT: Respond with ONLY the JSON object, no markdown formatting, no code blocks, and no additional text.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are ATS-Lite, an assistant that helps filter and rank job candidates. 
          When asked for JSON, respond with only valid JSON, no markdown code blocks.
          Be flexible with terminology and understand synonyms (ML = Machine Learning, Frontend Developer = Frontend Engineer, etc).`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    try {
      // Extract JSON from potential markdown code blocks
      const jsonContent = extractJsonFromContent(content);

      return JSON.parse(jsonContent) as ProcessingPlans;
    } catch (err) {
      console.error(err)
      // If first attempt fails, try again with more explicit instruction
      const retryResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are ATS-Lite. Return ONLY raw, valid JSON with no formatting, no explanation, no markdown."
          },
          { role: "user", content: prompt },
          {
            role: "assistant",
            content: content
          },
          {
            role: "user",
            content: "You included markdown formatting. Please respond with ONLY the JSON object, no backticks, no markdown, just the raw JSON."
          }
        ],
        temperature: 0.1,
      });

      const retryContent = retryResponse.choices[0].message.content;
      if (!retryContent) {
        throw new Error('Empty response from LLM retry');
      }

      // Try parsing the retry content
      const jsonRetryContent = extractJsonFromContent(retryContent);
      return JSON.parse(jsonRetryContent) as ProcessingPlans;
    }
  } catch (error) {
    throw error;
  }
}

// Function to generate a summary of the search results
export async function generateSummary(
  query: string,
  candidates: Candidate[],
  stats: Stats
) {
  const candidateData = candidates.map(c =>
    `${c.id}. ${c.full_name} - ${c.title} (${c.location}, ${c.years_experience} years experience)`
  ).join('\n');

  const prompt = `
    You are ATS-Lite, an applicant tracking system assistant. Summarize the search results for the following query:
    
    Query: "${query}"
    
    Statistics:
    - Total matches: ${stats.count}
    - Average experience: ${stats.avg_experience} years
    - Top skills: ${stats.top_skills.join(', ')}
    
    Top candidates:
    ${candidateData}
    
    Provide a concise, recruiter-friendly summary of these results. Be informative but brief.
    Include mention of any notable patterns or standout candidates. Don't repeat all candidate details.

    If there were no results, explain what might have caused this - for example:
  - Were the title requirements too specific? 
  - Were the salary constraints too limiting?
  - Did the combination of skills + role make it too restrictive?
  
  Suggest how the user might modify their search to get better results.
  `;

  try {
    return await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are ATS-Lite, an assistant that helps summarize candidate search results." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      stream: true,
    });
  } catch (error) {
    throw error;
  }
}