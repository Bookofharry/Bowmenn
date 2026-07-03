export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center min-h-screen">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-gray-100 rounded-full animate-pulse"></div>
        {/* Inner Spinner */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#0B1F4A] border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-[#0B1F4A] font-bold tracking-widest uppercase text-sm animate-pulse">Loading...</p>
    </div>
  );
}
