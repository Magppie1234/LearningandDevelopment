export default function Footer() {
  return (
    <footer className="py-6 px-8 border-t border-[rgba(0,59,70,0.08)] mt-auto">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-tertiary">
          &copy; {new Date().getFullYear()} Magppie. All rights reserved.
        </p>
        <p className="text-xs text-ink-tertiary">
          Learning & Development Portal
        </p>
      </div>
    </footer>
  )
}
