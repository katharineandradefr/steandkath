export default function HomePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        <span className="text-brand-bright drop-shadow-[0_0_28px_color-mix(in_oklab,var(--color-brand)_45%,transparent)]">
          Vibe
        </span>{" "}
        <span className="text-white">coding</span>
        <span className="mt-2 block text-2xl font-bold text-white/75 sm:text-3xl">
          modelo
        </span>
      </h1>
      <p className="mt-6 text-lg text-white/70">
        Comece descrevendo o que você quer construir no chat da IA. Este é o
        painel inicial — as outras páginas estão vazias para você preencher.
      </p>
    </div>
  );
}
