/**
 * Канонический каталог курса. Здесь нет UI и нет пересказов, сгенерированных
 * без источника: каждая тема привязана к учебнику, конспекту и тесту.
 */
export type ContentState = 'indexed' | 'ready';

export type LessonRecord = {
  id: string;
  number: number;
  title: string;
  textbookPages: readonly [number, number];
  state: ContentState;
};

export type ChapterRecord = {
  id: string;
  number: number;
  title: string;
  lessons: readonly LessonRecord[];
};

export const knowledgeSources = {
  textbook: {
    id: 'history-6-medinsky-chubaryan-2ed',
    label: 'Всеобщая история. История Средних веков. 6 класс. 2-е издание',
    role: 'Проверка фактов и переход к конкретным страницам учебника',
  },
  notes: {
    id: 'history6-notes',
    label: 'Конспекты по всеобщей истории, 6 класс',
    url: 'https://6класс.рф/konspekty-po-vseobshhej-istorii/',
    role: 'Основной объясняющий текст уроков',
  },
  tests: {
    id: 'history6-tests',
    label: 'Всемирная история. Тесты, 6 класс',
    url: 'https://6класс.рф/vsemirnaja-istorija-testy/',
    role: 'Детерминированные задания в конце каждой темы',
  },
  controlWork: {
    id: 'control-work-1',
    label: 'ВИ-6-КР-1',
    role: 'Отдельная проверочная работа по завершённой главе',
  },
} as const;

export const knowledgeBase: { chapters: readonly ChapterRecord[] } = {
  chapters: [
    {
      id: 'chapter-1', number: 1, title: 'Европа в раннее Средневековье', lessons: [
        { id: 'from-antiquity', number: 1, title: 'От Древности к Средневековью: Рим, варвары и христианская церковь', textbookPages: [8, 17], state: 'indexed' },
        { id: 'byzantium', number: 2, title: 'Византийская империя и её соседи', textbookPages: [18, 29], state: 'indexed' },
        { id: 'clovis-to-charlemagne', number: 3, title: 'От королевства Хлодвига к империи Карла Великого', textbookPages: [30, 39], state: 'indexed' },
        { id: 'europe-9-11', number: 4, title: 'Европа в IX—XI вв.', textbookPages: [40, 51], state: 'ready' },
      ],
    },
    {
      id: 'chapter-2', number: 2, title: 'Мусульманская цивилизация в VII—XI вв.', lessons: [
        { id: 'rise-of-islam', number: 5, title: 'Возникновение ислама и государства у арабов', textbookPages: [53, 61], state: 'indexed' },
        { id: 'arab-caliphate', number: 6, title: 'Арабский халифат, его расцвет и распад', textbookPages: [62, 71], state: 'indexed' },
      ],
    },
    {
      id: 'chapter-3', number: 3, title: 'Средневековое европейское общество', lessons: [
        { id: 'lords-and-vassals', number: 7, title: 'Сеньоры и вассалы', textbookPages: [73, 83], state: 'ready' },
        { id: 'catholic-church', number: 8, title: 'Католическая церковь и духовенство', textbookPages: [84, 91], state: 'indexed' },
        { id: 'peasants-and-townspeople', number: 9, title: 'Крестьяне и горожане', textbookPages: [92, 99], state: 'indexed' },
      ],
    },
    {
      id: 'chapter-4', number: 4, title: 'Расцвет Средневековья в Западной Европе', lessons: [
        { id: 'crusades', number: 10, title: 'Крестовые походы', textbookPages: [101, 109], state: 'indexed' },
        { id: 'england-france-1', number: 11, title: 'Англия, Франция и государства Пиренейского полуострова в XI — начале XIV в. Часть 1', textbookPages: [110, 118], state: 'indexed' },
        { id: 'england-france-2', number: 12, title: 'Англия, Франция и государства Пиренейского полуострова в XI — начале XIV в. Часть 2', textbookPages: [110, 118], state: 'indexed' },
        { id: 'holy-roman-empire', number: 13, title: 'Священная Римская империя и её соседи', textbookPages: [119, 126], state: 'indexed' },
        { id: 'western-culture', number: 14, title: 'Западноевропейская культура в XI—XIV вв.', textbookPages: [127, 134], state: 'indexed' },
      ],
    },
    {
      id: 'chapter-5', number: 5, title: 'Страны и народы Азии, Африки и Америки в Средние века', lessons: [
        { id: 'great-steppe', number: 15, title: 'Кочевники Великой степи и их соседи в Средние века', textbookPages: [137, 147], state: 'indexed' },
        { id: 'china', number: 16, title: 'Китай в Средние века', textbookPages: [148, 158], state: 'indexed' },
        { id: 'japan', number: 17, title: 'Япония в Средние века', textbookPages: [148, 158], state: 'indexed' },
        { id: 'india', number: 18, title: 'Индия в Средние века', textbookPages: [159, 168], state: 'indexed' },
        { id: 'africa', number: 19, title: 'Народы и государства Африки', textbookPages: [169, 176], state: 'indexed' },
        { id: 'pre-columbian-america', number: 20, title: 'Цивилизации доколумбовой Америки', textbookPages: [177, 184], state: 'indexed' },
      ],
    },
    {
      id: 'chapter-6', number: 6, title: 'Осень Средневековья', lessons: [
        { id: 'europe-14-15-1', number: 21, title: 'Европа в XIV — первой половине XV в. Часть 1', textbookPages: [187, 198], state: 'indexed' },
        { id: 'europe-14-15-2', number: 22, title: 'Европа в XIV — первой половине XV в. Часть 2', textbookPages: [187, 198], state: 'indexed' },
        { id: 'byzantium-ottomans', number: 23, title: 'Гибель Византии и возникновение Османской империи', textbookPages: [199, 210], state: 'indexed' },
        { id: 'threshold-modern-era', number: 24, title: 'Европа на пороге Нового времени', textbookPages: [211, 220], state: 'indexed' },
      ],
    },
  ],
};

export const chapterChecks = [
  {
    id: 'early-middle-ages-1',
    title: 'Проверочная работа №1',
    covers: ['chapter-1', 'chapter-2'],
    source: knowledgeSources.controlWork.id,
    variants: 2,
  },
] as const;

export const indexedLessons = knowledgeBase.chapters.flatMap((chapter) => chapter.lessons);
