export default function Footer() {
  return (
    <footer className="border-t border-charcoal-800/50 bg-charcoal-950">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-charcoal-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Savory Restaurant. All rights reserved.</p>
      </div>
    </footer>
  )
}
