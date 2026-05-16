import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Sparkles, Monitor, MousePointerClick } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  {
    id: 1,
    category: "Устройство компьютера",
    question: "Что помогает вводить буквы и цифры в компьютер?",
    answer: "Клавиатура",
    options: ["Монитор", "Клавиатура", "Колонки", "Принтер"],
  },
  {
    id: 2,
    category: "Устройство компьютера",
    question: "На каком устройстве мы видим изображение с компьютера?",
    answer: "Монитор",
    options: ["Мышь", "Монитор", "Сканер", "Флешка"],
  },
  {
    id: 3,
    category: "Файлы и папки",
    question: "Что помогает хранить файлы по группам?",
    answer: "Папка",
    options: ["Папка", "Кнопка", "Кабель", "Окно"],
  },
  {
    id: 4,
    category: "Файлы и папки",
    question: "Как называется картинка или знак программы на рабочем столе?",
    answer: "Значок",
    options: ["Файл", "Значок", "Курсор", "Абзац"],
  },
  {
    id: 5,
    category: "Безопасность",
    question: "Что нельзя сообщать незнакомым людям в интернете?",
    answer: "Пароль",
    options: ["Любимый цвет", "Пароль", "Название игры", "Погоду"],
  },
  {
    id: 6,
    category: "Безопасность",
    question: "Что нужно сделать, если сайт просит скачать подозрительный файл?",
    answer: "Спросить взрослого",
    options: ["Скачать сразу", "Спросить взрослого", "Отправить другу", "Открыть ночью"],
  },
  {
    id: 7,
    category: "Алгоритмы",
    question: "Как называется точное описание действий по порядку?",
    answer: "Алгоритм",
    options: ["Рисунок", "Алгоритм", "Папка", "Монитор"],
  },
  {
    id: 8,
    category: "Алгоритмы",
    question: "Что означает команда «повтори 3 раза»?",
    answer: "Цикл",
    options: ["Ошибка", "Цикл", "Файл", "Ссылка"],
  },
  {
    id: 9,
    category: "Интернет",
    question: "Что помогает искать информацию в интернете?",
    answer: "Поисковик",
    options: ["Поисковик", "Папка", "Принтер", "Калькулятор"],
  },
  {
    id: 10,
    category: "Интернет",
    question: "Как называется адрес страницы в интернете?",
    answer: "Ссылка",
    options: ["Ссылка", "Клавиша", "Пиксель", "Курсор"],
  },
  {
    id: 11,
    category: "Информация",
    question: "Что из этого является текстовой информацией?",
    answer: "Рассказ",
    options: ["Рассказ", "Мелодия", "Запах", "Вкус"],
  },
  {
    id: 12,
    category: "Информация",
    question: "Что из этого является графической информацией?",
    answer: "Рисунок",
    options: ["Звук", "Рисунок", "Команда", "Пароль"],
  },
];

const BINGO_WORDS = [
  "Клавиатура",
  "Монитор",
  "Папка",
  "Значок",
  "Пароль",
  "Спросить взрослого",
  "Алгоритм",
  "Цикл",
  "Поисковик",
  "Ссылка",
  "Рассказ",
  "Рисунок",
];

const bingoLines = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [0, 4, 8],
  [1, 5, 9],
  [2, 6, 10],
  [3, 7, 11],
  [0, 5, 10],
  [3, 6, 9],
];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function InformaticsLotoApp() {
  const [questions, setQuestions] = useState(() => shuffle(QUESTIONS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marked, setMarked] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const current = questions[currentIndex];
  const finished = currentIndex >= questions.length;

  const completedLines = useMemo(() => {
    return bingoLines.filter((line) => line.every((index) => marked.includes(BINGO_WORDS[index]))).length;
  }, [marked]);

  const progress = Math.round((currentIndex / QUESTIONS.length) * 100);

  const chooseAnswer = (option) => {
    if (selected || finished) return;

    setSelected(option);

    if (option === current.answer) {
      setFeedback("correct");
      setScore((prev) => prev + 1);
      setMarked((prev) => (prev.includes(current.answer) ? prev : [...prev, current.answer]));
    } else {
      setFeedback("wrong");
      setMistakes((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setFeedback(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const restart = () => {
    setQuestions(shuffle(QUESTIONS));
    setCurrentIndex(0);
    setMarked([]);
    setSelected(null);
    setFeedback(null);
    setScore(0);
    setMistakes(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-fuchsia-100 to-amber-100 p-4 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 rounded-[2rem] bg-white/75 p-5 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                <Sparkles size={16} /> Информатика · 4 класс
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Викторина‑лото</h1>
              <p className="mt-2 max-w-2xl text-base text-slate-600 md:text-lg">
                Отвечай на вопросы и закрывай правильные ответы на лото‑поле. Собери как можно больше линий!
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-emerald-100 p-3">
                <div className="text-2xl font-black text-emerald-700">{score}</div>
                <div className="text-xs font-semibold text-emerald-700">верно</div>
              </div>
              <div className="rounded-2xl bg-rose-100 p-3">
                <div className="text-2xl font-black text-rose-700">{mistakes}</div>
                <div className="text-xs font-semibold text-rose-700">ошибки</div>
              </div>
              <div className="rounded-2xl bg-violet-100 p-3">
                <div className="text-2xl font-black text-violet-700">{completedLines}</div>
                <div className="text-xs font-semibold text-violet-700">линии</div>
              </div>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-fuchsia-500"
              animate={{ width: `${finished ? 100 : progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </header>

        <main className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            {!finished ? (
              <Card className="overflow-hidden rounded-[2rem] border-0 bg-white/85 shadow-xl backdrop-blur">
                <CardContent className="p-5 md:p-7">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
                      Вопрос {currentIndex + 1} из {questions.length}
                    </span>
                    <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
                      {current.category}
                    </span>
                  </div>

                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[1.75rem] bg-gradient-to-br from-white to-sky-50 p-5 shadow-inner"
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <div className="rounded-2xl bg-sky-500 p-3 text-white shadow-lg">
                        <Monitor size={28} />
                      </div>
                      <h2 className="text-2xl font-black leading-tight md:text-3xl">{current.question}</h2>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {current.options.map((option) => {
                        const isCorrect = option === current.answer;
                        const isSelected = option === selected;
                        let style = "bg-white hover:bg-sky-50 border-slate-200";

                        if (selected && isCorrect) style = "bg-emerald-100 border-emerald-400 text-emerald-800";
                        if (selected && isSelected && !isCorrect) style = "bg-rose-100 border-rose-400 text-rose-800";

                        return (
                          <button
                            key={option}
                            onClick={() => chooseAnswer(option)}
                            className={`rounded-2xl border-2 p-4 text-left text-lg font-extrabold shadow-sm transition ${style}`}
                          >
                            <span className="flex items-center gap-2">
                              <MousePointerClick size={20} /> {option}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mt-5 rounded-2xl p-4 font-bold ${
                          feedback === "correct" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {feedback === "correct" ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 /> Верно! Ответ закрыт на лото‑поле.
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle /> Не совсем. Правильный ответ: {current.answer}.
                          </div>
                        )}
                      </motion.div>
                    )}

                    <div className="mt-5 flex justify-end">
                      <Button
                        onClick={nextQuestion}
                        disabled={!selected}
                        className="rounded-2xl px-6 py-6 text-base font-black"
                      >
                        Следующий вопрос
                      </Button>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[2rem] border-0 bg-white/85 shadow-xl backdrop-blur">
                <CardContent className="p-7 text-center">
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <Trophy size={54} />
                    </div>
                    <h2 className="text-4xl font-black">Игра окончена!</h2>
                    <p className="mt-3 text-lg text-slate-600">
                      Правильных ответов: <b>{score}</b> из <b>{QUESTIONS.length}</b>. Собрано линий: <b>{completedLines}</b>.
                    </p>
                    <div className="mt-6 rounded-3xl bg-sky-50 p-5 text-left text-slate-700">
                      <h3 className="mb-2 text-xl font-black">Итог</h3>
                      {score >= 10 ? (
                        <p>Отличный результат! Ты хорошо знаешь основы информатики.</p>
                      ) : score >= 7 ? (
                        <p>Хороший результат! Повтори темы, где были ошибки, и сыграй ещё раз.</p>
                      ) : (
                        <p>Нужно немного потренироваться. Обрати внимание на безопасность, файлы, интернет и алгоритмы.</p>
                      )}
                    </div>
                    <Button onClick={restart} className="mt-6 rounded-2xl px-6 py-6 text-base font-black">
                      <RotateCcw className="mr-2" /> Начать заново
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            )}
          </section>

          <aside>
            <Card className="rounded-[2rem] border-0 bg-white/85 shadow-xl backdrop-blur">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-black">Лото‑поле</h2>
                  <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-sm font-bold text-fuchsia-700">
                    3 × 4
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {BINGO_WORDS.map((word) => {
                    const isMarked = marked.includes(word);
                    return (
                      <motion.div
                        key={word}
                        animate={{ scale: isMarked ? [1, 1.08, 1] : 1 }}
                        className={`flex min-h-24 items-center justify-center rounded-2xl border-2 p-2 text-center text-sm font-black shadow-sm transition md:text-base ${
                          isMarked
                            ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {isMarked ? (
                          <span className="flex flex-col items-center gap-1">
                            <CheckCircle2 size={24} /> {word}
                          </span>
                        ) : (
                          word
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-3xl bg-gradient-to-br from-violet-100 to-sky-100 p-4">
                  <h3 className="mb-2 text-lg font-black">Правила</h3>
                  <ol className="list-inside list-decimal space-y-1 text-sm font-semibold text-slate-700">
                    <li>Прочитай вопрос.</li>
                    <li>Выбери правильный ответ.</li>
                    <li>Если ответ верный, он закроется на поле.</li>
                    <li>Собирай линии по горизонтали, вертикали или диагонали.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  );
}
