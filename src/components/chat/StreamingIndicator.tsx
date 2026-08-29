export default function StreamingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 align-middle ml-1">
      <span className="h-1.5 w-1.5 rounded-full bg-neon animate-blink" style={{ animationDelay: '0ms' }} />
      <span className="h-1.5 w-1.5 rounded-full bg-neon animate-blink" style={{ animationDelay: '200ms' }} />
      <span className="h-1.5 w-1.5 rounded-full bg-neon animate-blink" style={{ animationDelay: '400ms' }} />
    </span>
  );
}