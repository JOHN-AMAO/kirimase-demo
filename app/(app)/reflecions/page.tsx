import { Suspense } from "react";

import Loading from "@/app/loading";
import ReflecionList from "@/components/reflecions/ReflecionList";
import { getReflecions } from "@/lib/api/reflecions/queries";
import { getBooks } from "@/lib/api/books/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function ReflecionsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Reflecions</h1>
        </div>
        <Reflecions />
      </div>
    </main>
  );
}

const Reflecions = async () => {
  await checkAuth();

  const { reflecions } = await getReflecions();
  const { books } = await getBooks();
  return (
    <Suspense fallback={<Loading />}>
      <ReflecionList reflecions={reflecions} books={books} />
    </Suspense>
  );
};
