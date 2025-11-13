
'use server';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Code,
  Music,
  Palette,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Course } from '@/lib/types';
import CourseCard from '@/components/course-card';
import HomePageClient from './home-page-client';


export default async function Home() {
  return <HomePageClient />;
}
