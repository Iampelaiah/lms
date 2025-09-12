
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
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Explore the world of numbers, from basic algebra to advanced calculus.',
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
      {
        id: 'additional-mathematics',
        name: 'Additional Mathematics (Forms 3-4)',
        description: 'For students seeking a deeper understanding of mathematical principles.',
        tutor: 'Dr. Evelyn Reed',
        duration: '2 years',
        curriculum: [
          { id: 'add-math-l1', title: 'Algebra (Quadratics, Polynomials)', type: 'reading', duration: 30 },
          { id: 'add-math-l2', title: 'Calculus (Differentiation, Integration)', type: 'video', duration: 40 },
          { id: 'add-math-l3', title: 'Matrices and Determinants', type: 'reading', duration: 25 },
          { id: 'add-math-l4', title: 'Vectors in Geometry', type: 'video', duration: 30 },
          { id: 'add-math-l5', title: 'Advanced Trigonometry', type: 'quiz', duration: 45 },
          { id: 'add-math-l6', title: 'Advanced Statistics and Probability', type: 'reading', duration: 25 },
        ],
      },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Discover the laws of the universe, from biology to physics.',
    imageUrl: 'https://picsum.photos/seed/202/400/225',
    imageHint: 'science laboratory',
    courses: [
        {
          id: 'biology-101',
          name: 'Biology 101',
          description: 'The study of life and living organisms.',
          tutor: 'Dr. Ben Carter',
          duration: '12 weeks',
          curriculum: [],
        }
    ],
  },
  {
    id: 'history',
    name: 'History',
    description: 'Journey through time and uncover the stories of our past.',
    imageUrl: 'https://picsum.photos/seed/203/400/225',
    imageHint: 'historical artifacts',
    courses: [],
  },
  {
    id: 'english',
    name: 'English',
    description: 'Master the art of language, literature, and composition.',
    imageUrl: 'https://picsum.photos/seed/204/400/225',
    imageHint: 'books library',
    courses: [],
  },
   {
    id: 'computer-science',
    name: 'Computer Science',
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
    id: 'geography',
    name: 'Geography',
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
    name: 'Commerce',
    description: 'Provides practical enterprise skills and business-related competencies.',
    imageUrl: 'https://picsum.photos/seed/com-course/400/225',
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
    id: 'chemistry',
    name: 'Chemistry',
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
    id: 'indigenous-languages',
    name: 'Indigenous Languages',
    description: 'Enhancing communication skills and cultural identity.',
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
    id: 'biology-resources',
    title: 'Biology',
    topics: [
      {
        id: 'biology-topics',
        title: 'General Biology',
        resources: [
          { id: 'bio-art-1', title: 'The Structure of a Cell', type: 'article', url: '#', size: '850 KB', image: 'https://picsum.photos/seed/resource-bio-1/600/400', imageHint: 'cell diagram' },
          { id: 'bio-vid-1', title: 'Photosynthesis Explained', type: 'video', url: '#', size: '250 MB', image: 'https://picsum.photos/seed/resource-bio-2/600/400', imageHint: 'plant leaves' },
        ],
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
  {
    id: 'shona-resources',
    title: 'Shona',
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
    id: 'history-resources',
    title: 'History',
    topics: [],
  },
   {
    id: 'accounting-resources',
    title: 'Accounting',
    topics: [],
  },
];

    