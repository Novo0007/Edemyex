export interface Course {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorAvatar: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  category: string;
  videos: {
    title: string;
    url: string;
    duration: number; // in seconds
  }[];
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  purchasedCourses: string[];
  browsingHistory: string[];
}
