import { filterCandidates, rankCandidates } from '../lib/tools';
import { Candidate, FilterPlan, RankingPlan } from '../types';

describe('ATS Challenge - Filter and Rank Tests', () => {
  // Test data subset with candidates relevant to our test
  const mockCandidates: Candidate[] = [
    {
      id: 12,
      full_name: "Quinn Williams",
      title: "Machine Learning Engineer",
      location: "Nicosia, Cyprus",
      timezone: "Asia/Nicosia",
      years_experience: 19,
      skills: "Spring;Kubernetes;JavaScript;TypeScript",
      languages: "Hindi;Arabic",
      education_level: "Master's",
      degree_major: "Software Engineering",
      availability_weeks: 10,
      willing_to_relocate: false,
      work_preference: "Remote",
      notice_period_weeks: 4,
      desired_salary_usd: 153752,
      open_to_contract: true,
      remote_experience_years: 2,
      visa_status: "Citizen",
      citizenships: "Australia",
      summary: "Machine Learning Engineer with strong background in Spring, Kubernetes, JavaScript. Passionate about clean code and scalable systems.",
      tags: "data,machine‑learning,cloud",
      last_active: "2025-03-16",
      linkedin_url: "https://linkedin.com/in/candidate12"
    },
    {
      id: 5,
      full_name: "Jess Garcia",
      title: "DevOps Engineer",
      location: "San Francisco, USA",
      timezone: "America/Los_Angeles",
      years_experience: 8,
      skills: "FastAPI;Ruby;GCP;Spring;Node.js;GraphQL;Angular",
      languages: "French;German",
      education_level: "PhD",
      degree_major: "Computer Science",
      availability_weeks: 12,
      willing_to_relocate: true,
      work_preference: "Remote",
      notice_period_weeks: 2,
      desired_salary_usd: 91938,
      open_to_contract: false,
      remote_experience_years: 7,
      visa_status: "Needs Sponsorship",
      citizenships: "Nigeria",
      summary: "DevOps Engineer with strong background in FastAPI and Ruby",
      tags: "frontend,fullstack,devops",
      last_active: "2025-04-06",
      linkedin_url: "https://linkedin.com/in/candidate05"
    },
    {
      id: 8,
      full_name: "Rowan Anderson",
      title: "Cloud Architect",
      location: "Nicosia, Cyprus",
      timezone: "Asia/Nicosia",
      years_experience: 8,
      skills: "TypeScript;Next.js;Python;Spring;React",
      languages: "French;Hindi;English",
      education_level: "Bootcamp",
      degree_major: "Computer Science",
      availability_weeks: 3,
      willing_to_relocate: true,
      work_preference: "Remote",
      notice_period_weeks: 5,
      desired_salary_usd: 68574,
      open_to_contract: true,
      remote_experience_years: 2,
      visa_status: "Work Visa",
      citizenships: "India",
      summary: "Cloud Architect with strong background in TypeScript, Next.js, Python. Passionate about clean code and scalable systems.",
      tags: "data,machine‑learning,frontend",
      last_active: "2025-04-10",
      linkedin_url: "https://linkedin.com/in/candidate08"
    },
    {
      id: 7,
      full_name: "Chris Wilson",
      title: "Backend Engineer",
      location: "Nicosia, Cyprus",
      timezone: "Asia/Nicosia",
      years_experience: 12,
      skills: "Rust;JavaScript;Kafka;Spring;TypeScript;React",
      languages: "Portuguese",
      education_level: "Bootcamp",
      degree_major: "Software Engineering",
      availability_weeks: 2,
      willing_to_relocate: false,
      work_preference: "Hybrid",
      notice_period_weeks: 2,
      desired_salary_usd: 119483,
      open_to_contract: false,
      remote_experience_years: 6,
      visa_status: "Needs Sponsorship",
      citizenships: "Australia",
      summary: "Backend Engineer with strong background in Rust, JavaScript, Kafka. Passionate about clean code and scalable systems.",
      tags: "devops,qa,mobile",
      last_active: "2025-04-25",
      linkedin_url: "https://linkedin.com/in/candidate07"
    }
  ];

  // Test case for "React dev, Cyprus, sort by experience desc"
  test('React dev, Cyprus, sort by experience desc', () => {
    // Filter plan to match React developers in Cyprus
    const filterPlan: FilterPlan = {
      include: {
        skills: "React",
        location: "Cyprus"
      }
    };
    
    // Ranking plan for "experience desc"
    const rankingPlan: RankingPlan = {
      primary: {
        field: "years_experience",
        order: "desc"
      }
    };
    
    // Apply filter and ranking
    const filteredCandidates = filterCandidates(mockCandidates, filterPlan, { flexibleMatching: true });
    const rankedCandidates = rankCandidates(filteredCandidates, rankingPlan);
    
    // Debug output - useful for troubleshooting the test
    console.log('Filtered candidates:', filteredCandidates.map(c => ({ 
      id: c.id, 
      name: c.full_name,
      location: c.location, 
      experience: c.years_experience,
      skills: c.skills
    })));
    
    console.log('Ranked candidates:', rankedCandidates.map(c => ({ 
      id: c.id, 
      name: c.full_name,
      location: c.location, 
      experience: c.years_experience
    })));
    
    // Verify that we have the expected candidates
    // We should have candidates in Cyprus with React skills
    expect(filteredCandidates.length).toBeGreaterThan(0);
    
    // Get the index of candidates #12 and #7 in the ranked results
    const candidate12Index = rankedCandidates.findIndex(c => c.id === 7);
    const candidate8Index = rankedCandidates.findIndex(c => c.id === 8);
    
    // Test that both candidates are in the results
    expect(candidate12Index).not.toBe(-1);
    expect(candidate8Index).not.toBe(-1);
    
    // Test that candidate #7 (with 12 years experience) appears before candidate #8 (with 8 years experience)
    expect(candidate12Index).toBeLessThan(candidate8Index);
    
    // Additionally, verify that results are properly sorted by years_experience
    for (let i = 0; i < rankedCandidates.length - 1; i++) {
      expect(rankedCandidates[i].years_experience).toBeGreaterThanOrEqual(rankedCandidates[i+1].years_experience);
    }
  });
});