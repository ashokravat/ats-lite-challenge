'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import CandidateDetails from '../components/CandidateDetails';
import ChatPanel from '../components/ChatPanel';
import ResultsTable from '../components/ResultsTable';
import TimelineSidebar from '../components/TimelineSidebar';
import { loadCandidatesData } from '../lib/csvUtils';
import { useStore } from '../store';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';

export default function Home() {
  const {
    setCandidates,
    hasLoadedOnce,
    selectedCandidate,
    timelineVisible,
    toggleTimeline,
    setSelectedCandidate,
    resultVisible,
    toggleResult,
  } = useStore();

  useEffect(() => {
    async function loadData() {
      const data = await loadCandidatesData();
      setCandidates(data);
    }
    loadData();
  }, [setCandidates]);

  return (
    <main className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {timelineVisible && <div className='w-full h-screen fixed bg-[#00000031] z-[19] timeline-backdrop hidden' onClick={toggleTimeline}></div>}
      <TimelineSidebar />

      <div className="flex flex-col flex-1 transition-all duration-300">
        <header className="bg-white shadow-lg p-6 w-full mx-auto border-b flex gap-2 justify-between ">
          <div className='flex gap-3 items-center'>
            <button
              onClick={toggleTimeline}
              className="p-2 min-w-[40px] bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 z-10 header-toggle-button hidden"
              aria-label={timelineVisible ? "Collapse sidebar" : "Expand sidebar"}
            >
              {timelineVisible ? "«" : "»"}
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                  ATS-Lite
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  A transparent applicant tracking system
                </p>
              </div>
            </div>
          </div>
          {hasLoadedOnce && (
            <button
              onClick={toggleResult}
              className="p-3 min-w-[48px] bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl shadow-md hover:shadow-lg border border-slate-200 transition-all duration-200 z-10 header-toggle-button hidden group"
              aria-label={resultVisible ? "Collapse result" : "Expand result"}
            >
              <TableRowsRoundedIcon 
                fontSize='medium' 
                className={`transition-colors duration-200 ${
                  resultVisible 
                    ? 'text-slate-500 group-hover:text-blue-600' 
                    : 'text-blue-600 group-hover:text-indigo-600'
                }`} 
              />
            </button>
          )}
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex-grow flex flex-col">
            <ChatPanel />
          </div>

          <div className="flex flex-col">
            {hasLoadedOnce && <ResultsTable />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedCandidate && (
          <>
            <div className='w-full h-screen fixed bg-gradient-to-r from-black/20 via-black/30 to-black/20 backdrop-blur-sm z-[19]' onClick={() => setSelectedCandidate(null)}></div>
            <CandidateDetails />
          </>
        )}
      </AnimatePresence>
    </main>
  );
}