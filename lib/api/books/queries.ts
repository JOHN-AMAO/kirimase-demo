import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type BookId, bookIdSchema, books } from "@/lib/db/schema/books";
import { authors } from "@/lib/db/schema/authors";
import { quotes, type CompleteQuote } from "@/lib/db/schema/quotes";
import { reflecions, type CompleteReflecion } from "@/lib/db/schema/reflecions";

export const getBooks = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select({ book: books, author: authors }).from(books).leftJoin(authors, eq(books.authorId, authors.id)).where(eq(books.userId, session?.user.id!));
  const b = rows .map((r) => ({ ...r.book, author: r.author})); 
  return { books: b };
};

export const getBookById = async (id: BookId) => {
  const { session } = await getUserAuth();
  const { id: bookId } = bookIdSchema.parse({ id });
  const [row] = await db.select({ book: books, author: authors }).from(books).where(and(eq(books.id, bookId), eq(books.userId, session?.user.id!))).leftJoin(authors, eq(books.authorId, authors.id));
  if (row === undefined) return {};
  const b =  { ...row.book, author: row.author } ;
  return { book: b };
};

export const getBookByIdWithQuotesAndReflecions = async (id: BookId) => {
  const { session } = await getUserAuth();
  const { id: bookId } = bookIdSchema.parse({ id });
  const rows = await db.select({ book: books, quote: quotes, reflecion: reflecions }).from(books).where(and(eq(books.id, bookId), eq(books.userId, session?.user.id!))).leftJoin(quotes, eq(books.id, quotes.bookId)).leftJoin(reflecions, eq(books.id, reflecions.bookId));
  if (rows.length === 0) return {};
  const b = rows[0].book;
  const bq = rows.filter((r) => r.quote !== null).map((q) => q.quote) as CompleteQuote[];
  const br = rows.filter((r) => r.reflecion !== null).map((r) => r.reflecion) as CompleteReflecion[];

  return { book: b, quotes: bq, reflecions: br };
};

