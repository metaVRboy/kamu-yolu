type TickerItem = {
  id: string;
  title: string;
  institutionName: string;
};

export function PostingTicker({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;

  // Kesintisiz kaymasi icin liste iki kez tekrarlaniyor.
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-marquee gap-3">
        {doubled.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm whitespace-nowrap text-slate-700"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="font-medium text-slate-900">{item.title}</span>
            <span className="text-slate-400">—</span>
            <span className="text-muted-foreground">{item.institutionName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
