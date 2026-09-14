import { Link } from 'react-router-dom';

type AuthLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-[460px]">
        <Link
          to="/login"
          className="mx-auto block w-fit text-xl font-bold tracking-[-0.035em] text-slate-950"
        >
          TaskFlow
        </Link>

        <div className="mt-10 bg-transparent p-6 sm:p-9">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {title}
            </h1>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
