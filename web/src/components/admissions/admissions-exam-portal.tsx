"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/shared/constants";
import { apiGet, apiPatch } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type ExamQuestion = {
  id: string;
  subject: string;
  question: string;
  options: string[];
};

type ExamSession = {
  admission: {
    reference: string;
    applicantName: string;
    status: string;
    examStatus: string;
    examScore?: number;
    examSetup?: { examDate: string; examTime: string; venue: string };
  };
  config: { durationMinutes: number; subjects: string[]; passingScore: number };
  questions: ExamQuestion[];
};

export function AdmissionsExamPortal({ reference }: { reference: string }) {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<ExamSession>(`${API_ENDPOINTS.ADMISSIONS}/reference/${encodeURIComponent(reference)}/exam`);
      setSession(data);
      setSecondsLeft(data.config.durationMinutes * 60);
      setSubmitted(data.admission.examStatus === "completed");
    } catch {
      setError("Exam session not available.");
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!started || submitted || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, submitted, secondsLeft]);

  const grouped = useMemo(() => {
    if (!session) return [];
    const map = new Map<string, ExamQuestion[]>();
    for (const q of session.questions) {
      const list = map.get(q.subject) ?? [];
      list.push(q);
      map.set(q.subject, list);
    }
    return [...map.entries()];
  }, [session]);

  const onStart = async () => {
    await apiPatch(`${API_ENDPOINTS.ADMISSIONS}/reference/${encodeURIComponent(reference)}/exam`, { action: "start" });
    setStarted(true);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await apiPatch(`${API_ENDPOINTS.ADMISSIONS}/reference/${encodeURIComponent(reference)}/exam`, {
        action: "submit",
        answers,
      });
      setSubmitted(true);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <p className="mt-4 font-semibold">{error || "Unable to load exam"}</p>
        <Link href={`/admissions/status/${encodeURIComponent(reference)}`} className="mt-4 inline-block text-sm text-brand-purple hover:underline">
          Back to status
        </Link>
      </div>
    );
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-green/30 bg-green/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green" />
        <h2 className="mt-4 font-display text-xl font-bold">Exam submitted</h2>
        {session.admission.examScore != null ? (
          <p className="mt-2 text-3xl font-bold">{session.admission.examScore}%</p>
        ) : null}
        <p className="mt-2 text-sm text-marketing-muted">
          Results are reviewed by {session.config.passingScore}% pass threshold. Check back in 1–2 days on your status page.
        </p>
        <Link href={`/admissions/status/${encodeURIComponent(reference)}`} className="auth-btn-primary mt-6 inline-flex">
          View application status
        </Link>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-8">
        <h1 className="font-display text-2xl font-bold">Entrance examination</h1>
        <p className="mt-2 text-sm text-marketing-muted">{session.admission.applicantName} · {session.admission.reference}</p>
        {session.admission.examSetup ? (
          <dl className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-marketing-muted">Date</dt><dd className="font-semibold">{session.admission.examSetup.examDate}</dd></div>
            <div><dt className="text-marketing-muted">Time</dt><dd className="font-semibold">{session.admission.examSetup.examTime}</dd></div>
            <div className="sm:col-span-2"><dt className="text-marketing-muted">Venue</dt><dd className="font-semibold">{session.admission.examSetup.venue}</dd></div>
          </dl>
        ) : null}
        <ul className="mt-4 list-inside list-disc text-sm text-marketing-muted">
          <li>Duration: {session.config.durationMinutes} minutes</li>
          <li>Subjects: {session.config.subjects.join(", ")}</li>
          <li>{session.questions.length} questions — CBT format</li>
        </ul>
        <Button onClick={onStart} className="mt-6 rounded-full bg-brand-purple text-white">
          Start examination
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="sticky top-4 z-10 flex items-center justify-between rounded-xl border border-marketing-grid bg-marketing-surface px-4 py-3 shadow-sm">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-brand-purple" />
          {mins}:{String(secs).padStart(2, "0")}
        </span>
        <span className="text-xs text-marketing-muted">{Object.keys(answers).length} / {session.questions.length} answered</span>
        <Button size="sm" onClick={onSubmit} disabled={submitting} className="rounded-full bg-brand-purple text-white">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit exam"}
        </Button>
      </div>

      {grouped.map(([subject, questions]) => (
        <section key={subject} className="rounded-2xl border border-marketing-grid/80 bg-marketing-surface p-6">
          <h2 className="font-display text-lg font-bold text-brand-purple">{subject}</h2>
          <ul className="mt-4 space-y-6">
            {questions.map((q, qi) => (
              <li key={q.id}>
                <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={opt}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                        answers[q.id] === oi ? "border-brand-purple bg-brand-purple/5" : "border-marketing-grid/60",
                      )}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === oi}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
