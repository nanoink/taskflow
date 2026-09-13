export function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50" role="status">
      <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-500">
        <span className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
        Carregando seu espaço…
      </div>
    </div>
  );
}
