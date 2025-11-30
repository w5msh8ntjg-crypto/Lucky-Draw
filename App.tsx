import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DrawStatus } from './types';
import { PARTICIPANTS_LIST, TITLE } from './constants';
import { soundManager } from './utils/sound';
import Confetti from './components/Confetti';

// SVG Icons
const RefreshCwIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 animate-bounce">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export default function App() {
  const [status, setStatus] = useState<DrawStatus>(DrawStatus.IDLE);
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<string | null>(null);
  
  // Timer Ref to clear intervals if needed
  const timerRef = useRef<number | null>(null);

  const startDraw = useCallback(() => {
    // 1. Reset State
    setWinner(null);
    setCountdown(3);
    setStatus(DrawStatus.COUNTDOWN);
    
    // 2. Initialize Sound Context (browser requires user gesture)
    soundManager.resume();

    // 3. Start Countdown Logic
    let currentCount = 3;
    soundManager.playBeep(currentCount);

    timerRef.current = window.setInterval(() => {
      currentCount -= 1;
      
      if (currentCount > 0) {
        setCountdown(currentCount);
        soundManager.playBeep(currentCount);
      } else {
        // Stop timer
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Pick Winner
        const randomIndex = Math.floor(Math.random() * PARTICIPANTS_LIST.length);
        const selectedWinner = PARTICIPANTS_LIST[randomIndex];
        
        setWinner(selectedWinner);
        setStatus(DrawStatus.WINNER);
        soundManager.playWin();
      }
    }, 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {status === DrawStatus.WINNER && <Confetti />}

      <main className="z-10 w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-8 text-center transition-all duration-500 transform hover:scale-[1.01]">
          
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8 tracking-wide">
            {TITLE}
          </h1>

          <div className="min-h-[250px] flex flex-col items-center justify-center mb-8 relative">
            
            {/* IDLE STATE: SHOW LIST */}
            {status === DrawStatus.IDLE && (
              <div className="w-full animate-in fade-in zoom-in duration-300">
                <p className="text-slate-400 text-sm mb-4 uppercase tracking-wider font-semibold">Participants</p>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {PARTICIPANTS_LIST.map((name, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-700/50 p-3 rounded-lg text-slate-200 border border-slate-600 hover:border-purple-500/50 transition-colors flex items-center justify-center"
                    >
                      <span className="font-medium">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COUNTDOWN STATE */}
            {status === DrawStatus.COUNTDOWN && (
              <div className="flex flex-col items-center animate-in zoom-in duration-200">
                <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tabular-nums">
                  {countdown}
                </div>
                <p className="text-purple-400 mt-4 animate-pulse font-medium">Drawing...</p>
              </div>
            )}

            {/* WINNER STATE */}
            {status === DrawStatus.WINNER && winner && (
              <div className="animate-in zoom-in slide-in-from-bottom-10 duration-500 w-full">
                <TrophyIcon />
                <p className="text-slate-400 text-sm uppercase tracking-widest mb-2 font-semibold">The Winner Is</p>
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px] rounded-xl shadow-lg shadow-purple-500/30">
                  <div className="bg-slate-900 rounded-[10px] p-6">
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight break-words">
                      {winner}
                    </h2>
                  </div>
                </div>
                <p className="text-slate-500 text-xs mt-6">Congratulations!</p>
              </div>
            )}
          </div>

          <button
            onClick={startDraw}
            disabled={status === DrawStatus.COUNTDOWN}
            className={`
              w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-all duration-200
              ${status === DrawStatus.COUNTDOWN 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0'
              }
            `}
          >
            {status === DrawStatus.IDLE ? (
              <>
                <PlayIcon /> Start Draw
              </>
            ) : status === DrawStatus.COUNTDOWN ? (
              <span className="animate-pulse">Wait for it...</span>
            ) : (
              <>
                <RefreshCwIcon /> Draw Again
              </>
            )}
          </button>
        </div>
        
        <div className="mt-8 text-center text-slate-600 text-xs">
          Powered by React & Tailwind
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8); 
        }
      `}</style>
    </div>
  );
}