"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Loader2, Calendar as CalendarIcon, CheckCircle, AlertCircle } from "lucide-react";

export default function BookingForm() {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Ranges that are HARD blocked (Approved)
    const [blockedRanges, setBlockedRanges] = useState<{ start: Date; end: Date }[]>([]);
    // Ranges that are Pending (Yellow warning)
    const [pendingRanges, setPendingRanges] = useState<{ start: Date; end: Date }[]>([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await fetch("/api/availability");
                if (res.ok) {
                    const data = await res.json();

                    const approved: { start: Date; end: Date }[] = [];
                    const pending: { start: Date; end: Date }[] = [];

                    data.forEach((r: { start: string; end: string; status: string }) => {
                        const parseDate = (str: string) => {
                            const [y, m, d] = str.split('-').map(Number);
                            return new Date(y, m - 1, d);
                        };

                        const s = parseDate(r.start);
                        const e = parseDate(r.end);

                        // Subtract 1 day from end date for overnight logic
                        const adjustedEnd = new Date(e);
                        adjustedEnd.setDate(adjustedEnd.getDate() - 1);

                        const range = { start: s, end: adjustedEnd };

                        if (r.status === 'Approved') {
                            approved.push(range);
                        } else {
                            pending.push(range);
                        }
                    });

                    setBlockedRanges(approved);
                    setPendingRanges(pending);
                }
            } catch (e) {
                console.error("Failed to fetch blocked dates", e);
            }
        };
        fetchAvailability();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate || !name || !email) {
            setErrorMessage("Please fill in all required fields.");
            return;
        }

        setStatus("loading");
        setErrorMessage("");

        try {
            const res = await fetch("/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    startDate,
                    endDate,
                    notes,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setStatus("success");
            setName("");
            setEmail("");
            setNotes("");
            setStartDate(null);
            setEndDate(null);
        } catch (error: any) {
            setStatus("error");
            setErrorMessage(error.message);
        }
    };

    const onChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    // Function to assign classes to days
    const getDayClass = (date: Date) => {
        // Check if date is in pending ranges
        const isPending = pendingRanges.some(range =>
            date >= range.start && date <= range.end
        );
        if (isPending) return "pending-date";
        return "";
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-stone-200/60">
            <h3 className="text-2xl font-bold text-stone-900 mb-6 font-display">
                Request to Stay
            </h3>

            {status === "success" ? (
                <div className="text-center py-10 space-y-4">
                    <div className="flex justify-center">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <h4 className="text-xl font-semibold text-stone-900">Request Sent!</h4>
                    <p className="text-stone-600">
                        We've received your booking request. Check your email for confirmation.
                    </p>
                    <button
                        onClick={() => setStatus("idle")}
                        className="mt-4 px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
                    >
                        Make another request
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-stone-700">Dates</label>
                        <div className="relative">
                            <DatePicker
                                selected={startDate}
                                onChange={onChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                minDate={new Date()}
                                excludeDateIntervals={blockedRanges}
                                dayClassName={getDayClass}
                                placeholderText="Select check-in & check-out"
                                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition-all"
                                calendarClassName="!border-0 !shadow-lg !font-sans !rounded-xl overflow-hidden"
                            />
                            <CalendarIcon className="w-5 h-5 text-stone-400 absolute left-3 top-3.5 pointer-events-none" />
                        </div>
                        {pendingRanges.length > 0 && (
                            <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-200 inline-block" /> Yellow dates are pending but can still be requested
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-stone-700">Your Details</label>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition-all placeholder:text-stone-400"
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition-all placeholder:text-stone-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-stone-700">
                            Notes <span className="text-stone-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            placeholder="Any special requests or details?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition-all placeholder:text-stone-400 resize-none"
                        />
                    </div>

                    {status === "error" && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full flex justify-center items-center py-3 px-4 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                    >
                        {status === "loading" ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Sending Request...
                            </>
                        ) : (
                            "Request Booking"
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
