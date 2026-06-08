import { useState } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import { generateQuiz } from '../../lib/quiz-engine';
import type { QuizQuestion } from '../../lib/types';

export function QuizMode() {
  const result = useMAGStore(s => s.result);
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const start = () => {
    if (!result) return;
    setQuestions(generateQuiz(result));
    setQIdx(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
  };

  if (!result) return null;

  if (questions.length === 0) {
    return (
      <button
        onClick={start}
        className="px-6 py-3 rounded-xl font-bold text-white"
        style={{ background: 'var(--accent)', border: 'none', cursor: 'pointer' }}
      >
        {tr.quiz.start}
      </button>
    );
  }

  if (finished) {
    return (
      <div className="text-center p-6">
        <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent2)' }}>{tr.quiz.complete}</div>
        <div className="text-4xl font-mono font-bold mb-4" style={{ color: 'var(--green)' }}>
          {tr.quiz.score}: {score}/{questions.length}
        </div>
        <button onClick={start} className="px-4 py-2 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }}>
          {tr.quiz.tryAgain}
        </button>
      </div>
    );
  }

  const q = questions[qIdx];

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    const correct = idx === q.correctIndex;
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setQIdx(i => i + 1);
        setAnswered(null);
      } else {
        setFinished(true);
      }
    }, 1500);
  };

  return (
    <div>
      <div className="text-xs mb-4" style={{ color: 'var(--text2)' }}>
        {tr.quiz.question} {qIdx + 1}/{questions.length}
      </div>
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>{q.question}</h3>
      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          let bg = 'var(--surface2)';
          let border = 'var(--border)';
          if (answered !== null) {
            if (i === q.correctIndex) { bg = 'rgba(34,197,94,0.15)'; border = 'var(--green)'; }
            else if (i === answered) { bg = 'rgba(239,68,68,0.15)'; border = 'var(--red)'; }
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered !== null}
              className="text-left p-3 rounded-xl text-sm font-mono"
              style={{ background: bg, border: `1px solid ${border}`, color: 'var(--text)', cursor: answered !== null ? 'default' : 'pointer' }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered !== null && (
        <p className="text-sm mt-4 p-3 rounded-xl" style={{ background: 'var(--surface2)', color: 'var(--text2)' }}>
          {answered === q.correctIndex ? `✅ ${tr.quiz.correct}` : `❌ ${tr.quiz.wrong}`} {q.explanation}
        </p>
      )}
    </div>
  );
}
