import { Hero, Features, Stats, Testimonials, CTA, FloatingElements } from '@/components/landing';

export default function Home() {
  return (
    <main className="relative">
      <FloatingElements />
      <Hero />
      <Features />
      <Stats />
      <Testimonials />
      <CTA />
    </main>
  );
}