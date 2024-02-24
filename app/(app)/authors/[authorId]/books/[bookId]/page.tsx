import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getBookByIdWithQuotesAndReflecions } from "@/lib/api/books/queries";
import { getAuthors } from "@/lib/api/authors/queries";import OptimisticBook from "@/app/(app)/books/[bookId]/OptimisticBook";
import { checkAuth } from "@/lib/auth/utils";
import QuoteList from "@/components/quotes/QuoteList";
import ReflecionList from "@/components/reflecions/ReflecionList";

import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function BookPage({
  params,
}: {
  params: { bookId: string };
}) {

  return (
    <main className="overflow-auto">
      <Book id={params.bookId} />
    </main>
  );
}

const Book = async ({ id }: { id: string }) => {
  await checkAuth();

  const { book, quotes, reflecions } = await getBookByIdWithQuotesAndReflecions(id);
  const { authors } = await getAuthors();

  if (!book) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="books" />
        <OptimisticBook book={book} authors={authors}
        authorId={book.authorId} />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">{book.title}&apos;s Quotes</h3>
        <QuoteList
          books={[]}
          bookId={book.id}
          quotes={quotes}
        />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">{book.title}&apos;s Reflecions</h3>
        <ReflecionList
          books={[]}
          bookId={book.id}
          reflecions={reflecions}
        />
      </div>
    </Suspense>
  );
};
