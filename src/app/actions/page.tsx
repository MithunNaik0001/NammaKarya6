'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';

export default function ActionsPage() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative"
      style={{
        backgroundImage: "url('/hire.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh"
      }}
    >
      <div className="absolute inset-0 bg-white/75"></div>
      <div className="logo flex items-center absolute top-4 left-4 z-10">
        <img src="logo.png" alt="NammaKarya Logo" className="h-10 mr-3" />
        <span className="text-2xl font-bold text-gray-800">NammaKarya</span>
      </div>
      <div className="max-w-7xl mx-auto my-28 px-8 grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div className="max-w-5xl">
          <h2 className="text-6xl font-bold text-gray-800 mb-8 leading-tight">
            Empowering Local Skilled Workers
          </h2>
          <p className="text-gray-700 mb-6 text-xl leading-relaxed max-w-4xl">
            The platform bridges the gap between skilled workers and customers who need reliable services.
            By enabling direct hiring, NammaKarya ensures fair wages, flexible work, and transparent job opportunities.
          </p>
          <p className="text-gray-600 text-xl max-w-4xl leading-relaxed">
            Whether you're fixing a leaky pipe or building furniture — find verified local experts nearby
            and get your tasks done with confidence.
          </p>
        </div>

      </div>
      <div className="flex justify-end items-center w-full max-w-6xl px-6 absolute right-6 top-1/2 transform -translate-y-1/2 z-10">
        <div className="flex flex-col gap-6 w-96">
          <Card className="shadow-xl border-gray-100 bg-white p-6">
            <CardHeader>
              <CardTitle className="text-gray-800 text-2xl mb-3">Hire a Professional</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Find the right person for your job, with the skills and experience you need.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#F5DB40] hover:bg-[#E6C936] text-black font-semibold shadow-lg text-lg py-4 px-6">
                <Link href="/hire-proffesion">Hire a Professional</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-xl border-gray-100 bg-white p-6">
            <CardHeader>
              <CardTitle className="text-gray-800 text-2xl mb-3">Join as a Worker</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Join our network to find job opportunities and grow your business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#F5DB40] hover:bg-[#E6C936] text-black font-semibold shadow-lg text-lg py-4 px-6">
                <Link href="/seeker-professional">Join as a Worker</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
