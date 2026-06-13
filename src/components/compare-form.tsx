import type { FormEventHandler } from "react";

type CompareFormProps = {
  error: string | null;
  isLoading: boolean;
  leftUrl: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  rightUrl: string;
  sampleUrls?: string[];
  setLeftUrl: (url: string) => void;
  setRightUrl: (url: string) => void;
};

export function CompareForm({
  error,
  isLoading,
  leftUrl,
  onSubmit,
  rightUrl,
  sampleUrls = [],
  setLeftUrl,
  setRightUrl,
}: CompareFormProps) {
  return (
    <form className="mt-12" onSubmit={onSubmit}>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-fog">Comparison URLs</p>
      <div className="mt-3 grid gap-3">
        <input
          aria-label="First comparison URL"
          className="min-h-14 border border-line bg-white/[0.03] px-4 text-base text-bone outline-none transition placeholder:text-fog/50 focus:border-ember/70 focus:bg-white/[0.055] focus:ring-2 focus:ring-ember/30"
          inputMode="url"
          onChange={(event) => setLeftUrl(event.target.value)}
          placeholder="https://site-a.com"
          type="text"
          value={leftUrl}
        />
        <input
          aria-label="Second comparison URL"
          className="min-h-14 border border-line bg-white/[0.03] px-4 text-base text-bone outline-none transition placeholder:text-fog/50 focus:border-ember/70 focus:bg-white/[0.055] focus:ring-2 focus:ring-ember/30"
          inputMode="url"
          onChange={(event) => setRightUrl(event.target.value)}
          placeholder="https://site-b.com"
          type="text"
          value={rightUrl}
        />
        <button
          className="min-h-14 border border-bone/30 bg-bone px-6 font-mono text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-white focus:ring-2 focus:ring-ember/50 disabled:cursor-wait disabled:border-line disabled:bg-white/10 disabled:text-fog"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Comparing" : "Compare"}
        </button>
      </div>
      {sampleUrls.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {sampleUrls.map((sampleUrl, index) => (
            <button
              className="border border-line bg-white/[0.025] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-fog transition hover:border-ember/60 hover:text-bone focus:ring-2 focus:ring-ember/40"
              key={sampleUrl}
              onClick={() => (index % 2 === 0 ? setLeftUrl(sampleUrl) : setRightUrl(sampleUrl))}
              type="button"
            >
              {sampleUrl}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
    </form>
  );
}
