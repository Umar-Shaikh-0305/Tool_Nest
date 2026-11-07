"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface LineItem {
  description: string;
  qty: number;
  rate: number;
}

export default function InvoiceGeneratorPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", qty: 1, rate: 0 }]);
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("$");

  const addItem = () => setItems([...items, { description: "", qty: 1, rate: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof LineItem, val: string | number) =>
    setItems(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  const subtotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 20, 25);
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${invoiceNo}`, 20, 40);
    if (dueDate) doc.text(`Due: ${dueDate}`, 20, 48);
    doc.text("From:", 20, 62); doc.text(from || "—", 20, 70);
    doc.text("To:", 110, 62); doc.text(to || "—", 110, 70);
    let y = 90;
    doc.setFont("helvetica", "bold");
    doc.text("Description", 20, y); doc.text("Qty", 120, y); doc.text("Rate", 145, y); doc.text("Amount", 170, y);
    doc.line(20, y + 3, 190, y + 3);
    y += 12; doc.setFont("helvetica", "normal");
    items.forEach((item) => {
      doc.text(item.description || "—", 20, y, { maxWidth: 90 });
      doc.text(String(item.qty), 120, y);
      doc.text(`${currency}${Number(item.rate).toFixed(2)}`, 145, y);
      doc.text(`${currency}${(Number(item.qty) * Number(item.rate)).toFixed(2)}`, 170, y);
      y += 10;
    });
    doc.line(20, y + 2, 190, y + 2); y += 12;
    doc.text(`Subtotal: ${currency}${subtotal.toFixed(2)}`, 140, y); y += 8;
    doc.text(`Tax (10%): ${currency}${tax.toFixed(2)}`, 140, y); y += 8;
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${currency}${total.toFixed(2)}`, 140, y);
    if (notes) { y += 16; doc.setFont("helvetica", "normal"); doc.text(`Notes: ${notes}`, 20, y, { maxWidth: 170 }); }
    doc.save(`invoice-${invoiceNo}-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const fieldClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Invoice Generator</h1>
            <p className="text-slate-500 text-sm">Create and download a professional PDF invoice instantly.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Invoice #</label><input className={fieldClass} value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} /></div>
            <div><label className={labelClass}>Due Date</label><input type="date" className={fieldClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>From (Your Name / Company)</label><textarea rows={3} className={fieldClass + " resize-none"} value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Your name&#10;Address&#10;Email" /></div>
            <div><label className={labelClass}>Bill To (Client)</label><textarea rows={3} className={fieldClass + " resize-none"} value={to} onChange={(e) => setTo(e.target.value)} placeholder="Client name&#10;Address&#10;Email" /></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass + " mb-0"}>Line Items</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Currency:</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-violet-400">
                  {["$", "€", "£", "₹", "¥"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center p-3 sm:p-0 rounded-xl bg-slate-50 sm:bg-transparent border border-slate-200 sm:border-0">
                  <input placeholder="Description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)}
                    className={fieldClass + " flex-1"} />
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                      placeholder="Qty" className={fieldClass + " w-20 text-center"} />
                    <input type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(i, "rate", Number(e.target.value))}
                      placeholder="Rate" className={fieldClass + " w-28 text-center"} />
                    <span className="text-sm font-semibold text-slate-700 min-w-16 text-right">{currency}{(Number(item.qty) * Number(item.rate)).toFixed(2)}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-2.5 flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-semibold">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{currency}{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Tax (10%)</span><span>{currency}{tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-200"><span>Total</span><span>{currency}{total.toFixed(2)}</span></div>
          </div>

          <div><label className={labelClass}>Notes</label><textarea rows={2} className={fieldClass + " resize-none"} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, bank details, or thank you note..." /></div>

          <button onClick={downloadPdf}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Download PDF Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
