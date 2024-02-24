import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type ReflecionId, reflecionIdSchema, reflecions } from "@/lib/db/schema/reflecions";
import { books } from "@/lib/db/schema/books";

export const getReflecions = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select({ reflecion: reflecions, book: books }).from(reflecions).leftJoin(books, eq(reflecions.bookId, books.id)).where(eq(reflecions.userId, session?.user.id!));
  const r = rows .map((r) => ({ ...r.reflecion, book: r.book})); 
  return { reflecions: r };
};

export const getReflecionById = async (id: ReflecionId) => {
  const { session } = await getUserAuth();
  const { id: reflecionId } = reflecionIdSchema.parse({ id });
  const [row] = await db.select({ reflecion: reflecions, book: books }).from(reflecions).where(and(eq(reflecions.id, reflecionId), eq(reflecions.userId, session?.user.id!))).leftJoin(books, eq(reflecions.bookId, books.id));
  if (row === undefined) return {};
  const r =  { ...row.reflecion, book: row.book } ;
  return { reflecion: r };
};


