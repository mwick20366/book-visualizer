// src/app/dashboard/books/page.tsx
import BooksGrid from "./books-grid";

export default async function BooksPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <BooksGrid />
    </div>
  );
}