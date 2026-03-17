export function PageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#313338]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5865f2] border-t-transparent" />
        <p className="text-sm text-[#b5bac1]">Loading...</p>
      </div>
    </div>
  );
}
