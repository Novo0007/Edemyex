import { redirect } from 'next/navigation';

export default function CreatorPage() {
  // Redirect to the dashboard page by default
  redirect('/creator/dashboard');
}