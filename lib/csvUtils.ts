import Papa from 'papaparse';
import { Candidate } from '../types';

// This function loads the candidates data from a CSV file and parses it into an array of Candidate objects.
export async function loadCandidatesData(): Promise<Candidate[]> {
  try {
    const response = await fetch('/data/candidates.csv');
    const csvText = await response.text();
    
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transform: (value, field) => {
        if (value === 'Yes') return true;
        if (value === 'No') return false;
        
        // Special parsing for skills and tags which use semicolons as separators
        if (field === 'skills' || field === 'tags') {
          return value;
        }
        
        return value;
      }
    });

    
    return results.data as Candidate[];
  } catch (error) {
    console.error(error)
    return [];
  }
}