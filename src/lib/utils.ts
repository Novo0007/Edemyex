import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  let videoId = null;
  // Regular expression to find a YouTube video ID
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);

  if (match) {
    videoId = match[1];
  } else {
    // If the URL is already an embed URL, we might just have the ID
    const embedRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
    const embedMatch = url.match(embedRegex);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
  }

  if (videoId) {
    // Construct the embed URL with autoplay and other parameters
    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    embedUrl.searchParams.append('autoplay', '1');
    embedUrl.searchParams.append('rel', '0'); // Don't show related videos
    return embedUrl.toString();
  }
  
  // Return the original URL if it's not a recognizable YouTube link
  return url;
}
