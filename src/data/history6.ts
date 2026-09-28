export type Source = { page: number };

export type ChoiceQuestion = {
  id: string;
  kind: 'single' | 'multiple';
  title: string;
  prompt: string;
  options: string[];
  correct: number[];
  points: number;
  source: Source;
  explanation: string;
};

export type OrderQuestion = {
  id: string;
  kind: 'order';
  title: string;
  prompt: string;
  options: { id: string; label: string }[];
  correct: string[];
  points: number;
  source: Source;
  explanation: string;
};

export type Question = ChoiceQuestion | OrderQuestion;

// Рабочие источники контента. Они не выводятся в интерфейсе: позже их заменит
// привязка к страницам пользовательского PDF.
export const primarySources = {
  notes: {
    label: 'Конспект §4',
    url: 'https://6класс.рф/vseobshhaja-istorija-konspekt-4/',
  },
  tests: {
    label: 'Тест §4',
    url: 'https://6класс.рф/%D0%B2%D1%81%D0%B5%D0%BE%D0%B1%D1%89%D0%B0%D1%8F-%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%8F-%D1%82%D0%B5%D1%81%D1%82-4/',
  },
} as const;

export const history6 = {
  title: 'История · 6 класс',
  chapters: [
    {
      id: 'chapter-1',
      title: 'Глава I',
      subtitle: 'Средневековая Европа',
      paragraphs: [
        {
          id: 'europe-9-11',
          number: 4,
          title: 'Европа в IX—XI вв.',
          pages: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
          status: 'active' as const,
          introQuestion:
            'Как нападения норманнов и венгров в IX—XI вв. повлияли на развитие разных стран Европы?',
          keyIdeas: [
            {
              text: 'Нападения норманнов, венгров и арабов изменили политическую карту Европы.',
              source: { page: 47 },
            },
            {
              text: 'В IX—XI вв. англосаксонские королевства объединились для отпора врагу, а во Франции усилилась раздробленность.',
              source: { page: 47 },
            },
            {
              text: 'В 962 году Оттон I был провозглашён императором; так возникла Священная Римская империя.',
              source: { page: 45 },
            },
            {
              text: 'У западных славян в IX—XI вв. появились первые государства.',
              source: { page: 45 },
            },
          ],
          terms: [
            { name: 'Норманны', text: 'Так в Западной Европе называли жителей Скандинавии.', source: { page: 40 } },
            { name: 'Викинги', text: 'Участники военных походов из Скандинавии.', source: { page: 40 } },
            { name: 'Раздробленность', text: 'Период ослабления королевской власти и усиления местной знати во Франции.', source: { page: 43 } },
          ],
          timeline: [
            { year: '863', text: 'Начало миссии Кирилла и Мефодия в Великой Моравии.', source: { page: 39 } },
            { year: '962', text: 'Образование Священной Римской империи.', source: { page: 39 } },
            { year: '966', text: 'Поляки приняли христианство.', source: { page: 47 } },
            { year: '1025', text: 'Болеслав I Храбрый получил королевский титул.', source: { page: 47 } },
            { year: '1066', text: 'Нормандское завоевание Англии.', source: { page: 39 } },
          ],
          questions: [
            {
              id: 'vikings',
              kind: 'single',
              title: 'Разберись в понятиях',
              prompt: 'Как в самом учебнике названы участники военных походов из Скандинавии?',
              options: ['Викинги', 'Капетинги', 'Венгры', 'Англосаксы'],
              correct: [0],
              points: 5,
              source: { page: 40 },
              explanation: 'В тексте сказано: участников военных походов сами скандинавы называли викингами.',
            },
            {
              id: 'chronology',
              kind: 'order',
              title: 'Работаем с хронологией',
              prompt: 'Расположи события в порядке, который дан в задании учебника.',
              options: [
                { id: 'empire', label: 'Образование Священной Римской империи' },
                { id: 'england', label: 'Нормандское завоевание Англии' },
                { id: 'mission', label: 'Деятельность Кирилла и Мефодия в Великой Моравии' },
                { id: 'poland', label: 'Принятие Болеславом I Храбрым королевского титула' },
              ],
              correct: ['mission', 'empire', 'poland', 'england'],
              points: 10,
              source: { page: 48 },
              explanation: 'Сначала миссия Кирилла и Мефодия, затем образование империи, титул Болеслава I и Нормандское завоевание Англии.',
            },
            {
              id: 'find-in-textbook',
              kind: 'multiple',
              title: 'Найди в учебнике',
              prompt: 'Открой страницы 44–45. Выбери два утверждения, которые подтверждает текст об Оттоне I.',
              options: [
                { text: 'Он в 962 году прибыл в Италию по просьбе папы римского.' },
                { text: 'Он стал первым королём Франции из династии Капетингов.' },
                { text: 'Он решил ещё раз восстановить империю на Западе.' },
                { text: 'Он создал кириллицу вместе с Мефодием.' },
              ].map((item) => item.text),
              correct: [0, 2],
              points: 15,
              source: { page: 45 },
              explanation: 'На стр. 45 сказано, что Оттон прибыл в Италию в 962 году и решил восстановить империю на Западе.',
            },
            {
              id: 'varangians',
              kind: 'single',
              title: 'Проверь термин',
              prompt: 'Как в тексте учебника названы жители Скандинавии на Руси?',
              options: ['Варягами', 'Саксами', 'Капетингами', 'Лангобардами'],
              correct: [0],
              points: 5,
              source: { page: 40 },
              explanation: 'На стр. 40 указано: на Руси норманнов именовали варягами.',
            },
            {
              id: 'france-fragmentation',
              kind: 'single',
              title: 'Причина и следствие',
              prompt: 'Почему влияние французского короля в период раздробленности стало ограниченным?',
              options: [
                'Местная знать усилилась и не желала подчиняться королю',
                'Папа римский отменил королевскую власть',
                'Францию присоединили к Византии',
                'Все феодалы переселились в Англию',
              ],
              correct: [0],
              points: 10,
              source: { page: 44 },
              explanation: 'Учебник связывает раздробленность с могуществом местной знати и ослаблением королевской власти.',
            },
            {
              id: 'poland-christianity',
              kind: 'single',
              title: 'Найди дату',
              prompt: 'В каком году, согласно тексту, поляки приняли христианство?',
              options: ['863', '962', '966', '1025'],
              correct: [2],
              points: 5,
              source: { page: 47 },
              explanation: 'На стр. 47 указано: в 966 году поляки приняли христианство.',
            },
          ] as Question[],
        },
      ],
    },
  ],
};

export const activeParagraph = history6.chapters[0].paragraphs[0];
