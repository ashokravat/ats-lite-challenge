import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStore } from '../store';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { Candidate, ConversationalResponse, FilterPlan, ProcessingPlans, RankingPlan, Stats } from '@/types';

interface TimelineStep {
  id: string;
  label: string;
  emoji: string;
  data?: FilterPlan | RankingPlan | ProcessingPlans | Stats | ConversationalResponse | Candidate[] | string | number[] | boolean | null;
  showJson?: boolean;
  complete: boolean;
}

export default function TimelineSidebar() {
  const {
    currentStep,
    timelineVisible,
    toggleTimeline,
    filterPlan,
    filteredCandidates,
    setTimelineVisible,
    rankPlan,
    rankedCandidates,
  } = useStore();

  const [visibleStepIndex, setVisibleStepIndex] = useState(-1);
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState<number | null>(null);

  const steps: TimelineStep[] = [
    {
      id: 'thinking',
      label: 'Filter Plan Ready',
      emoji: '🔍',
      data: filterPlan,
      showJson: true,
      complete: !!filterPlan
    },
    {
      id: 'filtering',
      label: `${filteredCandidates.length} Rows Matched`,
      emoji: '📊',
      complete: filteredCandidates.length > 0
    },
    {
      id: 'ranking',
      label: 'Ranking Plan Ready',
      emoji: '🏆',
      data: rankPlan,
      showJson: true,
      complete: !!rankPlan
    },
    {
      id: 'speaking',
      label: 'Ranked IDs Ready',
      emoji: '✨',
      data: rankedCandidates.map(c => c.id).slice(0, 10),
      showJson: true,
      complete: rankedCandidates.length > 0
    }
  ];

  // handle next step when ready
  useEffect(() => {
    const nextIndex = visibleStepIndex + 1;
    if (nextIndex < steps.length && steps[nextIndex].complete) {
      const timeout = setTimeout(() => {
        setVisibleStepIndex(nextIndex);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [
    steps[0].complete,
    steps[1].complete,
    steps[2].complete,
    steps[3].complete,
    visibleStepIndex
  ]);

  useEffect(() => {
    if (visibleStepIndex > -1 && !timelineVisible && !hasAutoExpanded) {
      setTimelineVisible(true);
      setHasAutoExpanded(true);
    }
  }, [visibleStepIndex, timelineVisible, hasAutoExpanded, setTimelineVisible]);

  const getStepColors = (step: TimelineStep) => {
    if (currentStep === step.id && !step.complete) {
      return {
        border: 'border-l-indigo-500',
        bg: 'bg-gradient-to-r from-indigo-50 to-purple-50',
        shadow: 'shadow-lg shadow-indigo-100',
        pulse: 'animate-pulse'
      };
    } else if (step.complete) {
      return {
        border: 'border-l-blue-400',
        bg: 'bg-gradient-to-r from-blue-50 to-blue-50',
        pulse: ''
      };
    } else {
      return {
        border: 'border-l-slate-300',
        bg: 'bg-white',
        shadow: 'shadow-sm',
        pulse: ''
      };
    }
  };

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key="sidebar"
        initial={false}
        animate={{
          width: timelineVisible ? 320 : 60,
          transition: { duration: 0.4, ease: "easeInOut" }
        }}
        className={`h-full bg-gradient-to-b from-slate-50 to-white overflow-hidden border-r border-slate-200 relative time-line-sidebar ${timelineVisible ? "collapse_sidebar" : "expand_sidebar"}`}
      >
        <button
          onClick={toggleTimeline}
          className="absolute top-4 right-4 p-2 bg-white hover:bg-slate-100 rounded-full shadow-md border border-slate-200 z-10 transition-all duration-200 hover:shadow-lg"
          aria-label={timelineVisible ? "Collapse sidebar" : "Expand sidebar"}
        >
          <motion.div
            transition={{ duration: 0.3 }}
          >
            {timelineVisible ? "«" : "»"}
          </motion.div>
        </button>

        <AnimatePresence mode="wait">
          {timelineVisible ? (
            <motion.div
              key="expanded-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 h-full overflow-y-auto"
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-xl text-slate-800">Timeline</h3>
                </div>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => {
                  if (index > visibleStepIndex) return null;
                  const colors = getStepColors(step);

                  return (
                    <AnimatePresence key={step.id}>
                      <div className={`p-4 rounded-xl ${colors.bg} border-l-4 ${colors.border} ${colors.pulse} transition-all duration-300 border border-blue-200`}>
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                              {step.complete ? (
                                <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                              ) : currentStep === step.id ? (
                                <AutorenewIcon className="w-5 h-5 text-indigo-500 animate-spin" />
                              ) : (
                                <span className="text-lg">{step.emoji}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-white bg-blue-500 px-2 py-1 rounded-full">
                                  Step {index + 1}
                                </span>
                              </div>
                              <p className="font-semibold text-slate-800 text-sm leading-relaxed">
                                {step.label}
                              </p>
                            </div>
                          </div>

                          {step.showJson && step.complete && (
                            <button
                              onClick={() =>
                                setAccordionOpen(accordionOpen === index ? null : index)
                              }
                              className="p-1.5 hover:bg-white rounded-lg transition-colors duration-200 text-slate-600 hover:text-slate-800"
                            >
                              <motion.div
                                animate={{ rotate: accordionOpen === index ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ExpandMoreIcon className="w-5 h-5" />
                              </motion.div>
                            </button>
                          )}
                        </div>

                        {step.showJson && step.complete && (
                          <AnimatePresence initial={false}>
                            {accordionOpen === index && (
                              <motion.div
                                key="accordion"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="mt-3 overflow-hidden"
                              >
                                <div className="bg-slate-800 rounded-lg p-3 border">
                                  <pre className="text-xs text-green-400 font-mono overflow-x-auto max-h-40 leading-relaxed">
                                    {JSON.stringify(step.data, null, 2)}
                                  </pre>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}

                        {currentStep === step.id && !step.complete && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 flex items-center gap-3 p-2 bg-white/70 rounded-lg"
                          >
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-sm font-medium text-indigo-700">Processing...</span>
                          </motion.div>
                        )}
                      </div>
                    </AnimatePresence>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full pt-[100px]"
            >
              <motion.div
                className="transform -rotate-90 whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-slate-600 font-bold text-sm tracking-wider">TIMELINE</span>
              </motion.div>

              <div className="mt-12 flex flex-col space-y-4 items-center">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${index <= visibleStepIndex
                        ? currentStep === step.id
                          ? 'bg-indigo-500 border-indigo-200 shadow-lg shadow-indigo-200 animate-pulse'
                          : 'bg-blue-400 border-blue-200 shadow-md shadow-blue-100'
                        : 'bg-white border-slate-300'
                        }`}
                      title={step.label}
                    />
                    {index < steps.length - 1 && (
                      <div className={`absolute top-6 left-1/2 w-0.5 h-8 transform -translate-x-1/2 transition-colors duration-300 ${index < visibleStepIndex ? 'bg-blue-200' : 'bg-slate-200'
                        }`} />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}