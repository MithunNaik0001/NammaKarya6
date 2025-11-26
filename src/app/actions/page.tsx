'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';

export default function ActionsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-6xl mx-auto my-20 px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-semibold text-blue-700 mb-4">
            Empowering Local Skilled Workers
          </h2>
          <p className="text-gray-700 mb-3">
            The platform bridges the gap between skilled workers and customers who need reliable services.
            By enabling direct hiring, SkillLink ensures fair wages, flexible work, and transparent job opportunities.
          </p>
          <p className="text-gray-700">
            Whether you’re fixing a leaky pipe or building furniture — find verified local experts nearby
            and get your tasks done with confidence.
          </p>
        </div>
        <Image
          src="https://picsum.photos/seed/workers/600/400"
          alt="Workers"
          width={600}
          height={400}
          data-ai-hint="construction workers"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Hire a Professional</CardTitle>
            <CardDescription>
              Find the right person for your job, with the skills and experience you need.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/hire-proffesion">Hire a Professional</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Join as a Worker</CardTitle>
            <CardDescription>
              Join our network to find job opportunities and grow your business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/seeker-professional">Join as a Worker</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
