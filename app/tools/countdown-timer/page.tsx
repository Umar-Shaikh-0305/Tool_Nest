"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function CountdownTimerPage() {
  const [targetDate, setTargetDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (!targetDate) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      setTimeLeft({
        total: diff,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const save = () => timeLeft && downloadTextReport("countdown-timer", "Countdown Timer", {
    Event: eventName || "Unnamed",
    Target: targetDate,
    Remaining: `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`,
  });

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Countdown Timer</h1>
          <p className="text-slate-500 text-sm mb-6">Count down to any date, launch, or milestone.</p>

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Name (optional)</label>
              <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Product Launch"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Date & Time</label>
              <input type="datetime-local" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
          </div>

          <button onClick={start} disabled={!targetDate}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors mb-6">
            Start Countdown
          </button>

          {timeLeft !== null && (
            <>
              {eventName && <p className="text-center font-bold text-slate-800 mb-4 text-base">{eventName}</p>}
              {timeLeft.total === 0 ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-2">🎉</div>
                  <p className="text-xl font-bold text-violet-600">Event is here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                  {[
                    { label: "Days", val: timeLeft.days },
                    { label: "Hours", val: timeLeft.hours },
                    { label: "Mins", val: timeLeft.minutes },
                    { label: "Secs", val: timeLeft.seconds }
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-violet-50 border border-violet-100 rounded-2xl p-2.5 sm:p-4">
                      <div className="text-2xl sm:text-3xl font-extrabold text-violet-700">{pad(val)}</div>
                      <div className="text-[11px] sm:text-xs text-violet-600 font-semibold mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={save}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 text-sm font-semibold transition-colors border border-slate-200">
                <Download className="w-4 h-4" /> Save
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
