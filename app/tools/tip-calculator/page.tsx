"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function TipCalculatorPage() {
  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState(15);
  const [people, setPeople] = useState(1);

  const billNum = parseFloat(bill) || 0;
  const tipAmount = billNum * (tipPct / 100);
  const total = billNum + tipAmount;
  const perPerson = people > 0 ? total / people : 0;
  const tipPerPerson = people > 0 ? tipAmount / people : 0;

  const preset = (p: number) => setTipPct(p);

  const handleSave = () => {
    downloadTextReport("tip-calculator", "Tip Calculator", {
      "Bill Amount": `$${billNum.toFixed(2)}`,
      "Tip Percentage": `${tipPct}%`,
      "Tip Amount": `$${tipAmount.toFixed(2)}`,
      "Total": `$${total.toFixed(2)}`,
      "Number of People": people,
      "Per Person (Total)": `$${perPerson.toFixed(2)}`,
      "Per Person (Tip)": `$${tipPerPerson.toFixed(2)}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Tip Calculator</h1>
          <p className="text-slate-500 text-sm mb-6">Calculate tips and split the bill with your group.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bill Amount ($)</label>
              <input type="number" min="0" step="0.01" value={bill} onChange={(e) => setBill(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-lg font-semibold focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tip Percentage — {tipPct}%</label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {[10, 15, 18, 20, 25].map((p) => (
                  <button key={p} onClick={() => preset(p)}
                    className={`py-2 rounded-xl text-sm font-semibold transition-colors text-center ${
                      tipPct === p ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-violet-50 hover:text-violet-600"
                    }`}>{p}%</button>
                ))}
              </div>
              <input type="range" min="0" max="50" value={tipPct} onChange={(e) => setTipPct(Number(e.target.value))}
                className="w-full accent-violet-600" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Split Between (people)</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setPeople(Math.max(1, people - 1))}
                  className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold hover:bg-violet-50 hover:text-violet-600 transition-colors flex items-center justify-center">−</button>
                <span className="text-2xl font-bold text-slate-900 w-12 text-center">{people}</span>
                <button onClick={() => setPeople(people + 1)}
                  className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold hover:bg-violet-50 hover:text-violet-600 transition-colors flex items-center justify-center">+</button>
              </div>
            </div>
          </div>

          {billNum > 0 && (
            <div className="mt-6 p-5 rounded-2xl bg-violet-50 border border-violet-100 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Bill</span><span className="font-semibold text-slate-800">${billNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tip ({tipPct}%)</span><span className="font-semibold text-slate-800">${tipAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-violet-200 pt-3 flex justify-between font-bold text-slate-900 text-base">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
              {people > 1 && (
                <div className="border-t border-violet-200 pt-3">
                  <div className="flex justify-between text-violet-700 font-bold text-base">
                    <span>Each person pays</span><span>${perPerson.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-violet-600 mt-1">
                    <span>Tip per person</span><span>${tipPerPerson.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={handleSave} className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 text-sm font-semibold transition-colors border border-slate-200">
            <Download className="w-4 h-4" /> Save Results
          </button>
        </div>
      </div>
    </div>
  );
}
