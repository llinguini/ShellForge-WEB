export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sf-bg flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <span className="sf-display text-2xl">
          <span className="not-italic font-bold">Shell</span>Forge
        </span>
      </div>
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
