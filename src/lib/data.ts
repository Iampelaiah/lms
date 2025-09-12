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
        id: 'algebra-1',
        name: 'Algebra I',
        description: 'An introduction to algebraic concepts.',
        tutor: 'Dr. Evelyn Reed',
        duration: '8 weeks',
        curriculum: [
          { id: 'l1', title: 'Introduction to Variables', type: 'video', duration: 15 },
          { id: 'l2', title: 'Solving Linear Equations', type: 'reading', duration: 25 },
          { id: 'l3', title: 'Understanding Quadratic Equations', type: 'video', duration: 20 },
          { id: 'l4', title: 'Mid-term Quiz', type: 'quiz', duration: 45 },
        ],
      },
      {
        id: 'geometry',
        name: 'Geometry',
        description: 'Learn about shapes, sizes, and the properties of space.',
        tutor: 'Dr. Evelyn Reed',
        duration: '10 weeks',
        curriculum: [],
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
        id: 'algebra',
        title: 'Algebra',
        resources: [
          { id: 'alg-pdf-1', title: 'Algebra I Workbook', type: 'pdf', url: '#', size: '5.2 MB', image: 'https://picsum.photos/seed/resource-alg-1/600/400', imageHint: 'math workbook' },
          { id: 'alg-vid-1', title: 'Introduction to Polynomials', type: 'video', url: '#', size: '120 MB', image: 'https://picsum.photos/seed/resource-alg-2/600/400', imageHint: 'math lecture' },
        ],
      },
      {
        id: 'geometry',
        title: 'Geometry',
        resources: [
          { id: 'geo-ws-1', title: 'Triangle Properties Worksheet', type: 'worksheet', url: '#', size: '1.8 MB', image: 'https://picsum.photos/seed/resource-geo-1/600/400', imageHint: 'geometry diagrams' },
          { id: 'geo-word-1', title: 'Geometry Proofs', type: 'word', url: '#', size: '3.1 MB', image: 'https://picsum.photos/seed/resource-geo-2/600/400', imageHint: 'geometric proofs' },
        ],
      },
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
    id: 'commerce-resources',
    title: 'Commerce',
    topics: [],
  },
  {
    id: 'cs-resources',
    title: 'Computer Science',
    topics: [],
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
    topics: [],
  },
   {
    id: 'geography-resources',
    title: 'Geography',
    topics: [],
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
