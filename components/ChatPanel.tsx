import SendIcon from '@mui/icons-material/Send';
import TextField from '@mui/material/TextField';
import { FormEvent, useCallback, useEffect, useRef } from "react";
import { generatePlans, generateSummary } from "../lib/api";
import {
  generateConversationalResponse,
  isGreeting,
} from "../lib/greetings";
import {
  aggregateStats,
  rankCandidates,
  filterCandidates,
} from "../lib/tools";
import { useStore } from "../store";
import { ProcessingPlans } from "../types";
import ShimmerLoading from "./ShimmerLoading";
import TypeAnimation from './TypeAnimation';
import toast from 'react-hot-toast';
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPanel() {
  const {
    candidates,
    query,
    setQuery,
    loading,
    setLoading,
    setCurrentStep,
    setFilterPlan,
    setFilteredCandidates,
    setRankPlan,
    setRankedCandidates,
    setStats,
    setHasLoadedOnce,
    messages,
    addMessage,
  } = useStore();

  const MAX_RETRIES = 3;
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to generate a unique ID for each message based on its content and index
  const getMessageKey = useCallback((message: Message, index: number) => {
    const contentSample = message.content.slice(0, 20).replace(/\s+/g, '');
    return `msg-${contentSample}-${index}`;
  }, []);

  // Check message has already been animated or not
  const isMessageAnimated = useCallback((message: Message, index: number) => {
    const key = getMessageKey(message, index);
    try {
      return localStorage.getItem(`animated-${key}`) === 'true';
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [getMessageKey]);

  // Mark a message as animated
  const markMessageAnimated = useCallback((message: Message, index: number) => {
    const key = getMessageKey(message, index);
    try {
      localStorage.setItem(`animated-${key}`, 'true');
    } catch (e) {
      console.warn('Failed to save animation state to localStorage', e);
    }
  }, [getMessageKey]);

  // send message API call
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!query.trim() || loading) return;

    const userMessage = query;
    addMessage({ role: "user", content: userMessage });
    setQuery("");
    setLoading(true);

    if (inputRef.current) {
      inputRef.current?.querySelector('textarea')?.focus();
    }

    try {
      if (isGreeting(userMessage)) {
        const conversationalResponse = await generateConversationalResponse(
          userMessage
        );
        addMessage({ role: "assistant", content: conversationalResponse });
        setLoading(false);
        return;
      }

      setCurrentStep("thinking");
      const headers = Object.keys(candidates[0] || {});

      let plans: ProcessingPlans | null = null;
      let currentRetry = 0;

      while (currentRetry <= MAX_RETRIES && !plans) {
        try {
          plans = await generatePlans(userMessage, headers);
          break;
        } catch (e) {
          console.error(e)
          currentRetry++;
          if (currentRetry > MAX_RETRIES) {
            throw new Error(
              "Failed to generate valid plans after multiple attempts"
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!plans || !plans.filter || !plans.rank) {
        throw new Error("Invalid plan structure received");
      }

      setFilterPlan(plans.filter);
      setRankPlan(plans.rank);

      // ACT 1 - Filter
      setCurrentStep("filtering");
      const hasTitleFilter =
        plans.filter?.include && "title" in plans.filter.include;

      const filtered = filterCandidates(candidates, plans.filter, {
        flexibleMatching:
          !hasTitleFilter && userMessage.toLowerCase().includes("salary"),
        debug: true,
      });
      setFilteredCandidates(filtered);

      // ACT 2 - Rank
      setCurrentStep("ranking");
      const ranked = rankCandidates(filtered, plans.rank);

      const numberWords: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };

      const numberMatch = userMessage.match(
        /\b(get|give|show|find|return|limit)\s+(?:me\s+)?(?:the\s+)?(top\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i
      );

      // Check if the user requested a specific number of candidates
      const requestedCount = numberMatch ?
        (isNaN(parseInt(numberMatch[3])) ?
          (numberMatch[3].toLowerCase() in numberWords ?
            numberWords[numberMatch[3].toLowerCase() as keyof typeof numberWords] :
            null) :
          parseInt(numberMatch[3]))
        : null;
      let rankedAndLimited = ranked;

      if (requestedCount && requestedCount > 0 && requestedCount < ranked.length) {
        rankedAndLimited = ranked.slice(0, requestedCount);
      }

      setRankedCandidates(rankedAndLimited);

      const stats = aggregateStats(ranked);
      setStats(stats);

      // SPEAK
      setCurrentStep("speaking");

      const topCandidates = ranked.slice(0, Math.min(5, ranked.length));
      const summaryStream = await generateSummary(
        userMessage,
        topCandidates,
        stats
      );

      let updateTimer;

      addMessage({ role: "assistant", content: "" });
      let fullContent = "";

      for await (const chunk of summaryStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullContent += content;

        clearTimeout(updateTimer);
        updateTimer = setTimeout(() => {
          useStore.setState((state) => ({
            messages: state.messages.map((msg, idx) =>
              idx === state.messages.length - 1
                ? { ...msg, content: fullContent }
                : msg
            ),
          }));
        }, 100);
      }
      setHasLoadedOnce(true);

    } catch (error) {
      console.error(error)
      toast.error(
        "Sorry, I encountered an error while processing your request. Please try again or rephrase your query."
      );
    } finally {
      setLoading(false);
      setHasLoadedOnce(true);
      setCurrentStep(null);
    }
  };


  // Handle Cmd+Enter keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (query.trim()) {
          const form = document.getElementById("chat-form");
          if (form) {
            e.preventDefault();
            const formEvent = new Event("submit", { cancelable: true });
            form.dispatchEvent(formEvent);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [query]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // handle scroll with last message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages.length, loading]);


  // handle textarea focus
  useEffect(() => {
    inputRef.current?.querySelector('textarea')?.focus();
  }, []);

  return (
    <div className="flex flex-col h-full justify-end bg-gradient-to-b from-slate-50 to-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-[1000px] w-full mx-auto">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const isAITyping = loading && message.role === "assistant" && isLast;

          return (
            <div
              key={index}
              className={`${message.role === "user"
                ? "ml-auto"
                : ""
                } max-w-[90%] w-[fit-content] ${message.role === "assistant" ? "min-w-[200px]" : ""
                }`}
            >
              <div className={`${message.role === "user"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-100"
                : "bg-white border border-slate-200 shadow-md"
                } p-4 rounded-xl transition-all duration-300`}>

                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${message.role === "user"
                    ? "bg-white/20 text-white"
                    : "bg-gradient-to-br from-blue-400 to-indigo-500 text-white"
                    }`}>
                    {message.role === "user" ? "Y" : "AI"}
                  </div>
                  <p className={`text-xs font-semibold ${message.role === "user" ? "text-white" : "text-slate-600"
                    }`}>
                    {message.role === "user" ? "You" : "ATS-Lite"}
                  </p>
                </div>

                {isAITyping ? (
                  <div className="mt-2">
                    <ShimmerLoading />
                  </div>
                ) : (
                  message.role === "assistant" ? (
                    <div className="text-slate-800">
                      <TypeAnimation
                        content={message.content}
                        speed={1}
                        skipAnimation={isMessageAnimated(message, index)}
                        onComplete={() => {
                          markMessageAnimated(message, index);
                          if (scrollRef.current) {
                            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
                          }
                          if (inputRef.current) {
                            inputRef.current?.querySelector('textarea')?.focus();
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-white font-medium">{message.content}</p>
                  )
                )}
              </div>
              <div id="scroll-reference" ref={scrollRef}></div>
            </div>
          );
        })}
      </div>

      {messages.length === 0 && (
        <div className='max-w-[1000px] w-full mx-auto'>
          <p className="text-slate-600 text-lg text-center">What can I help you find today?</p>
        </div>
      )
      }

      <div className="p-6">
        <form id="chat-form" onSubmit={sendMessage} className="max-w-[1000px] w-full mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-2">
            <div className="flex items-end justify-between relative bg-gradient-to-r from-slate-50 to-blue-50 ps-6 pe-2 py-3 rounded-lg border border-slate-100 gap-4">
              <TextField
                ref={inputRef}
                id="outlined-multiline-flexible"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about candidates..."
                className="flex-grow bg-transparent focus:outline-0 !border-none !mb-2"
                multiline
                disabled={loading}
                maxRows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    padding: 0,
                    color: '#1e293b'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: 0,
                    border: 'none'
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#64748b',
                    opacity: 1
                  }
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                className={`bg-blue-500 hover:bg-blue-600 transition-all ease-in-out duration-[0.3s] p-2 w-[44px] h-[44px] grid place-content-center rounded-xl text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={loading}
              >
                <SendIcon fontSize="medium" className="-rotate-45 !w-[20px] !h-[20px] mb-1" />
              </button>
            </div>
            {loading && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs text-blue-600 font-medium">Processing...</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div >
  );
}