export function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh w-full flex-col items-center pb-32 px-4 mx-auto gap-6 max-w-lg">
      {children}
    </main>
  );
}
