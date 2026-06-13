type PaletteStripProps = {
  colors: string[];
};

export function PaletteStrip({ colors }: PaletteStripProps) {
  if (colors.length === 0) {
    return <p className="mt-5 border-t border-line pt-3 text-sm text-fog">No colors detected</p>;
  }

  return (
    <div className="mt-6 grid grid-cols-5 overflow-hidden border border-line">
      {colors.slice(0, 5).map((color) => (
        <div className="min-w-0 border-r border-line last:border-r-0" key={color}>
          <div className="h-20 border-b border-line" style={{ background: color }} />
          <div className="overflow-hidden bg-white/[0.025] px-2 py-2">
            <span className="block truncate font-mono text-[10px] uppercase text-fog" title={color}>
              {color}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
