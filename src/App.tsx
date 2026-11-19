import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AnimalItem {
  display: string;
  reading: string;
}

// 11種類の動物リスト（ひらがな・カタカナどちらでも判定可能）
const ANIMALS: AnimalItem[] = [
  { display: 'ライオン', reading: 'らいおん' },
  { display: 'ウサギ', reading: 'うさぎ' },
  { display: 'うま', reading: 'うま' },
  { display: 'しまうま', reading: 'しまうま' },
  { display: 'きりん', reading: 'きりん' },
  { display: 'ひこにゃん', reading: 'ひこにゃん' },
  { display: 'いんこ', reading: 'いんこ' },
  { display: 'あざらし', reading: 'あざらし' },
  { display: 'しろくま', reading: 'しろくま' },
  { display: 'ペンギン', reading: 'ぺんぎん' },
  { display: 'ぱんだ', reading: 'ぱんだ' },
];

const TIME_LIMIT = 10.0;
const TOTAL_QUESTIONS = 10;

function toHiragana(str: string): string {
  return str
    .trim()
    .replace(/[ァ-ヶ]/g, (match) =>
      String.fromCharCode(match.charCodeAt(0) - 0x60)
    );
}

const WhiteBunnyIllustration: React.FC<{ cheer: boolean }> = ({ cheer }) => (
  <svg
    className={`bunny-svg ${cheer ? 'cheer' : ''}`}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="白いうさぎのイラスト"
  >
    <ellipse cx="58" cy="42" rx="14" ry="34" transform="rotate(-10 58 42)" fill="#FFFFFF" stroke="#FFADC6" strokeWidth="4" />
    <ellipse cx="58" cy="44" rx="7" ry="23" transform="rotate(-10 58 44)" fill="#FFD6E5" />
    <ellipse cx="102" cy="42" rx="14" ry="34" transform="rotate(10 102 42)" fill="#FFFFFF" stroke="#FFADC6" strokeWidth="4" />
    <ellipse cx="102" cy="44" rx="7" ry="23" transform="rotate(10 102 44)" fill="#FFD6E5" />
    <ellipse cx="80" cy="100" rx="46" ry="38" fill="#FFFFFF" stroke="#FFADC6" strokeWidth="4" />
    <ellipse cx="52" cy="106" rx="9" ry="6" fill="#FFB8D0" opacity="0.75" />
    <ellipse cx="108" cy="106" rx="9" ry="6" fill="#FFB8D0" opacity="0.75" />
    <circle cx="62" cy="95" r="4.5" fill="#5C3A47" />
    <circle cx="60.5" cy="93.5" r="1.5" fill="#FFFFFF" />
    <circle cx="98" cy="95" r="4.5" fill="#5C3A47" />
    <circle cx="96.5" cy="93.5" r="1.5" fill="#FFFFFF" />
    <path d="M77 103 L83 103 L80 107 Z" fill="#FF7AA8" />
    <path d="M73 111 Q76.5 115 80 111 Q83.5 115 87 111" stroke="#5C3A47" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M108 66 L122 58 L119 72 Z" fill="#FF7AA8" />
    <path d="M108 66 L116 80 L103 75 Z" fill="#FF7AA8" />
    <circle cx="108" cy="67" r="4" fill="#FFE3EE" />
  </svg>
);

interface HistoryRecord {
  word: string;
  success: boolean;
  timeUsed: number;
}

export default function App() {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [queue, setQueue] = useState<AnimalItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [cheer, setCheer] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [bunnyMessage, setBunnyMessage] = useState('フリックで入力してね！');

  const inputRef = useRef<HTMLInputElement>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  const startGame = () => {
    const shuffled = [...ANIMALS]
      .sort(() => Math.random() - 0.5)
      .slice(0, TOTAL_QUESTIONS);
    setQueue(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setHistory([]);
    setInputValue('');
    setTimeLeft(TIME_LIMIT);
    setBunnyMessage('スタート！10秒以内だよ！');
    setPhase('playing');
    questionStartTimeRef.current = Date.now();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const advanceQuestion = useCallback(
    (success: boolean, currentWord: string) => {
      const elapsed = Math.min(
        TIME_LIMIT,
        Number(((Date.now() - questionStartTimeRef.current) / 1000).toFixed(1))
      );

      setHistory((prev) => [
        ...prev,
        { word: currentWord, success, timeUsed: elapsed },
      ]);

      if (success) {
        setScore((s) => s + 1);
        setCheer(true);
        setBunnyMessage('すごい！ぴょんっ♪');
        setTimeout(() => setCheer(false), 500);
      } else {
        setBunnyMessage('時間切れ！つぎいこう！');
      }

      if (currentIndex + 1 >= queue.length) {
        setPhase('result');
        setBunnyMessage('おつかれさまでした！');
      } else {
        setCurrentIndex((idx) => idx + 1);
        setInputValue('');
        setTimeLeft(TIME_LIMIT);
        questionStartTimeRef.current = Date.now();
        setTimeout(() => {
          inputRef.current?.focus();
        }, 30);
      }
    },
    [currentIndex, queue.length]
  );

  useEffect(() => {
    if (phase !== 'playing') return;

    const timer = window.setInterval(() => {
      const elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
      const remaining = Math.max(0, TIME_LIMIT - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        window.clearInterval(timer);
        const currentAnimal = queue[currentIndex];
        if (currentAnimal) {
          advanceQuestion(false, currentAnimal.display);
        }
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [phase, currentIndex, queue, advanceQuestion]);

  const checkAnswer = (val: string) => {
    const currentAnimal = queue[currentIndex];
    if (!currentAnimal) return;

    const normalizedInput = toHiragana(val);
    if (
      normalizedInput === currentAnimal.reading ||
      val.trim() === currentAnimal.display
    ) {
      advanceQuestion(true, currentAnimal.display);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    checkAnswer(val);
  };

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>
  ) => {
    checkAnswer(e.currentTarget.value);
  };

  const currentAnimal = queue[currentIndex];
  const progressPercent = (timeLeft / TIME_LIMIT) * 100;

  return (
    <div className="app-container">
      <header className="header">
        <div className="badge">🐰 うさぎフリック</div>
        {phase === 'playing' && (
          <div className="badge">
            {currentIndex + 1} / {queue.length} 問目
          </div>
        )}
        {phase !== 'playing' && <div className="badge">全11種収録</div>}
      </header>

      <div className="bunny-stage">
        <div className="speech-bubble">{bunnyMessage}</div>
        <WhiteBunnyIllustration cheer={cheer} />
      </div>

      {phase === 'start' && (
        <main className="game-card">
          <h1 style={{ fontSize: '1.35rem', margin: 0, color: '#d64579' }}>
            パステルうさぎの
            <br />
            フリック入力ゲーム
          </h1>
          <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
            11種類の動物がランダムに表示されます。
            <br />
            <strong>1問につき10秒以内</strong>にスマホの
            <br />
            フリック入力で打ち込もう！
          </p>
          <button className="action-btn" onClick={startGame}>
            ゲームスタート！
          </button>
        </main>
      )}

      {phase === 'playing' && currentAnimal && (
        <main className="game-card">
          <div className="timer-wrap">
            <div className="timer-label">
              <span>のこり時間</span>
              <span>{timeLeft.toFixed(1)} 秒</span>
            </div>
            <div className="timer-bar-bg">
              <div
                className={`timer-bar-fill ${timeLeft <= 3 ? 'danger' : ''}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="target-hint">
            よみ：{currentAnimal.reading}
          </div>
          <div className="target-word">{currentAnimal.display}</div>

          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            lang="ja"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="done"
            className="flick-input"
            placeholder="ここをタップして入力"
            value={inputValue}
            onChange={handleChange}
            onCompositionEnd={handleCompositionEnd}
          />

          <button
            type="button"
            className="sub-btn"
            onClick={() => advanceQuestion(false, currentAnimal.display)}
          >
            パスする →
          </button>
        </main>
      )}

      {phase === 'result' && (
        <main className="game-card">
          <h2 style={{ fontSize: '1.3rem', margin: 0, color: '#d64579' }}>
            けっか発表！
          </h2>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ff6b9e' }}>
            {score} / {queue.length} 問正解！
          </div>

          <div className="result-list">
            {history.map((item, idx) => (
              <div key={idx} className="result-item">
                <span>
                  {idx + 1}. {item.word}
                </span>
                <span className={item.success ? 'tag-ok' : 'tag-ng'}>
                  {item.success ? `⭕ ${item.timeUsed}秒` : '❌ 時間切れ'}
                </span>
              </div>
            ))}
          </div>

          <button className="action-btn" onClick={startGame}>
            もういちど遊ぶ
          </button>
        </main>
      )}

      <footer className="footer-note">
        iPhone / Android フリック入力対応（ひらがな・カタカナ両対応）
      </footer>
    </div>
  );
}
