type FeedbackBannerProps = {
  kind: "error" | "success";
  message: string;
};

/**
 * Banner de feedback (erro ou sucesso) abaixo do formulário.
 */
export function FeedbackBanner({ kind, message }: FeedbackBannerProps) {
  const bgClass =
    kind === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white";

  return (
    <div
      role="alert"
      className={`mt-3 rounded-xl px-4 py-3 text-center text-sm font-medium ${bgClass}`}
    >
      {message}
    </div>
  );
}
