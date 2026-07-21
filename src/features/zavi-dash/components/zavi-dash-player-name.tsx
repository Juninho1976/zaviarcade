"use client";

type ZaviDashPlayerNameProps = {
  onChange: (playerName: string) => void;
  value: string;
};

export function ZaviDashPlayerName({ onChange, value }: ZaviDashPlayerNameProps) {
  return (
    <section className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5" aria-labelledby="zavi-dash-player-name-heading">
      <h3 id="zavi-dash-player-name-heading" className="text-lg font-bold text-slate-950">Choose your player name</h3>
      <p className="mt-1 max-w-2xl leading-7 text-slate-700">Enter your name before playing. A completed run is saved to the leaderboard with this name, and it stays ready while you retry.</p>
      <label className="mt-4 flex max-w-xl flex-col gap-2 text-sm font-semibold text-slate-800" htmlFor="zavi-dash-player-name">
        Player name
        <input
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
          id="zavi-dash-player-name"
          maxLength={24}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Your name"
          value={value}
        />
      </label>
    </section>
  );
}
