interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <section className="border-b border-border/60 bg-[var(--gradient-warm)]">
      <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        {eyebrow && (
          <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
