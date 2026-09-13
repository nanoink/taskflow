import { LoaderCircle } from 'lucide-react';

export function SubmitButton({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-65"
    >
      {isLoading ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : null}
      {isLoading ? 'Aguarde…' : children}
    </button>
  );
}
