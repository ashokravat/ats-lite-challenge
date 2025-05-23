import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Candidate } from '../types';

export default function ResultsTable() {
  const { rankedCandidates, setSelectedCandidate, resultVisible } = useStore();

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  return (
    <div className={`flex-1 overflow-auto border-l h-full result-table bg-gradient-to-b from-slate-50 to-white ${resultVisible ? 'collapse_result' : 'expand_result'}`}>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-blue-500 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white mb-1">Candidate Results</h2>
            <p className="text-sm text-white">{rankedCandidates.length} candidates found</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    Skills
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence initial={false}>
                  {rankedCandidates.map((candidate, index) => (
                    <motion.tr
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 100,
                        duration: 0.3,
                        delay: index * 0.05
                      }}
                      layout
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-300 group"
                      onClick={() => handleSelectCandidate(candidate)}
                    >
                      <td className="px-6 py-5 min-w-[200px]">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                          {candidate.full_name}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">{candidate.title}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-slate-700 font-medium">{candidate.location}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2">
                          {candidate.years_experience} years
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills?.split(';').slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded-full border border-blue-300 shadow-sm"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                          {candidate.skills?.split(';').length > 3 && (
                            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-full">
                              +{candidate.skills.split(';').length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}