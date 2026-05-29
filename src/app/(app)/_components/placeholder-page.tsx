type PlaceholderPageProps = {
  title: string;
};

/**
 * Página temporária até o layout definitivo ser definido.
 */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
      <p className="mt-4 text-white/65">
        Em breve — o layout desta tela será definido depois.
      </p>
    </div>
  );
}
