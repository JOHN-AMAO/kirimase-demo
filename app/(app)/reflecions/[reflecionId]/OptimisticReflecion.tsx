"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/reflecions/useOptimisticReflecions";
import { type Reflecion } from "@/lib/db/schema/reflecions";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import ReflecionForm from "@/components/reflecions/ReflecionForm";
import { type Book, type BookId } from "@/lib/db/schema/books";

export default function OptimisticReflecion({ 
  reflecion,
  books,
  bookId 
}: { 
  reflecion: Reflecion; 
  
  books: Book[];
  bookId?: BookId
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Reflecion) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticReflecion, setOptimisticReflecion] = useOptimistic(reflecion);
  const updateReflecion: TAddOptimistic = (input) =>
    setOptimisticReflecion({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <ReflecionForm
          reflecion={optimisticReflecion}
          books={books}
        bookId={bookId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateReflecion}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticReflecion.content}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticReflecion.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticReflecion, null, 2)}
      </pre>
    </div>
  );
}
