import type { CalculationResult, QuizQuestion } from './types';

export function generateQuiz(result: CalculationResult): QuizQuestion[] {
  const { summary, orderResults, activityData } = result;
  const questions: QuizQuestion[] = [];
  const critPath = activityData.criticalPath;

  questions.push({
    id: 'q1', type: 'optimal-t',
    question: 'Cât este durata optimă a proiectului (T)?',
    options: [
      `${summary.minT} zile`,
      `${summary.minT + 2} zile`,
      `${summary.maxT} zile`,
      `${Math.round((summary.minT + summary.maxT) / 2)} zile`,
    ],
    correctIndex: 0,
    explanation: `Durata optimă este ${summary.minT} zile, obținută cu ${summary.optimalCount} din ${summary.totalPerms} ordini posibile.`,
  });

  const critCountStr = `${summary.critCount}`;
  const critPool = [critCountStr, `${summary.critCount + 1}`, `${summary.critCount + 2}`, `${Math.max(1, summary.critCount - 1)}`, `${summary.critCount + 3}`];
  const critOptions = [...new Set(critPool)].slice(0, 4);
  while (critOptions.length < 4) critOptions.push(`${summary.critCount + critOptions.length + 4}`);
  const critShuffled = [...critOptions].sort(() => Math.random() - 0.5);
  const critCorrectIdx = critShuffled.indexOf(critCountStr);
  questions.push({
    id: 'q2', type: 'critical-path',
    question: 'Câte activități critice are proiectul (pe ordinea primară)?',
    options: critShuffled,
    correctIndex: critCorrectIdx >= 0 ? critCorrectIdx : 0,
    explanation: `Sunt ${summary.critCount} activități critice cu R=0: ${critPath.join(', ')}.`,
  });

  const worstOrder = orderResults.reduce((a, b) => (a.T > b.T ? a : b));
  const worstKey = worstOrder.order.join('→');
  const others = orderResults.filter(r => r.order.join('→') !== worstKey);
  const optOrders = [worstOrder, ...others.slice(0, 3)];
  const orderLabels = optOrders.map(r => r.order.join('→'));
  const orderShuffled = [...orderLabels].sort(() => Math.random() - 0.5);
  const orderCorrectIdx = orderShuffled.indexOf(worstKey);
  questions.push({
    id: 'q3', type: 'optimal-order',
    question: 'Care este cea mai proastă ordine de execuție (din opțiunile afișate)?',
    options: orderShuffled,
    correctIndex: orderCorrectIdx >= 0 ? orderCorrectIdx : 0,
    explanation: `Ordinea ${worstKey} are T=${worstOrder.T}, cu ${worstOrder.T - summary.minT} zile mai mult decât optima.`,
  });

  const budgetOptions = [
    `${summary.totalBuget} mii lei`,
    `${summary.totalBuget + 100} mii lei`,
    `${summary.totalBuget - 60} mii lei`,
    `${summary.totalBuget + 200} mii lei`,
  ];
  questions.push({
    id: 'q4', type: 'budget',
    question: 'Cât este bugetul total al proiectului?',
    options: budgetOptions,
    correctIndex: 0,
    explanation: `Bugetul total este ${summary.totalBuget} mii lei (suma B pe toate activitățile).`,
  });

  const nonCrit = activityData.activities.filter(a => !a.isCritical);
  if (nonCrit.length > 0) {
    const pick = nonCrit[Math.floor(Math.random() * nonCrit.length)];
    const correct = `${pick.totalSlack}`;
    const wrongSet = new Set([correct, `${pick.totalSlack + 2}`, `${pick.totalSlack + 5}`, `${pick.totalSlack + 10}`, '0']);
    const opts = [...wrongSet].slice(0, 4);
    while (opts.length < 4) opts.push(`${pick.totalSlack + opts.length + 3}`);
    const shuffled = [...opts].sort(() => Math.random() - 0.5);
    const correctIdx = shuffled.indexOf(correct);
    questions.push({
      id: 'q5', type: 'reserve-value',
      question: `Cât este rezerva totală R pentru activitatea ${pick.id}?`,
      options: shuffled,
      correctIndex: correctIdx >= 0 ? correctIdx : 0,
      explanation: `R(${pick.id}) = tm - tt = ${pick.lateFinish} - ${pick.earlyFinish} = ${pick.totalSlack}.`,
    });
  }

  return questions;
}
