export default function Header({ title }: { title: string }) {
  return (
    <header className="bg-[#111111] border-b border-[#222222] h-16 flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-xl font-semibold text-[#FFFFFF]">{title}</h1>
      <div className="w-10 h-10 bg-[#222222] rounded-full flex items-center justify-center">
        <span className="text-[#999999] text-sm font-medium">U</span>
      </div>
    </header>
  );
}
