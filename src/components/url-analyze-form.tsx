import type { FormEventHandler } from "react";

type UrlAnalyzeFormProps = {
  error: string | null;
  isLoading: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  sampleUrls?: string[];
  setUrl: (url: string) => void;
  url: string;
};

export function UrlAnalyzeForm({
  error,
  isLoading,
  onSubmit,
  sampleUrls = [],
  setUrl,
  url,
}: UrlAnalyzeFormProps) {
  return (
    <form className="mt-12" onSubmit={onSubmit}>
      <label
        className="font-mono text-[11px] uppercase tracking-[0.28em] text-fog"
        htmlFor="website-url"
      >
        Website URL
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          className="min-h-14 flex-1 border border-line bg-white/[0.03] px-4 text-base text-bone outline-none transition placeholder:text-fog/50 focus:border-ember/70 focus:bg-white/[0.055] focus:ring-2 focus:ring-ember/30"
          id="website-url"
          inputMode="url"
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          type="text"
          value={url}
        />
        <button
          className="min-h-14 border border-bone/30 bg-bone px-6 font-mono text-xs uppercase tracking-[0.22em] text-ink transition hover:bg-white focus:ring-2 focus:ring-ember/50 disabled:cursor-wait disabled:border-line disabled:bg-white/10 disabled:text-fog"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Analyzing" : "Analyze"}
        </button>
      </div>
      {sampleUrls.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {sampleUrls.map((sampleUrl) => (
            <button
              className="border border-line bg-white/[0.025] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-fog transition hover:border-ember/60 hover:text-bone focus:ring-2 focus:ring-ember/40"
              key={sampleUrl}
              onClick={() => setUrl(sampleUrl)}
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
