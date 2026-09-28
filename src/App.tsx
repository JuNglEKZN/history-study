import { FormEvent, useEffect, useMemo, useState } from 'react';
import { activeParagraph, history6, type Question } from './data/history6';

type Tab = 'today' | 'topics' | 'timeline';
type View = 'tabs' | 'paragraph' | 'settings';

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

  useEffect(() => {
    localStorage.setItem('history-study-profile', JSON.stringify(profile));
  }, [profile]);

  const earnedPoints = activeParagraph.questions
    .filter((question) => profile.earnedQuestionIds.includes(question.id))
    .reduce((total, question) => total + question.points, 0);
  const studySavings = Math.floor(earnedPoints / 500) * 500;
  const totalSavings = profile.externalSavings + studySavings;
  const goalProgress = profile.goalAmount > 0 ? (totalSavings / profile.goalAmount) * 100 : 0;
  const completedQuestions = profile.earnedQuestionIds.length;

  const award = (question: Question) => {
    setProfile((current) => current.earnedQuestionIds.includes(question.id)
      ? current
      : { ...current, earnedQuestionIds: [...current.earnedQuestionIds, question.id] });
  };

  if (view === 'paragraph') {
    return <ParagraphScreen onBack={() => setView('tabs')} profile={profile} award={award} />;
  }
  if (view === 'settings') {
    return <SettingsScreen profile={profile} onSave={setProfile} onBack={() => setView('tabs')} />;
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">{history6.title}</p>
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
          onContinue={() => setView('paragraph')}
          onSettings={() => setView('settings')}
        />
      )}
      {tab === 'topics' && <TopicsScreen onOpen={() => setView('paragraph')} />}
      {tab === 'timeline' && <TimelineScreen onOpenParagraph={() => setView('paragraph')} />}

      <nav className="tab-bar" aria-label="Основная навигация">
        <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}><span>◷</span>Сегодня</button>
        <button className={tab === 'topics' ? 'active' : ''} onClick={() => setTab('topics')}><span>▤</span>Темы</button>
        <button className={tab === 'timeline' ? 'active' : ''} onClick={() => setTab('timeline')}><span>⌁</span>Шкала времени</button>
      </nav>
    </main>
  );
}

function TodayScreen({ goalName, goalAmount, goalProgress, totalSavings, earnedPoints, completedQuestions, onContinue, onSettings }: {
  goalName: string; goalAmount: number; goalProgress: number; totalSavings: number; earnedPoints: number; completedQuestions: number; onContinue: () => void; onSettings: () => void;
}) {
  const remaining = activeParagraph.questions.length - completedQuestions;
  return <section className="screen-content">
    <button className="savings-card" onClick={onSettings}>
      <div><span className="overline">{goalName}</span><strong>{formatMoney(totalSavings)}</strong><span className="muted">из {formatMoney(goalAmount)}</span></div>
      <div className="savings-progress"><ProgressBar value={goalProgress} /><small>{Math.round(goalProgress)}%</small></div>
    </button>

    <section className="hero-card">
      <span className="chapter-label">{history6.chapters[0].title} · {history6.chapters[0].subtitle}</span>
      <p className="paragraph-number">§ {activeParagraph.number}</p>
      <h2>{activeParagraph.title}</h2>
      <p>{activeParagraph.introQuestion}</p>
      <div className="hero-art" aria-hidden="true"><span>IX</span><i>→</i><span>XI</span></div>
      <button className="primary-button" onClick={onContinue}>
        {completedQuestions ? 'Продолжить тему' : 'Начать тему'} <span>→</span>
      </button>
      <span className="hint">{remaining ? `${remaining} задания · до +${activeParagraph.questions.slice(completedQuestions).reduce((sum, q) => sum + q.points, 0)} очков` : 'Все задания выполнены'}</span>
    </section>

    <section className="small-card">
      <span className="icon-bubble">↻</span>
      <div><strong>Вернись к пройденному</strong><p>Повторение появится здесь после нескольких тем.</p></div>
      <span className="chevron">›</span>
    </section>
    <p className="footer-note">Очки начисляются за верно выполненное задание один раз.</p>
  </section>;
}

function TopicsScreen({ onOpen }: { onOpen: () => void }) {
  return <section className="screen-content">
    <p className="lead">Материалы собраны по тематическим конспектам и тестам для 6 класса.</p>
    {history6.chapters.map((chapter) => <section className="chapter-card" key={chapter.id}>
      <div className="chapter-heading"><span>{chapter.title}</span><strong>{chapter.subtitle}</strong></div>
      {chapter.paragraphs.map((paragraph) => <button className="topic-row" key={paragraph.id} onClick={onOpen}>
        <div className="topic-index">{paragraph.number}</div>
        <div><strong>{paragraph.title}</strong><small>{paragraph.questions.length} заданий · 6 класс</small></div>
        <span className="chevron">›</span>
      </button>)}
    </section>) }
    <section className="source-notice"><span>✓</span><div><strong>Контент отделён от интерфейса</strong><p>Следующие темы добавляются отдельными наборами данных без изменения приложения.</p></div></section>
  </section>;
}

function TimelineScreen({ onOpenParagraph }: { onOpenParagraph: () => void }) {
  return <section className="screen-content timeline-screen">
    <p className="lead">Значимые даты только из уже добавленных страниц учебника.</p>
    <div className="timeline-line">
      {activeParagraph.timeline.map((event, index) => <article className="event-card" key={event.year}>
        <div className="event-dot" /><span className="event-year">{event.year}</span><p>{event.text}</p>
        <div className="event-actions"><button onClick={onOpenParagraph}>Открыть § 4</button></div>
        {index < activeParagraph.timeline.length - 1 && <div className="event-connector" />}
      </article>)}
    </div>
  </section>;
}

function ParagraphScreen({ onBack, profile, award }: { onBack: () => void; profile: Profile; award: (question: Question) => void }) {
  return <main className="detail-shell">
    <header className="detail-header"><button onClick={onBack} className="back-button">←</button><span>Тема</span><span className="header-placeholder" /></header>
    <section className="detail-content">
      <p className="chapter-label">{history6.chapters[0].title}</p>
      <h1>§ {activeParagraph.number}. {activeParagraph.title}</h1>
      <p className="question-banner">{activeParagraph.introQuestion}</p>

      <section className="section-block"><h2>Главное</h2>{activeParagraph.keyIdeas.map((idea) => <article className="idea" key={idea.text}><p>{idea.text}</p></article>)}</section>

      <section className="section-block"><h2>Запомни</h2><div className="term-grid">{activeParagraph.terms.map((term) => <article className="term-card" key={term.name}><strong>{term.name}</strong><p>{term.text}</p></article>)}</div></section>

      <section className="section-block"><div className="section-title-row"><h2>Проверь себя</h2><span className="points-badge">+50 очков</span></div><p className="muted">Вопросы помогают закрепить главное после изучения темы.</p>{activeParagraph.questions.map((question) => <QuestionCard key={question.id} question={question} solved={profile.earnedQuestionIds.includes(question.id)} onCorrect={() => award(question)} />)}</section>

    </section>
  </main>;
}

function QuestionCard({ question, solved, onCorrect }: { question: Question; solved: boolean; onCorrect: () => void }) {
  const [selection, setSelection] = useState<number[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(solved ? 'correct' : null);
  const isCorrect = question.kind === 'order'
    ? order.join('|') === question.correct.join('|')
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
    if (!selection.length && !order.length) return;
    if (isCorrect) { setResult('correct'); onCorrect(); } else setResult('wrong');
  };
  const canCheck = question.kind === 'order' ? order.length === question.options.length : selection.length > 0;

  return <article className={`question-card ${result ?? ''}`}>
    <div className="question-top"><span>{question.title}</span><b>+{question.points}</b></div>
    <h3>{question.prompt}</h3>
    {question.kind === 'order' && <p className="order-hint">Нажимай на события в нужной последовательности. Нажми повторно, чтобы убрать.</p>}
    <div className="answer-list">
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
    </div>
    {result && <div className={`feedback ${result}`}><strong>{result === 'correct' ? (solved ? 'Уже выполнено' : `Верно · +${question.points} очков`) : 'Пока не так'}</strong><p>{result === 'correct' ? question.explanation : 'Вернись к странице учебника и попробуй ещё раз — очки не списываются.'}</p></div>}
    {!solved && <button className="check-button" disabled={!canCheck} onClick={check}>{result === 'wrong' ? 'Попробовать ещё раз' : 'Проверить'}</button>}
  </article>;
}

function SettingsScreen({ profile, onSave, onBack }: { profile: Profile; onSave: (profile: Profile) => void; onBack: () => void }) {
  const [draft, setDraft] = useState(profile);
  const earnedPoints = activeParagraph.questions.filter((q) => profile.earnedQuestionIds.includes(q.id)).reduce((sum, q) => sum + q.points, 0);
  const studySavings = Math.floor(earnedPoints / 500) * 500;
  const submit = (event: FormEvent) => { event.preventDefault(); onSave({ ...profile, ...draft, goalAmount: Math.max(0, draft.goalAmount), externalSavings: Math.max(0, draft.externalSavings) }); onBack(); };
  return <main className="settings-shell"><header className="detail-header"><button className="back-button" onClick={onBack}>←</button><span>Цель и накопления</span><span /></header><form className="settings-form" onSubmit={submit}><p className="lead">Настройки хранятся только на этом устройстве.</p><label>Название цели<input value={draft.goalName} onChange={(e) => setDraft({ ...draft, goalName: e.target.value })} /></label><label>Сумма цели, ₽<input inputMode="numeric" type="number" min="0" value={draft.goalAmount} onChange={(e) => setDraft({ ...draft, goalAmount: Number(e.target.value) })} /></label><label>Уже накоплено из других источников, ₽<input inputMode="numeric" type="number" min="0" value={draft.externalSavings} onChange={(e) => setDraft({ ...draft, externalSavings: Number(e.target.value) })} /></label><section className="study-savings"><span>Заработано учёбой</span><strong>{formatMoney(studySavings)}</strong><small>500 очков = 500 ₽. Повторное выполнение не приносит новых очков.</small></section><button className="primary-button" type="submit">Сохранить</button></form></main>;
}

export default App;
