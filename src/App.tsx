import { FormEvent, useEffect, useRef, useState } from 'react';
import { activeParagraph, history6, paragraphs, type Question } from './data/history6';
import { controlWork1 } from './data/controlWork1';
import { knowledgeBase } from './data/knowledgeBase';

type Tab = 'today' | 'topics' | 'timeline';
type View = 'tabs' | 'paragraph' | 'control' | 'settings';

type Profile = {
  goalName: string;
  goalAmount: number;
  externalSavings: number;
  earnedQuestionIds: string[];
};

const initialProfile: Profile = {
  goalName: 'Моя цель',
  goalAmount: 80000,
  externalSavings: 11000,
  earnedQuestionIds: [],
};

function loadProfile(): Profile {
  try {
    const saved = localStorage.getItem('history-study-profile');
    return saved ? { ...initialProfile, ...JSON.parse(saved) } : initialProfile;
  } catch {
    return initialProfile;
  }
}

function ProgressBar({ value }: { value: number }) {
  return <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [view, setView] = useState<View>('tabs');
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [selectedParagraphId, setSelectedParagraphId] = useState('from-antiquity');
  const titleTapTimes = useRef<number[]>([]);
  const selectedParagraph = paragraphs.find((paragraph) => paragraph.id === selectedParagraphId) ?? activeParagraph;
  const selectedChapter = knowledgeBase.chapters.find((chapter) => chapter.lessons.some((lesson) => lesson.id === selectedParagraph.id)) ?? knowledgeBase.chapters[0];

  useEffect(() => {
    localStorage.setItem('history-study-profile', JSON.stringify(profile));
  }, [profile]);

  const allQuestions = [...paragraphs.flatMap((paragraph) => paragraph.questions), ...controlWork1.variants.flatMap((variant) => variant.questions)];
  const earnedPoints = allQuestions
    .filter((question) => profile.earnedQuestionIds.includes(question.id))
    .reduce((total, question) => total + question.points, 0);
  const studySavings = Math.floor(earnedPoints / 500) * 500;
  const totalSavings = profile.externalSavings + studySavings;
  const goalProgress = profile.goalAmount > 0 ? (totalSavings / profile.goalAmount) * 100 : 0;
  const completedQuestions = selectedParagraph.questions.filter((question) => profile.earnedQuestionIds.includes(question.id)).length;
  const remainingPoints = selectedParagraph.questions
    .filter((question) => !profile.earnedQuestionIds.includes(question.id))
    .reduce((sum, question) => sum + question.points, 0);

  const award = (question: Question) => {
    setProfile((current) => current.earnedQuestionIds.includes(question.id)
      ? current
      : { ...current, earnedQuestionIds: [...current.earnedQuestionIds, question.id] });
  };

  // Временный тестовый вход: семь быстрых нажатий на название курса.
  // После появления профилей в Telegram этот сброс будет выполняться сервером
  // только для тестового администратора.
  const handleTestReset = () => {
    const now = Date.now();
    titleTapTimes.current = [...titleTapTimes.current, now].filter((time) => now - time < 2200);
    if (titleTapTimes.current.length < 7) return;
    titleTapTimes.current = [];
    if (window.confirm('Сбросить только очки за задания? Цель и накопления останутся без изменений.')) {
      setProfile((current) => ({ ...current, earnedQuestionIds: [] }));
    }
  };

  if (view === 'paragraph') {
    return <ParagraphScreen paragraph={selectedParagraph} onBack={() => setView('tabs')} profile={profile} award={award} />;
  }
  if (view === 'control') {
    return <ControlWorkScreen onBack={() => setView('tabs')} profile={profile} award={award} />;
  }
  if (view === 'settings') {
    return <SettingsScreen profile={profile} onSave={setProfile} onBack={() => setView('tabs')} />;
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <button className="course-title-trigger" onClick={handleTestReset} aria-label="Название курса">{history6.title}</button>
          <h1>{tab === 'today' ? 'Сегодня' : tab === 'topics' ? 'Темы' : 'Шкала времени'}</h1>
        </div>
        <button className="goal-pill" onClick={() => setView('settings')} aria-label="Открыть цель и накопления">
          <span>◉</span> {earnedPoints} очков
        </button>
      </header>

      {tab === 'today' && (
        <TodayScreen
          goalName={profile.goalName}
          goalAmount={profile.goalAmount}
          goalProgress={goalProgress}
          totalSavings={totalSavings}
          earnedPoints={earnedPoints}
          completedQuestions={completedQuestions}
          remainingPoints={remainingPoints}
          paragraph={selectedParagraph}
          chapter={selectedChapter}
          onContinue={() => setView('paragraph')}
          onSettings={() => setView('settings')}
          onControl={() => setView('control')}
        />
      )}
      {tab === 'topics' && <TopicsScreen onOpen={(paragraphId) => { setSelectedParagraphId(paragraphId); setView('paragraph'); }} />}
      {tab === 'timeline' && <TimelineScreen onOpenParagraph={(paragraphId) => { setSelectedParagraphId(paragraphId); setView('paragraph'); }} />}

      <nav className="tab-bar" aria-label="Основная навигация">
        <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}><span>◷</span>Сегодня</button>
        <button className={tab === 'topics' ? 'active' : ''} onClick={() => setTab('topics')}><span>▤</span>Темы</button>
        <button className={tab === 'timeline' ? 'active' : ''} onClick={() => setTab('timeline')}><span>⌁</span>Шкала времени</button>
      </nav>
    </main>
  );
}

function TodayScreen({ goalName, goalAmount, goalProgress, totalSavings, earnedPoints, completedQuestions, remainingPoints, paragraph, chapter, onContinue, onSettings, onControl }: {
  goalName: string; goalAmount: number; goalProgress: number; totalSavings: number; earnedPoints: number; completedQuestions: number; remainingPoints: number; paragraph: typeof activeParagraph; chapter: typeof knowledgeBase.chapters[number]; onContinue: () => void; onSettings: () => void; onControl: () => void;
}) {
  const remaining = paragraph.questions.length - completedQuestions;
  return <section className="screen-content">
    <button className="savings-card" onClick={onSettings}>
      <div><span className="overline">{goalName}</span><strong>{formatMoney(totalSavings)}</strong><span className="muted">из {formatMoney(goalAmount)}</span></div>
      <div className="savings-progress"><ProgressBar value={goalProgress} /><small>{Math.round(goalProgress)}%</small></div>
    </button>

    <section className="hero-card">
      <span className="chapter-label">Глава {chapter.number} · {chapter.title}</span>
      <p className="paragraph-number">§ {paragraph.number}</p>
      <h2>{paragraph.title}</h2>
      <p>{paragraph.introQuestion}</p>
      <div className="hero-art" aria-hidden="true"><span>VIII</span><i>→</i><span>XI</span></div>
      <button className="primary-button" onClick={onContinue}>
        {completedQuestions ? 'Продолжить тему' : 'Начать тему'} <span>→</span>
      </button>
      <span className="hint">{remaining ? `${remaining} заданий · до +${remainingPoints} очков` : 'Все задания выполнены'}</span>
    </section>

    <section className="small-card">
      <span className="icon-bubble">↻</span>
      <div><strong>Вернись к пройденному</strong><p>Повторение появится здесь после нескольких тем.</p></div>
      <span className="chevron">›</span>
    </section>
    <button className="small-card control-card" onClick={onControl}>
      <span className="icon-bubble">✓</span>
      <div><strong>Проверочная работа №1</strong><p>Два варианта · 10 заданий</p></div>
      <span className="chevron">›</span>
    </button>
    <p className="footer-note">Очки начисляются за верно выполненное задание один раз.</p>
  </section>;
}

function TopicsScreen({ onOpen }: { onOpen: (paragraphId: string) => void }) {
  return <section className="screen-content">
    <p className="lead">Все 24 параграфа курса уже собраны в структуру. Открыты темы, для которых проверены объяснение и задания.</p>
    {knowledgeBase.chapters.map((chapter) => <section className="chapter-card" key={chapter.id}>
      <div className="chapter-heading"><span>Глава {chapter.number}</span><strong>{chapter.title}</strong></div>
      {chapter.lessons.map((paragraph) => {
        const questionCount = paragraphs.find((item) => item.id === paragraph.id)?.questions.length;
        return <button className={`topic-row ${paragraph.state === 'indexed' ? 'is-coming' : ''}`} key={paragraph.id} onClick={() => onOpen(paragraph.id)} disabled={paragraph.state === 'indexed'}>
        <div className="topic-index">{paragraph.number}</div>
        <div><strong>{paragraph.title}</strong><small>{paragraph.state === 'ready' ? `${questionCount} заданий · 6 класс` : `Учебник: с. ${paragraph.textbookPages[0]}–${paragraph.textbookPages[1]}`}</small></div>
        <span className="chevron">{paragraph.state === 'ready' ? '›' : '·'}</span>
      </button>;
      })}
    </section>) }
    <section className="source-notice"><span>✓</span><div><strong>Учебный материал — отдельно</strong><p>Новые темы можно добавлять в данные курса, не меняя экран приложения.</p></div></section>
  </section>;
}

function TimelineScreen({ onOpenParagraph }: { onOpenParagraph: (paragraphId: string) => void }) {
  // Одна историческая запись может встречаться в нескольких параграфах.
  // Объединяем только заранее подтверждённые смысловые дубли; одинаковый год сам по себе
  // не считается дублем, потому что в один год могли произойти разные события.
  const duplicateEventIds: Record<string, string> = {
    'from-antiquity:476': 'fall-western-rome-476',
    'europe-9-11:476': 'fall-western-rome-476',
    'islam-birth:622': 'hijra-622',
    'europe-9-11:622': 'hijra-622',
    'franks:732': 'poitiers-732',
    'europe-9-11:732': 'poitiers-732',
    'franks:800': 'charlemagne-emperor-800',
    'europe-9-11:800': 'charlemagne-emperor-800',
    'franks:843': 'verdun-843',
    'europe-9-11:843': 'verdun-843',
  };

  const preferredEventText: Record<string, string> = {
    'fall-western-rome-476': 'Падение Западной Римской империи — условная граница Античности и Средневековья.',
    'hijra-622': 'Хиджра: переселение Мухаммеда из Мекки в Медину, начало мусульманского летоисчисления.',
    'poitiers-732': 'Битва при Пуатье: Карл Мартелл победил арабов, остановив их продвижение в Западную Европу.',
    'charlemagne-emperor-800': 'Карл Великий коронован императором.',
    'verdun-843': 'Верденский раздел империи Карла Великого.',
  };

  const grouped = new Map<string, { event: typeof paragraphs[number]['timeline'][number]; paragraphs: typeof paragraphs }>();

  paragraphs.forEach((paragraph) => {
    paragraph.timeline.forEach((event) => {
      const eventId = duplicateEventIds[`${paragraph.id}:${event.year}`] ?? `${paragraph.id}:${event.year}:${event.text}`;
      const existing = grouped.get(eventId);
      if (existing) {
        existing.paragraphs.push(paragraph);
      } else {
        grouped.set(eventId, {
          event: { ...event, text: preferredEventText[eventId] ?? event.text },
          paragraphs: [paragraph],
        });
      }
    });
  });

  const timelineEvents = [...grouped.entries()]
    .map(([id, value]) => ({ id, ...value }))
    .sort((left, right) => timelineYearStart(left.event.year) - timelineYearStart(right.event.year));

  return <section className="screen-content timeline-screen">
    <p className="lead">Ключевые даты тем, которые уже есть в приложении.</p>
    <div className="timeline-line">
      {timelineEvents.map(({ id, event, paragraphs: linkedParagraphs }, index) => <article className="event-card" key={id}>
        <div className="event-dot" /><span className="event-year">{event.year}</span><p>{event.text}</p>
        <div className="event-actions">
          {linkedParagraphs.map((paragraph) => <button key={paragraph.id} onClick={() => onOpenParagraph(paragraph.id)}>Открыть § {paragraph.number}</button>)}
        </div>
        {index < timelineEvents.length - 1 && <div className="event-connector" />}
      </article>)}
    </div>
  </section>;
}

function timelineYearStart(year: string) {
  const numericYear = year.match(/\d{1,4}/);
  if (numericYear) return Number(numericYear[0]);

  const century = year.match(/\b([IVXLCDM]+)\s*в/i)?.[1];
  if (!century) return Number.MAX_SAFE_INTEGER;

  const romanValues: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  return (century.toUpperCase().split('').reduce((total, symbol, index, symbols) => (
    romanValues[symbol] < (romanValues[symbols[index + 1]] ?? 0)
      ? total - romanValues[symbol]
      : total + romanValues[symbol]
  ), 0) - 1) * 100;
}

function ParagraphScreen({ paragraph, onBack, profile, award }: { paragraph: typeof activeParagraph; onBack: () => void; profile: Profile; award: (question: Question) => void }) {
  return <main className="detail-shell">
    <header className="detail-header"><button onClick={onBack} className="back-button">←</button><span>Тема</span><span className="header-placeholder" /></header>
    <section className="detail-content">
      <p className="chapter-label">{knowledgeBase.chapters.find((chapter) => chapter.lessons.some((lesson) => lesson.id === paragraph.id))?.title}</p>
      <h1>§ {paragraph.number}. {paragraph.title}</h1>
      <p className="question-banner">{paragraph.introQuestion}</p>

      <section className="section-block"><h2>Главное</h2>{paragraph.keyIdeas.map((idea) => <article className="idea" key={idea.text}><p>{idea.text}</p></article>)}</section>

      <section className="section-block"><h2>Запомни</h2><div className="term-grid">{paragraph.terms.map((term) => <article className="term-card" key={term.name}><strong>{term.name}</strong><p>{term.text}</p></article>)}</div></section>

      <section className="section-block"><div className="section-title-row"><h2>Проверь себя</h2><span className="points-badge">+{paragraph.questions.reduce((sum, question) => sum + question.points, 0)} очков</span></div><p className="muted">Вопросы помогают закрепить главное после изучения темы.</p>{paragraph.questions.map((question) => <QuestionCard key={question.id} question={question} solved={profile.earnedQuestionIds.includes(question.id)} onCorrect={() => award(question)} />)}</section>

    </section>
  </main>;
}

function ControlWorkScreen({ onBack, profile, award }: { onBack: () => void; profile: Profile; award: (question: Question) => void }) {
  const [variantId, setVariantId] = useState<'v1' | 'v2'>('v1');
  const variant = controlWork1.variants.find((item) => item.id === variantId)!;
  const totalPoints = variant.questions.reduce((sum, question) => sum + question.points, 0);
  return <main className="detail-shell">
    <header className="detail-header"><button onClick={onBack} className="back-button">←</button><span>Проверочная работа</span><span className="header-placeholder" /></header>
    <section className="detail-content">
      <p className="chapter-label">{controlWork1.subtitle}</p>
      <h1>{controlWork1.title}</h1>
      <p className="question-banner">Выбери вариант. У заданий с развёрнутым ответом после текста появится чек-лист для самопроверки.</p>
      <div className="variant-switch" role="tablist" aria-label="Вариант проверочной работы">
        {controlWork1.variants.map((item) => <button role="tab" aria-selected={variantId === item.id} className={variantId === item.id ? 'active' : ''} key={item.id} onClick={() => setVariantId(item.id)}>{item.label}</button>)}
      </div>
      <section className="section-block"><div className="section-title-row"><h2>{variant.label}</h2><span className="points-badge">+{totalPoints} очков</span></div><p className="muted">Очки за выполненное задание начисляются один раз.</p>{variant.questions.map((question) => <QuestionCard key={question.id} question={question} solved={profile.earnedQuestionIds.includes(question.id)} onCorrect={() => award(question)} />)}</section>
    </section>
  </main>;
}

function QuestionCard({ question, solved, onCorrect }: { question: Question; solved: boolean; onCorrect: () => void }) {
  const [selection, setSelection] = useState<number[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [answerText, setAnswerText] = useState('');
  const [selfCheckVisible, setSelfCheckVisible] = useState(solved);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(solved ? 'correct' : null);
  const isCorrect = question.kind === 'order'
    ? order.join('|') === question.correct.join('|')
    : question.kind === 'number'
      ? Number(answerText) === question.correct
      : question.kind === 'self-check'
        ? false
        : selection.length === question.correct.length && selection.every((item) => question.correct.includes(item));

  const toggleChoice = (index: number) => {
    if (result === 'correct') return;
    if (question.kind === 'single') setSelection([index]);
    if (question.kind === 'multiple') setSelection((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  };
  const addToOrder = (id: string) => {
    if (result === 'correct') return;
    setOrder((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };
  const check = () => {
    if (question.kind === 'self-check') { setSelfCheckVisible(true); return; }
    if (question.kind === 'number' && !answerText.trim()) return;
    if ((question.kind === 'single' || question.kind === 'multiple') && !selection.length) return;
    if (question.kind === 'order' && !order.length) return;
    if (isCorrect) { setResult('correct'); onCorrect(); } else setResult('wrong');
  };
  const canCheck = question.kind === 'order' ? order.length === question.options.length : question.kind === 'number' ? answerText.trim().length > 0 : question.kind === 'self-check' ? answerText.trim().length > 0 : selection.length > 0;

  return <article className={`question-card ${result ?? ''}`}>
    <div className="question-top"><span>{question.title}</span><b>+{question.points}</b></div>
    <h3>{question.prompt}</h3>
    {question.kind === 'order' && <p className="order-hint">Нажимай на события в нужной последовательности. Нажми повторно, чтобы убрать.</p>}
    {(question.kind === 'single' || question.kind === 'multiple' || question.kind === 'order') && <div className="answer-list">
      {question.kind === 'order'
        ? question.options.map((option) => {
          const selected = order.includes(option.id);
          const position = order.indexOf(option.id) + 1;
          return <button className={`answer-option ${selected ? 'selected' : ''}`} onClick={() => addToOrder(option.id)} key={option.id}>
            <span className="answer-marker">{position || ''}</span>{option.label}
          </button>;
        })
        : question.options.map((option, index) => {
          const selected = selection.includes(index);
          return <button className={`answer-option ${selected ? 'selected' : ''}`} onClick={() => toggleChoice(index)} key={option}>
            <span className="answer-marker">{question.kind === 'multiple' && selected ? '✓' : ''}</span>{option}
          </button>;
        })}
    </div>}
    {question.kind === 'number' && <input className="number-answer" inputMode="numeric" value={answerText} onChange={(event) => setAnswerText(event.target.value)} placeholder="Введи число" />}
    {question.kind === 'self-check' && <><textarea className="free-answer" value={answerText} onChange={(event) => setAnswerText(event.target.value)} placeholder="Напиши свой ответ" rows={5} />{selfCheckVisible && <div className="self-check"><strong>Проверь, есть ли в ответе:</strong><ul>{question.checklist.map((item) => <li key={item}>{item}</li>)}</ul></div>}</>}
    {result && question.kind !== 'self-check' && <div className={`feedback ${result}`}><strong>{result === 'correct' ? (solved ? 'Уже выполнено' : `Верно · +${question.points} очков`) : 'Пока не так'}</strong><p>{result === 'correct' ? question.explanation : 'Проверь ответ и попробуй ещё раз — очки не списываются.'}</p></div>}
    {!solved && question.kind !== 'self-check' && <button className="check-button" disabled={!canCheck} onClick={check}>{result === 'wrong' ? 'Попробовать ещё раз' : 'Проверить'}</button>}
    {!solved && question.kind === 'self-check' && (selfCheckVisible ? <button className="check-button" onClick={() => { setResult('correct'); onCorrect(); }}>Я сверил(а) ответ · +{question.points}</button> : <button className="check-button" disabled={!canCheck} onClick={check}>Показать чек-лист</button>)}
    {solved && question.kind === 'self-check' && <div className="feedback correct"><strong>Уже выполнено</strong><p>Самопроверка отмечена.</p></div>}
  </article>;
}

function SettingsScreen({ profile, onSave, onBack }: { profile: Profile; onSave: (profile: Profile) => void; onBack: () => void }) {
  const [draft, setDraft] = useState(profile);
  const earnedPoints = [...paragraphs.flatMap((paragraph) => paragraph.questions), ...controlWork1.variants.flatMap((variant) => variant.questions)].filter((q) => profile.earnedQuestionIds.includes(q.id)).reduce((sum, q) => sum + q.points, 0);
  const studySavings = Math.floor(earnedPoints / 500) * 500;
  const submit = (event: FormEvent) => { event.preventDefault(); onSave({ ...profile, ...draft, goalAmount: Math.max(0, draft.goalAmount), externalSavings: Math.max(0, draft.externalSavings) }); onBack(); };
  return <main className="settings-shell"><header className="detail-header"><button className="back-button" onClick={onBack}>←</button><span>Цель и накопления</span><span /></header><form className="settings-form" onSubmit={submit}><p className="lead">Настройки хранятся только на этом устройстве.</p><label>Название цели<input value={draft.goalName} onChange={(e) => setDraft({ ...draft, goalName: e.target.value })} /></label><label>Сумма цели, ₽<input inputMode="numeric" type="number" min="0" value={draft.goalAmount} onChange={(e) => setDraft({ ...draft, goalAmount: Number(e.target.value) })} /></label><label>Уже накоплено из других источников, ₽<input inputMode="numeric" type="number" min="0" value={draft.externalSavings} onChange={(e) => setDraft({ ...draft, externalSavings: Number(e.target.value) })} /></label><section className="study-savings"><span>Заработано учёбой</span><strong>{formatMoney(studySavings)}</strong><small>500 очков = 500 ₽. Повторное выполнение не приносит новых очков.</small></section><button className="primary-button" type="submit">Сохранить</button></form></main>;
}

export default App;
