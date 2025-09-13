
import {
  User,
  Subject,
  Community,
  Post,
  Comment,
  ResourceSubject,
} from './types';

export const users: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    name: 'Alex Johnson',
    avatarUrl: 'https://picsum.photos/seed/101/100/100',
    avatarHint: 'student portrait',
  },
  'user-2': {
    id: 'user-2',
    name: 'Dr. Evelyn Reed',
    avatarUrl: 'https://picsum.photos/seed/102/100/100',
    avatarHint: 'teacher portrait',
  },
  'user-3': {
    id: 'user-3',
    name: 'Samantha Blue',
    avatarUrl: 'https://picsum.photos/seed/103/100/100',
    avatarHint: 'student portrait',
  },
  'user-4': {
    id: 'user-4',
    name: 'Ben Carter',
    avatarUrl: 'https://picsum.photos/seed/104/100/100',
    avatarHint: 'student portrait',
  },
};

const comments: Comment[] = [
  {
    id: 'comment-1',
    author: users['user-3'],
    createdAt: '2 hours ago',
    content:
      "This is a great point! I've been struggling with this concept, and your explanation really clarifies it.",
    replies: [
      {
        id: 'comment-1-1',
        author: users['user-4'],
        createdAt: '1 hour ago',
        content: 'Glad I could help! Let me know if you have other questions.',
        replies: [
           {
            id: 'comment-1-1-1',
            author: users['user-3'],
            createdAt: '30 minutes ago',
            content: "Actually, I do. Can you explain the difference between a geometric and an arithmetic sequence?",
            replies: [],
           }
        ],
      },
    ],
  },
  {
    id: 'comment-2',
    author: users['user-2'],
    createdAt: '3 hours ago',
    content:
      'Excellent discussion. Remember to check the supplemental resources in the library for more practice problems.',
    replies: [],
  },
];

const posts: Post[] = [
  {
    id: 'post-1',
    title: 'Having trouble with quadratic equations',
    author: users['user-1'],
    createdAt: '5 hours ago',
    content:
      "I'm working through the Algebra I course and I'm really stuck on factoring quadratic equations. I understand the basic idea, but when the 'a' coefficient is not 1, I get lost. Does anyone have a good way to remember the steps or a helpful video resource?",
    comments: comments,
    commentCount: 3,
  },
  {
    id: 'post-2',
    title: 'Tips for the upcoming midterm',
    author: users['user-3'],
    createdAt: '1 day ago',
    content:
      "The midterm is just a week away! I'm putting together a study group. Anyone interested in joining? We can review key concepts and work through practice problems together.",
    comments: [],
    commentCount: 0,
  },
];

export const communities: Community[] = [
  {
    id: 'math-club',
    name: 'Math Club',
    description: 'A place to discuss all things mathematics.',
    members: 128,
    posts,
  },
  {
    id: 'history-buffs',
    name: 'History Buffs',
    description: 'For lovers of history and ancient civilizations.',
    members: 89,
    posts: [],
  },
  {
    id: 'science-explorers',
    name: 'Science Explorers',
    description: 'From biology to astrophysics, let\'s explore the universe.',
    members: 213,
    posts: [],
  },
  {
    id: 'book-worms',
    name: 'Book Worms',
    description: 'Discussing classic literature and modern fiction.',
    members: 74,
    posts: [],
  },
];

export const subjects: Subject[] = [
  {
    id: 'english',
    name: 'English Language (Forms 1-4)',
    description: 'Proficiency in written and spoken English, focusing on functional and communicative competence.',
    imageUrl: 'https://picsum.photos/seed/204/400/225',
    imageHint: 'books library',
    courses: [
        {
            id: 'english-1-4',
            name: 'English Language (Forms 1-4)',
            description: 'Covers reading, writing, language structures, and oral skills.',
            tutor: 'Ms. Chloe Dubois',
            duration: '4 years',
            curriculum: [
                { id: 'eng-l1', title: 'Reading and Comprehension', type: 'reading', duration: 30 },
                { id: 'eng-l2', title: 'Creative and Functional Writing', type: 'video', duration: 40 },
                { id: 'eng-l3', title: 'Language Structures (Grammar, Punctuation)', type: 'reading', duration: 35 },
                { id: 'eng-l4', title: 'Oral and Aural Skills', type: 'quiz', duration: 25 },
            ],
        }
    ],
  },
  {
    id: 'mathematics',
    name: 'Mathematics (Forms 1-4)',
    description: 'Developing problem-solving skills and applying mathematical concepts to real-life situations.',
    imageUrl: 'https://picsum.photos/seed/201/400/225',
    imageHint: 'mathematics chalkboard',
    courses: [
      {
        id: 'math-forms-1-4',
        name: 'Mathematics (Forms 1-4)',
        description: 'A comprehensive study of mathematics covering the official Zimbabwean syllabus.',
        tutor: 'Dr. Evelyn Reed',
        duration: '4 years',
        curriculum: [
          { id: 'math-l1', title: 'Number Concepts and Operations', type: 'reading', duration: 30 },
          { id: 'math-l2', title: 'Algebraic Manipulation', type: 'video', duration: 25 },
          { id: 'math-l3', title: 'Mensuration', type: 'reading', duration: 20 },
          { id: 'math-l4', title: 'Geometry and Trigonometry', type: 'video', duration: 35 },
          { id: 'math-l5', title: 'Matrices and Transformations', type: 'quiz', duration: 45 },
          { id: 'math-l6', title: 'Statistics and Probability', type: 'reading', duration: 20 },
        ],
      },
    ],
  },
   {
    id: 'additional-mathematics',
    name: 'Additional Mathematics (Forms 3-4)',
    description: 'For students seeking a deeper understanding of mathematical principles.',
    imageUrl: 'https://picsum.photos/seed/add-math-course/400/225',
    imageHint: 'calculus graph',
    courses: [
      {
        id: 'additional-mathematics-3-4',
        name: 'Additional Mathematics (Forms 3-4)',
        description: 'Advanced algebra, calculus, vectors, and trigonometry.',
        tutor: 'Dr. Evelyn Reed',
        duration: '2 years',
        curriculum: [
          { id: 'add-math-l1', title: 'Algebra (Polynomials, Partial Fractions)', type: 'reading', duration: 30 },
          { id: 'add-math-l2', title: 'Calculus (Differentiation, Integration)', type: 'video', duration: 40 },
          { id: 'add-math-l3', title: 'Vectors in Geometry', type: 'video', duration: 30 },
          { id: 'add-math-l4', title: 'Advanced Trigonometry', type: 'quiz', duration: 45 },
          { id: 'add-math-l5', title: 'Permutations and Combinations', type: 'reading', duration: 25 },
        ],
      },
    ],
  },
  {
    id: 'biology',
    name: 'Biology (Forms 1-4)',
    description: 'Fostering an understanding of biological principles and their application in daily life.',
    imageUrl: 'https://picsum.photos/seed/bio-course/400/225',
    imageHint: 'dna strand',
    courses: [
        {
          id: 'biology-1-4',
          name: 'Biology (Forms 1-4)',
          description: 'The study of life, from cells to ecosystems.',
          tutor: 'Dr. Ben Carter',
          duration: '4 years',
          curriculum: [
             { id: 'bio-l1', title: 'Cells and Living Organisms', type: 'video', duration: 30 },
             { id: 'bio-l2', title: 'Human Biology (Systems, Health)', type: 'reading', duration: 25 },
             { id: 'bio-l3', title: 'Ecology and Ecosystems', type: 'video', duration: 28 },
             { id: 'bio-l4', title: 'Genetics and Inheritance', type: 'reading', duration: 22 },
             { id: 'bio-l5', title: 'Agriculture and Environmental Science', type: 'quiz', duration: 40 },
          ],
        }
    ],
  },
  {
    id: 'history',
    name: 'History (Forms 1-4)',
    description: 'A comprehensive understanding of Zimbabwe\'s past and present.',
    imageUrl: 'https://picsum.photos/seed/203/400/225',
    imageHint: 'historical artifacts',
    courses: [
       {
        id: 'history-1-4',
        name: 'History (Forms 1-4)',
        description: 'Combining Heritage Studies and Economic History of Zimbabwe.',
        tutor: 'Prof. Alistair Finch',
        duration: '4 years',
        curriculum: [
          { id: 'hist-l1', title: 'Identity and National History', type: 'reading', duration: 30 },
          { id: 'hist-l2', title: 'Cultural Heritage and Citizenship', type: 'video', duration: 25 },
          { id: 'hist-l3', title: 'Pre-Colonial Economies', type: 'reading', duration: 20 },
          { id: 'hist-l4', title: 'The Colonial Period Economy', type: 'video', duration: 35 },
          { id: 'hist-l5', title: 'Economic History since 1980', type: 'quiz', duration: 45 },
        ],
      }
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry (Forms 3-4)',
    description: 'Understanding and application of chemistry concepts and principles.',
    imageUrl: 'https://picsum.photos/seed/chem-course/400/225',
    imageHint: 'chemistry beakers',
    courses: [
       {
        id: 'chem-forms-3-4',
        name: 'Chemistry (Forms 3-4)',
        description: 'From atomic structure to industrial processes.',
        tutor: 'Dr. Kenji Tanaka',
        duration: '2 years',
        curriculum: [
          { id: 'chem-l1', title: 'Introduction to Chemistry & Lab Safety', type: 'video', duration: 20 },
          { id: 'chem-l2', title: 'The Particulate Nature of Matter', type: 'reading', duration: 25 },
          { id: 'chem-l3', title: 'Atomic Structure and the Periodic Table', type: 'video', duration: 30 },
          { id: 'chem-l4', title: 'Chemical Bonding and Stoichiometry', type: 'reading', duration: 35 },
          { id: 'chem-l5', title: 'Acids, Bases, and Salts', type: 'video', duration: 28 },
          { id: 'chem-l6', title: 'Organic Chemistry', type: 'reading', duration: 40 },
          { id: 'chem-l7', title: 'Industrial Processes', type: 'quiz', duration: 50 },
        ],
      }
    ],
  },
  {
    id: 'geography',
    name: 'Geography (Forms 1-4)',
    description: 'Understand the physical, environmental, and human aspects of the world.',
    imageUrl: 'https://picsum.photos/seed/geo-course/400/225',
    imageHint: 'world map',
    courses: [
       {
        id: 'geo-forms-1-4',
        name: 'Geography (Forms 1-4)',
        description: 'From map work to environmental issues.',
        tutor: 'Ms. Helena Garcia',
        duration: '4 years',
        curriculum: [
          { id: 'geo-l1', title: 'Map Work and GIS', type: 'video', duration: 30 },
          { id: 'geo-l2', title: 'Physical Geography', type: 'reading', duration: 25 },
          { id: 'geo-l3', title: 'Human and Economic Geography', type: 'video', duration: 28 },
          { id: 'geo-l4', title: 'Environmental Issues', type: 'quiz', duration: 40 },
        ],
      }
    ],
  },
  {
    id: 'commerce',
    name: 'Commerce (Forms 1-4)',
    description: 'Provides practical enterprise skills and business-related competencies.',
    imageUrl: 'https://picsum.photos/seed/com-course/400/2D/225',
    imageHint: 'business chart',
    courses: [
       {
        id: 'com-forms-1-4',
        name: 'Commerce (Forms 1-4)',
        description: 'Covering production, consumer protection, finance, and trade.',
        tutor: 'Mrs. Sofia Rossi',
        duration: '4 years',
        curriculum: [
          { id: 'com-l1', title: 'Business Fundamentals', type: 'reading', duration: 25 },
          { id: 'com-l2', title: 'Trade and Aids to Trade', type: 'video', duration: 30 },
          { id: 'com-l3', title: 'Financial Management', type: 'reading', duration: 20 },
          { id: 'com-l4', title: 'Marketing and Consumer Protection', type: 'video', duration: 25 },
          { id: 'com-l5', title: 'International Trade', type: 'quiz', duration: 35 },
        ],
      }
    ],
  },
  {
    id: 'principles-of-accounting',
    name: 'Principles of Accounting (Forms 1-4)',
    description: 'Introduction to the fundamentals of accounting.',
    imageUrl: 'https://picsum.photos/seed/acc-course/400/225',
    imageHint: 'financial ledger',
    courses: [
      {
        id: 'acc-1-4',
        name: 'Principles of Accounting (Forms 1-4)',
        description: 'Covering bookkeeping, financial records, and final accounts.',
        tutor: 'Mr. Leo Maxwell',
        duration: '4 years',
        curriculum: [
          { id: 'acc-l1', title: 'Introduction to Accounting', type: 'reading', duration: 30 },
          { id: 'acc-l2', title: 'Financial Records (Journals, Ledgers)', type: 'video', duration: 35 },
          { id: 'acc-l3', title: 'Final Accounts (Trading, P&L)', type: 'reading', duration: 40 },
          { id: 'acc-l4', title: 'Financial Statements Analysis', type: 'quiz', duration: 45 },
        ],
      }
    ],
  },
  {
    id: 'business-enterprise-skills',
    name: 'Business Enterprise and Skills (Forms 1-4)',
    description: 'Developing practical entrepreneurial skills.',
    imageUrl: 'https://picsum.photos/seed/bes-course/400/225',
    imageHint: 'business startup',
    courses: [
      {
        id: 'bes-1-4',
        name: 'Business Enterprise and Skills (Forms 1-4)',
        description: 'From ideation to business management and legislation.',
        tutor: 'Mrs. Sofia Rossi',
        duration: '4 years',
        curriculum: [
          { id: 'bes-l1', title: 'The Entrepreneur and Business Cycle', type: 'reading', duration: 25 },
          { id: 'bes-l2', title: 'Business Planning and Feasibility', type: 'video', duration: 35 },
          { id: 'bes-l3', title: 'Business Operations Management', type: 'reading', duration: 30 },
          { id: 'bes-l4' , title: 'Business Laws and Ethics', type: 'quiz', duration: 40 },
        ],
      }
    ],
  },
  {
    id: 'literature-in-indigenous-languages',
    name: 'Literature in Indigenous Languages (Forms 1-4)',
    description: 'Literary appreciation and critical thinking in indigenous languages.',
    imageUrl: 'https://picsum.photos/seed/lit-lang-course/400/225',
    imageHint: 'cultural storytelling',
    courses: [
      {
        id: 'lit-lang-1-4',
        name: 'Literature in Indigenous Languages (Shona)',
        description: 'Study of prose, poetry, drama, and oral literature.',
        tutor: 'Prof. Omar Badawi',
        duration: '4 years',
        curriculum: [
          { id: 'lit-lang-l1', title: 'Literary Genres (Prose, Poetry, Drama)', type: 'reading', duration: 30 },
          { id: 'lit-lang-l2', title: 'Literary Analysis and Criticism', type: 'video', duration: 35 },
          { id: 'lit-lang-l3', title: 'Oral Literature (Folklore, Proverbs)', type: 'reading', duration: 25 },
          { id: 'lit-lang-l4', title: 'Creative Writing Workshop', type: 'quiz', duration: 50 },
        ],
      }
    ],
  },
  {
    id: 'indigenous-languages',
    name: 'Indigenous Languages (Forms 1-4)',
    description: 'Practical application of indigenous languages for communication and cultural identity.',
    imageUrl: 'https://picsum.photos/seed/lang-course/400/225',
    imageHint: 'cultural art',
    courses: [
       {
        id: 'lang-forms-1-4',
        name: 'Indigenous Languages (Shona)',
        description: 'Promoting Unhu/Ubuntu/Vumunhu and enterprising skills.',
        tutor: 'Prof. Omar Badawi',
        duration: '4 years',
        curriculum: [
          { id: 'lang-l1', title: 'Communication and Language Skills', type: 'video', duration: 25 },
          { id: 'lang-l2', title: 'Creative and Functional Writing', type: 'reading', duration: 30 },
          { id: 'lang-l3', title: 'Language Structure (Phonology, Morphology, Syntax)', type: 'video', duration: 35 },
          { id: 'lang-l4', title: 'Literary Genres and Analysis', type: 'reading', duration: 40 },
          { id: 'lang-l5', title: 'Cultural and Social Aspects', type: 'quiz', duration: 45 },
          { id: 'lang-l6', title: 'Research Skills', type: 'reading', duration: 20 },
        ],
      }
    ],
  },
  {
    id: 'computer-science',
    name: 'Computer Science (Forms 1-4)',
    description: 'Developing skills in computational thinking, problem-solving, and technology.',
    imageUrl: 'https://picsum.photos/seed/cs-course/400/225',
    imageHint: 'computer code',
    courses: [
      {
        id: 'cs-forms-1-4',
        name: 'Computer Science (Forms 1-4)',
        description: 'Covering fundamentals, networking, data management, and programming.',
        tutor: 'Mr. David Chen',
        duration: '4 years',
        curriculum: [
          { id: 'cs-l1', title: 'Computer Systems and Fundamentals', type: 'reading', duration: 20 },
          { id: 'cs-l2', title: 'Communication and Networking', type: 'video', duration: 25 },
          { id: 'cs-l3', title: 'Data Management (Databases, Spreadsheets)', type: 'reading', duration: 30 },
          { id: 'cs-l4', title: 'Programming and Algorithms', type: 'video', duration: 40 },
          { id: 'cs-l5', title: 'Technology in Society', type: 'quiz', duration: 35 },
        ],
      }
    ],
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Discover the laws of the universe, from biology to physics.',
    imageUrl: 'https://picsum.photos/seed/202/400/225',
    imageHint: 'science laboratory',
    courses: [],
  },
];

export const studentData = {
  name: 'Alex Johnson',
  progress: [
    { subject: 'Mathematics', grade: 88, progress: 75 },
    { subject: 'Science', grade: 92, progress: 80 },
    { subject: 'History', grade: 78, progress: 60 },
    { subject: 'English', grade: 95, progress: 90 },
  ],
  overallProgress: 76,
  recentSubjects: ['Mathematics', 'Science'],
  learningGoals: 'Improve my understanding of Geometry and prepare for the SATs.'
};

export const resourceLibrary: ResourceSubject[] = [
  {
    id: 'english-resources',
    title: 'English Language',
    topics: [
      { id: 'eng-topic-1', title: 'Reading and Comprehension', resources: [] },
      { id: 'eng-topic-2', title: 'Creative and Functional Writing', resources: [] },
      { id: 'eng-topic-3', title: 'Language Structures', resources: [] },
      { id: 'eng-topic-4', title: 'Oral and Aural Skills', resources: [] },
    ],
  },
  {
    id: 'math-resources',
    title: 'Mathematics',
    topics: [
      {
        id: 'math-topic-1',
        title: 'Number Concepts and Operations',
        resources: [
          { id: 'alg-pdf-1', title: 'Real Numbers Workbook', type: 'pdf', url: '#', size: '5.2 MB', image: 'https://picsum.photos/seed/resource-alg-1/600/400', imageHint: 'math workbook' },
          { id: 'alg-vid-1', title: 'Consumer Arithmetic Explained', type: 'video', url: '#', size: '120 MB', image: 'https://picsum.photos/seed/resource-alg-2/600/400', imageHint: 'math lecture' },
        ],
      },
      {
        id: 'math-topic-2',
        title: 'Algebraic Manipulation',
        resources: [
          { id: 'geo-ws-1', title: 'Simultaneous Equations Worksheet', type: 'worksheet', url: '#', size: '1.8 MB', image: 'https://picsum.photos/seed/resource-geo-1/600/400', imageHint: 'geometry diagrams' },
          { id: 'geo-word-1', title: 'Functional Graphs Guide', type: 'word', url: '#', size: '3.1 MB', image: 'https://picsum.photos/seed/resource-geo-2/600/400', imageHint: 'geometric proofs' },
        ],
      },
      { id: 'math-topic-3', title: 'Mensuration', resources: [] },
      { id: 'math-topic-4', title: 'Geometry and Trigonometry', resources: [] },
      { id: 'math-topic-5', title: 'Matrices and Transformations', resources: [] },
      { id: 'math-topic-6', title: 'Statistics and Probability', resources: [] },
    ],
  },
  {
    id: 'additional-mathematics-resources',
    title: 'Additional Mathematics',
    topics: [
        { id: 'add-math-topic-1', title: 'Algebra', resources: [] },
        { id: 'add-math-topic-2', title: 'Calculus', resources: [] },
        { id: 'add-math-topic-3', title: 'Vectors', resources: [] },
        { id: 'add-math-topic-4', title: 'Trigonometry', resources: [] },
        { id: 'add-math-topic-5', title: 'Statistics and Probability', resources: [] },
    ],
  },
  {
    id: 'biology-resources',
    title: 'Biology',
    topics: [
      {
        id: 'bio-topic-1',
        title: 'Cells and Living Organisms',
        resources: [
          { id: 'bio-art-1', title: 'The Structure of a Cell', type: 'article', url: '#', size: '850 KB', image: 'https://picsum.photos/seed/resource-bio-1/600/400', imageHint: 'cell diagram' },
          { id: 'bio-vid-1', title: 'Photosynthesis Explained', type: 'video', url: '#', size: '250 MB', image: 'https://picsum.photos/seed/resource-bio-2/600/400', imageHint: 'plant leaves' },
        ],
      },
      { id: 'bio-topic-2', title: 'Human Biology', resources: [] },
      { id: 'bio-topic-3', title: 'Ecology', resources: [] },
      { id: 'bio-topic-4', title: 'Genetics and Inheritance', resources: [] },
      { id: 'bio-topic-5', title: 'Agriculture and Environmental Science', resources: [] },
    ],
  },
  {
    id: 'history-resources',
    title: 'History',
    topics: [
        { id: 'hist-topic-1', title: 'Identity and National History', resources: [] },
        { id: 'hist-topic-2', title: 'Cultural Heritage and Citizenship', resources: [] },
        { id: 'hist-topic-3', title: 'Pre-Colonial Economies', resources: [] },
        { id: 'hist-topic-4', title: 'The Colonial Period Economy', resources: [] },
        { id: 'hist-topic-5', title: 'Economic History of Zimbabwe since 1980', resources: [] },
    ],
  },
  {
    id: 'chemistry-resources',
    title: 'Chemistry',
    topics: [
        { id: 'chem-topic-1', title: 'Introduction to Chemistry', resources: [] },
        { id: 'chem-topic-2', title: 'The Particulate Nature of Matter', resources: [] },
        { id: 'chem-topic-3', title: 'Atomic Structure and the Periodic Table', resources: [] },
        { id: 'chem-topic-4', title: 'Chemical Bonding and Stoichiometry', resources: [] },
        { id: 'chem-topic-5', title: 'Acids, Bases, and Salts', resources: [] },
        { id: 'chem-topic-6', title: 'Organic Chemistry', resources: [] },
        { id: 'chem-topic-7', title: 'Industrial Processes', resources: [] },
    ],
  },
  {
    id: 'geography-resources',
    title: 'Geography',
    topics: [
        { id: 'geo-topic-1', title: 'Map Work and GIS', resources: [] },
        { id: 'geo-topic-2', title: 'Physical Geography', resources: [] },
        { id: 'geo-topic-3', title: 'Human and Economic Geography', resources: [] },
        { id: 'geo-topic-4', title: 'Environmental Issues', resources: [] },
    ],
  },
  {
    id: 'commerce-resources',
    title: 'Commerce',
    topics: [
        { id: 'com-topic-1', title: 'Business Fundamentals', resources: [] },
        { id: 'com-topic-2', title: 'Trade and Aids to Trade', resources: [] },
        { id: 'com-topic-3', title: 'Financial Management', resources: [] },
        { id: 'com-topic-4', title: 'Marketing and Consumer Protection', resources: [] },
        { id: 'com-topic-5', title: 'International Trade', resources: [] },
    ],
  },
  {
    id: 'accounting-resources',
    title: 'Principles of Accounting',
    topics: [
        { id: 'acc-topic-1', title: 'Introduction to Accounting', resources: [] },
        { id: 'acc-topic-2', title: 'Financial Records', resources: [] },
        { id: 'acc-topic-3', title: 'Final Accounts', resources: [] },
        { id: 'acc-topic-4', title: 'Financial Statements Analysis', resources: [] },
    ],
  },
  {
    id: 'business-enterprise-resources',
    title: 'Business Enterprise and Skills',
    topics: [
        { id: 'bes-topic-1', title: 'The Entrepreneur', resources: [] },
        { id: 'bes-topic-2', title: 'Business Planning', resources: [] },
        { id: 'bes-topic-3', title: 'Business Operations', resources: [] },
        { id: 'bes-topic-4', title: 'Legislation', resources: [] },
    ],
  },
  {
    id: 'literature-indigenous-resources',
    title: 'Literature in Indigenous Languages',
    topics: [
        { id: 'lit-lang-topic-1', title: 'Literary Genres', resources: [] },
        { id: 'lit-lang-topic-2', title: 'Literary Analysis', resources: [] },
        { id: 'lit-lang-topic-3', title: 'Oral Literature', resources: [] },
        { id: 'lit-lang-topic-4', title: 'Creative Writing', resources: [] },
    ],
  },
  {
    id: 'indigenous-languages-resources',
    title: 'Indigenous Languages (Shona)',
    topics: [
        { id: 'shona-topic-1', title: 'Communication and Language Skills', resources: [] },
        { id: 'shona-topic-2', title: 'Creative and Functional Writing', resources: [] },
        { id: 'shona-topic-3', title: 'Language Structure', resources: [] },
        { id: 'shona-topic-4', title: 'Literary Genres and Analysis', resources: [] },
        { id: 'shona-topic-5', title: 'Cultural and Social Aspects', resources: [] },
        { id: 'shona-topic-6', title: 'Research Skills', resources: [] },
    ],
  },
  {
    id: 'cs-resources',
    title: 'Computer Science',
    topics: [
        { id: 'cs-topic-1', title: 'Computer Systems and Fundamentals', resources: [] },
        { id: 'cs-topic-2', title: 'Communication and Networking', resources: [] },
        { id: 'cs-topic-3', title: 'Data Management', resources: [] },
        { id: 'cs-topic-4', title: 'Programming and Algorithms', resources: [] },
        { id: 'cs-topic-5', title: 'Technology in Society', resources: [] },
    ],
  },
  {
    id: 'science-resources',
    title: 'Science',
    topics: [
      {
        id: 'physics-topics',
        title: 'Physics',
        resources: [
            { id: 'phy-ppt-1', title: 'Newton\'s Laws', type: 'ppt', url: '#', size: '8.5 MB', image: 'https://picsum.photos/seed/resource-phy-1/600/400', imageHint: 'physics presentation' },
        ],
      },
      {
        id: 'chemistry-topics',
        title: 'Chemistry',
        resources: [],
      },
    ],
  },
  {
    id: 'business-studies-resources',
    title: 'Business studies',
    topics: [
        {
        id: 'marketing-topics',
        title: 'Marketing',
        resources: [
          { id: 'mkt-excel-1', title: 'Marketing Budget Template', type: 'excel', url: '#', size: '450 KB', image: 'https://picsum.photos/seed/resource-mkt-1/600/400', imageHint: 'spreadsheet chart' },
        ],
      },
    ],
  },
  {
    id: 'physics-resources',
    title: 'Physics',
    topics: [],
  },
  {
    id: 'ict-resources',
    title: 'ICT',
    topics: [],
  },
  {
    id: 'pe-resources',
    title: 'Physical Education',
    topics: [],
  },
  {
    id: 'economics-resources',
    title: 'Economics',
    topics: [],
  },
  {
    id: 'english-lit-resources',
    title: 'English Literature',
    topics: [
        {
        id: 'shakespeare-topics',
        title: 'Shakespeare',
        resources: [
          { id: 'shk-mp3-1', title: 'Hamlet Audiobook', type: 'mp3', url: '#', size: '150 MB', image: 'https://picsum.photos/seed/resource-shk-1/600/400', imageHint: 'audiobook player' },
        ],
      },
    ],
  },
  {
    id: 'performing-arts-resources',
    title: 'Performing arts',
    topics: [],
  },
  {
    id: 'religious-studies-resources',
    title: 'Religious studies',
    topics: [],
  },
  {
    id: 'sociology-resources',
    title: 'Sociology',
    topics: [],
  },
  {
    id: 'agriculture-resources',
    title: 'Agriculture',
    topics: [],
  },
  {
    id: 'design-tech-resources',
    title: 'Design and Technology',
    topics: [],
  },
  {
    id: 'visual-arts-resources',
    title: 'Visual Arts',
    topics: [],
  },
  {
    id: 'business-english-resources',
    title: 'Business English',
    topics: [],
  },
];
