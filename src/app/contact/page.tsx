
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ContactPage() {
  const skills = [
    { name: 'HTML', color: 'E34F26', logo: 'html5', logoColor: 'white' },
    { name: 'JSON', color: '000', logo: 'json', logoColor: 'fff' },
    { name: 'JavaScript', color: 'F7DF1E', logo: 'javascript', logoColor: '000' },
    { name: 'Java', color: 'ED8B00', logo: 'openjdk', logoColor: 'white' },
    { name: 'TypeScript', color: '3178C6', logo: 'typescript', logoColor: 'fff' },
    { name: 'React Router', color: 'CA4245', logo: 'react-router', logoColor: 'white' },
    { name: 'Next.js', color: 'black', logo: 'next.js', logoColor: 'white' },
    { name: 'React', color: '61DAFB', logo: 'react', logoColor: 'white' },
    { name: 'React Hook Form', color: 'EC5990', logo: 'reacthookform', logoColor: 'fff' },
    { name: 'Vite', color: '646CFF', logo: 'vite', logoColor: 'fff' },
    { name: 'Google Cloud', color: '4285F4', logo: 'google-cloud', logoColor: 'white' },
    { name: 'Firebase', color: '039BE5', logo: 'Firebase', logoColor: 'white' },
    { name: 'Vercel', color: '000000', logo: 'vercel', logoColor: 'white' },
    { name: 'Cloudflare', color: 'F38020', logo: 'Cloudflare', logoColor: 'white' },
    { name: 'Google Gemini', color: '886FBF', logo: 'googlegemini', logoColor: 'fff' },
    { name: 'ChatGPT', color: '74aa9c', logo: 'openai', logoColor: 'white' },
    { name: 'GitHub Copilot', color: '000', logo: 'githubcopilot', logoColor: 'fff' },
    { name: 'Google Assistant', color: '4285F4', logo: 'googleassistant', logoColor: 'fff' },
    { name: 'GitHub', color: '121011', logo: 'github', logoColor: 'white' },
    { name: 'GitLab', color: 'FC6D26', logo: 'gitlab', logoColor: 'fff' },
    { name: 'Unity', color: '000000', logo: 'unity', logoColor: 'white' },
    { name: 'GameMaker', color: '000', logo: 'gamemaker', logoColor: 'fff' },
    { name: 'npm', color: 'CB3837', logo: 'npm', logoColor: 'fff' },
    { name: 'Composer', color: '885630', logo: 'composer', logoColor: 'fff' },
    { name: 'Bootstrap', color: '7952B3', logo: 'bootstrap', logoColor: 'fff' },
    { name: 'Node.js', color: '6DA55F', logo: 'node.js', logoColor: 'white' },
    { name: 'React Query', color: 'FF4154', logo: 'reactquery', logoColor: 'fff' },
    { name: 'Tailwind CSS', color: '38B2AC', logo: 'tailwind-css', logoColor: 'white' },
    { name: 'Supabase', color: '3FCF8E', logo: 'supabase', logoColor: 'fff' },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">About Me</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <p className="text-muted-foreground">
              I’m someone who loves technology and enjoys turning ideas into working software. I like learning new things, solving problems, and improving my skills every day through hands-on development.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">My Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <img key={skill.name} src={`https://img.shields.io/badge/${skill.name.replace(/\s/g, '%20')}-${skill.color}.svg?logo=${skill.logo}&logoColor=${skill.logoColor}`} alt={`${skill.name} badge`} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">GitHub Stats</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col items-center gap-4">
                <img className="w-full" src="https://readme-stats-fork-mauve.vercel.app/api/?username=Novo0007&theme=dark&show_icons=true&count_private=true" alt="GitHub Stats" />
                <img className="w-full" src="https://github-readme-streak-stats-five-roan.vercel.app?user=Novo0007&theme=dark" alt="GitHub Streak" />
              </div>
              <div className="flex items-center justify-center">
                <img className="max-w-full" src="https://readme-stats-fork-mauve.vercel.app/api/top-langs/?username=Novo0007&theme=dark&hide_border=false&no-bg=true&no-frame=true&langs_count=6" alt="Top Languages" />
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="mb-4 text-2xl font-semibold">Connect with me</h2>
            <p className="text-muted-foreground">
              🔗 LinkedIn: <a href="https://www.linkedin.com/in/nnctec/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Jyotirmoy Sarkar</a>
              <span className="mx-2">|</span>
              Email: <a href="mailto:mynameisjyotirmoy@gmail.com" className="text-primary hover:underline">mynameisjyotirmoy@gmail.com</a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
