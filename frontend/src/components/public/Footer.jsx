export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Insightful Blog. All rights reserved.</p>
        <p>Stories, ideas, and perspectives.</p>
      </div>
    </footer>
  );
}
