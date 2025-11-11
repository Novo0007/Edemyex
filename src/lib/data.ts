import type { Course, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  if (!image) {
    return {
      imageUrl: 'https://picsum.photos/seed/error/600/400',
      imageHint: 'abstract error',
    };
  }
  return { imageUrl: image.imageUrl, imageHint: image.imageHint };
};

const allCourses: Course[] = [
  {
    id: '1',
    title: 'JavaScript for Beginners',
    description: 'A comprehensive guide to JavaScript, from the very basics to advanced concepts. This course is perfect for anyone looking to start their journey in web development. You will learn about variables, data types, functions, objects, and the DOM.',
    creator: 'Jane Doe',
    creatorAvatar: getImage('user-avatar-1').imageUrl,
    price: 49.99,
    ...getImage('js-beginners'),
    category: 'Programming',
    videos: [
      { title: 'Introduction to JavaScript', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 300 },
      { title: 'Variables and Data Types', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 620 },
      { title: 'Functions and Scope', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 750 },
    ],
  },
  {
    id: '2',
    title: 'React Masterclass',
    description: 'Take your React skills to the next level. This masterclass covers hooks, context, performance optimization, and building large-scale applications. Prerequisite: Basic knowledge of JavaScript and React.',
    creator: 'John Smith',
    creatorAvatar: getImage('user-avatar-2').imageUrl,
    price: 99.99,
    ...getImage('react-masterclass'),
    category: 'Programming',
    videos: [
      { title: 'Advanced Hooks', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 1200 },
      { title: 'State Management with Context', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 1500 },
    ],
  },
  {
    id: '3',
    title: 'The Art of Watercolor',
    description: 'Discover the beauty of watercolor painting. This course covers everything from choosing your materials to advanced techniques like wet-on-wet, dry brushing, and creating stunning landscapes.',
    creator: 'Emily White',
    creatorAvatar: getImage('user-avatar-3').imageUrl,
    price: 39.99,
    ...getImage('watercolor-art'),
    category: 'Arts',
    videos: [
      { title: 'Materials and Setup', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 450 },
      { title: 'Basic Techniques', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 900 },
      { title: 'Painting a Landscape', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 1800 },
    ],
  },
  {
    id: '4',
    title: 'Digital Illustration in Procreate',
    description: 'Unleash your creativity with Procreate on the iPad. Learn to create stunning digital illustrations, from initial sketches to final polished artwork. We will cover layers, brushes, color theory, and more.',
    creator: 'Alex Green',
    creatorAvatar: getImage('user-avatar-4').imageUrl,
    price: 59.99,
    ...getImage('procreate-illustration'),
    category: 'Design',
    videos: [
      { title: 'Getting Started with Procreate', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 600 },
      { title: 'Character Design Basics', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 1100 },
    ],
  },
  {
    id: '5',
    title: 'Introduction to Guitar',
    description: 'Always wanted to play the guitar? This is the place to start. Learn basic chords, strumming patterns, and your first few songs in this easy-to-follow beginner course.',
    creator: 'Jane Doe',
    creatorAvatar: getImage('user-avatar-1').imageUrl,
    price: 29.99,
    ...getImage('guitar-intro'),
    category: 'Music',
    videos: [
      { title: 'Your First Chords', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 800 },
      { title: 'Strumming Patterns', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 700 },
    ],
  },
  {
    id: '6',
    title: 'Music Production with Ableton Live',
    description: 'Learn how to produce professional-quality music with Ableton Live. This course covers everything from the basics of the interface to recording, synthesis, mixing, and mastering.',
    creator: 'John Smith',
    creatorAvatar: getImage('user-avatar-2').imageUrl,
    price: 79.99,
    ...getImage('ableton-production'),
    category: 'Music',
    videos: [
      { title: 'Ableton Live Interface', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 950 },
      { title: 'Creating Your First Beat', url: 'https://www.youtube.com/embed/W6NZfCO5SIk', duration: 1300 },
    ],
  },
];

// In a real app, this would be stored in a database and associated with a logged-in user.
let mockUser: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  avatarUrl: getImage('creator-avatar').imageUrl,
  purchasedCourses: ['2'], // User already owns 'React Masterclass'
  browsingHistory: ['1', '3'],
  favoriteCreatorIds: ['user-avatar-1', 'user-avatar-3'],
};

// Simulate a database
let coursesDB = [...allCourses];
let userDB = { ...mockUser };

export async function getCourses(): Promise<Course[]> {
  // In a real app, you'd fetch this from a database
  return Promise.resolve(coursesDB);
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  return Promise.resolve(coursesDB.find((course) => course.id === id));
}

export async function getPurchasedCourses(userId: string): Promise<Course[]> {
  const user = await getUserById(userId);
  if (!user) return [];
  const purchased = coursesDB.filter((course) => user.purchasedCourses.includes(course.id));
  return Promise.resolve(purchased);
}

export async function getUserById(userId: string): Promise<User | undefined> {
    // In a real app, you'd fetch this from a database
    if (userId === userDB.id) {
        return Promise.resolve(userDB);
    }
    return Promise.resolve(undefined);
}


export async function purchaseCourse(userId: string, courseId: string): Promise<boolean> {
  if (userDB.id === userId && !userDB.purchasedCourses.includes(courseId)) {
    userDB.purchasedCourses.push(courseId);
    return true;
  }
  return false;
}

export async function createCourse(courseData: Omit<Course, 'id' | 'creatorAvatar'>): Promise<Course> {
  const newCourse: Course = {
    id: (coursesDB.length + 1).toString(),
    ...courseData,
    creatorAvatar: userDB.avatarUrl,
  };
  coursesDB.push(newCourse);
  return newCourse;
}

export async function getRecommendedCourses(): Promise<Course[]> {
  // This is a mock implementation of AI recommendations.
  // In a real app, this would involve a call to an AI service.
  const recommendedIds = ['1', '4', '5'];
  const recommended = coursesDB.filter(course => recommendedIds.includes(course.id));
  return Promise.resolve(recommended);
}
