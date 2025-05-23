'use client'

import { motion } from 'framer-motion';
import { useStore } from '../store';
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import { useState } from 'react';

export default function CandidateDetails() {
  const { selectedCandidate, setSelectedCandidate } = useStore();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  if (!selectedCandidate) return null;

  const skills = selectedCandidate.skills ?
    selectedCandidate.skills.split(';').map(s => s.trim()) : [];

  const languages = selectedCandidate.languages ?
    selectedCandidate.languages.split(';').map(l => l.trim()) : [];

  const tags = selectedCandidate.tags ?
    selectedCandidate.tags.split(',').map(t => t.trim()) : [];

  const handleCopyJson = () => {
    try {
      const jsonData = JSON.stringify(selectedCandidate, null, 2);
      navigator?.clipboard?.writeText(jsonData);
      setCopyStatus('copied');

      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000); // Reset copy status after 2 seconds
    } catch (error) {
      console.error(error)
      setCopyStatus('error');

      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 w-96 bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-2xl border-l border-blue-200 p-6 overflow-y-auto z-20"
    >
      <div className="flex justify-between items-start mb-4">
        <div className='flex flex-col gap-2'>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-blue-500">
              {selectedCandidate.full_name}
            </h2>
          </div>
          <button
            onClick={handleCopyJson}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-all duration-200 w-full ${copyStatus === 'copied'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : copyStatus === 'error'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-300 hover:border-blue-300 shadow-sm hover:shadow-md'
              }`}
            aria-label="copy json"
          >
            <ContentCopyTwoToneIcon className='!w-4' />
            <span className="font-medium">
              {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Failed to copy' : 'Copy JSON'}
            </span>
          </button>
        </div>
        <button
          onClick={() => setSelectedCandidate(null)}
          className="p-2 rounded-full hover:bg-red-100 hover:text-red-600 text-slate-400 transition-all duration-200 min-w-[40px] shadow-sm hover:shadow-md"
          aria-label="Close details"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        <div className=''>
          <h3 className="text-sm font-bold mb-3 bg-blue-500 text-white py-2 px-3 rounded-lg shadow-md uppercase tracking-wide">
            Overview
          </h3>
          <div className="grid grid-cols-2 gap-4 pl-1">
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Title</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.title}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Location</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.location}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Experience</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.years_experience} years</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Timezone</p>
              <p className="font-medium text-slate-800 mt-1 break-words">{selectedCandidate.timezone}</p>
            </div>

            {languages.length > 0 && (
              <div className="col-span-2 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Languages</p>
                <p className='font-medium text-slate-800 mt-1'>{languages.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3 bg-blue-500 text-white py-2 px-3 rounded-lg shadow-md uppercase tracking-wide">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2 mb-4 pl-1">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-300 shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3 bg-blue-500 text-white py-2 px-3 rounded-lg shadow-md uppercase tracking-wide">
            Work Details
          </h3>
          <div className="grid grid-cols-2 gap-4 pl-1">
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Work Preference</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.work_preference}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Relocation</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.willing_to_relocate ? 'Yes' : 'No'}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Availability</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.availability_weeks} weeks</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Notice Period</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.notice_period_weeks} weeks</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Remote Experience</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.remote_experience_years} years</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Contract</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.open_to_contract ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3 bg-blue-500 text-white py-2 px-3 rounded-lg shadow-md uppercase tracking-wide">
            Education & Background
          </h3>
          <div className="space-y-3 pl-1">
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Education</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.education_level} in {selectedCandidate.degree_major}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Visa Status</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.visa_status}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Citizenship</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.citizenships}</p>
            </div>
          </div>
        </div>

        {selectedCandidate.summary && (
          <div className=''>
            <h3 className="text-sm font-bold mb-3 bg-blue-500 text-white py-2 px-3 rounded-lg shadow-md uppercase tracking-wide">
              Summary
            </h3>
            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm ml-1">
              <p className="text-sm text-slate-700 leading-relaxed">{selectedCandidate.summary}</p>
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div>
            <h3 className="text-sm font-bold mb-3 bg-blue-500 text-white py-2 px-3 rounded-lg shadow-md uppercase tracking-wide">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2 pl-1">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-300 shadow-sm capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold mb-3 bg-blue-500 text-white py-2 px-3 rounded-lg shadow-md uppercase tracking-wide">
            Links & Activity
          </h3>
          <div className="grid grid-cols-2 gap-4 pl-1">
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Last Active</p>
              <p className="font-medium text-slate-800 mt-1">{selectedCandidate.last_active}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">LinkedIn</p>
              <a
                href={selectedCandidate.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium mt-1 inline-block transition-colors duration-200"
              >
                Profile Link
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}