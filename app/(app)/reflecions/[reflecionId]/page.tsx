import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getReflecionById } from "@/lib/api/reflecions/queries";
import { getBooks } from "@/lib/api/books/queries";import OptimisticReflecion from "@/app/(app)/reflecions/[reflecionId]/OptimisticReflecion";
import { checkAuth } from "@/lib/auth/utils";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function ReflecionPage({
  params,
}: {
  params: { reflecionId: string };
}) {

  return (
    <main className="overflow-auto">
      <Reflecion id={params.reflecionId} />
    </main>
  );
}

const Reflecion = async ({ id }: { id: string }) => {
  await checkAuth();

  const { reflecion } = await getReflecionById(id);
  const { books } = await getBooks();

  if (!reflecion) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="reflecions" />
        <OptimisticReflecion reflecion={reflecion} books={books} />
      </div>
    </Suspense>
  );
};
