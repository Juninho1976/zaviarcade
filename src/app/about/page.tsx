import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Zavi Arcade",
  description: "Learn about Zavi Arcade, a growing collection of games and experiments made by Zavi and family.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12 sm:px-10 lg:py-20">
      <section className="max-w-3xl" aria-labelledby="about-heading">
        <p className="text-sm font-semibold tracking-[0.2em] text-cyan-700 uppercase">About Zavi Arcade</p>
        <h1 id="about-heading" className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">A place to play, build, and explore.</h1>
        <div className="mt-7 space-y-5 text-lg leading-8 text-slate-600">
          <p>
            Zavi Arcade is a growing collection of original games, challenges, and experiments designed by Zavi and built together with family.
          </p>
          <p>
            We are making a welcoming place for children and parents to enjoy simple, thoughtful play. New games and ideas will arrive over time.
          </p>
        </div>
      </section>
    </main>
  );
}
