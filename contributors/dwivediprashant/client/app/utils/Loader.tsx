export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 animate-spin">
          <img
            src="/logo.png"
            alt="Loading..."
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-[#B3B3B3] text-sm font-medium animate-pulse">
          Loading subscriptions...
        </div>
      </div>
    </div>
  );
}
