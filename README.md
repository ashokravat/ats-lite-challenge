# ATS-Lite

> A mini ATS that shows you how the system actually thinks

## What's This?

I built this mini applicant tracking system that has a cool twist - it shows you exactly how the AI thinks when filtering and ranking candidates.

The app loads a CSV of dummy candidates and lets recruiters search using natural language. Then it shows the whole process:

- How it understands the query
- How it filters the dataset
- How it ranks the results
- A nice summary of what it found

## Live Demo

Check it out here: [ATS-Lite Demo](https://ats-lite-challenge.vercel.app)

## 🚀 Getting Started

### Installation

1. Clone the repo
```bash
git clone https://github.com/yourusername/ats-lite-challenge.git
cd ats-lite-challenge
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file with your OpenAI API key
```
NEXT_PUBLIC_OPENAI_API_KEY=your-api-key-here
```

4. Start the development server
```bash
npm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔍 Features

### The MCP Loop (Monitor, Control, Plan)

The app follows a transparent loop for each query:

1. **THINK** - The LLM gets the query and CSV headers, returning JSON with filter and ranking plans
2. **ACT 1** - Front-end calls `filterCandidates()` with the filter plan
3. **ACT 2** - Front-end calls `rankCandidates()` with the ranking plan 
4. **SPEAK** - Front-end asks the LLM to generate a recruiter-friendly summary of results

All of this happens with live UI updates so you can see the system thinking.

### Cool UI Features

- Chat interface with streaming responses
- Timeline sidebar that reveals each step of the process
- Dynamic candidate table that animates when results change
- Keyboard shortcuts (⌘/Ctrl + Enter to send messages)
- Smooth animations when filtering and ranking

### Search Capabilities

You can search for candidates using natural language queries like:
- "Frontend engineers in Germany, most experience first"
- "Developers with React skills who can start within 2 weeks"

The system handles synonym matching, abbreviations (dev = developer), and more.

## 🧪 Testing

Run the test suite with:

```bash
npm run test
```

There's a specific test for "React dev, Cyprus, sort by experience desc" to ensure the proper candidate ranking.

## 🛠️ Tech Stack

- **Next.js** - React framework 
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **OpenAI SDK** - LLM integration
- **Framer Motion** - Animations
- **Jest** - Testing

## 📁 Project Structure

```
/
├── components/      # UI components
│   ├── CandidateDetails.tsx
│   ├── ChatPanel.tsx
│   ├── ResultsTable.tsx
│   ├── ShimmerLoading.tsx
│   ├── TimelineSidebar.tsx
│   └── TypeAnimation.tsx
├── lib/             # Core logic
│   ├── api.ts       # OpenAI interaction
│   ├── tools.ts     # Filtering & ranking logic
│   └── csvUtils.ts  # CSV parser
├── types/           # TypeScript type definitions
├── store/           # Zustand state management
├── public/          # Static assets
│   ├── data
│        └── candidates.csv
├── __tests__/       # Test files
│   └── filter-sort.test.ts  # Main test for filtering and sorting
```

## 📝 Notes

- The entire system runs in the browser - no database or external dependencies needed
- The CSV is loaded into memory at startup
- No auth or user management - this is just a demo
- Prompts are carefully engineered to ensure the LLM consistently returns valid JSON