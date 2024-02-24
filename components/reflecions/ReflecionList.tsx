"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Reflecion, CompleteReflecion } from "@/lib/db/schema/reflecions";
import Modal from "@/components/shared/Modal";
import { type Book, type BookId } from "@/lib/db/schema/books";
import { useOptimisticReflecions } from "@/app/(app)/reflecions/useOptimisticReflecions";
import { Button } from "@/components/ui/button";
import ReflecionForm from "./ReflecionForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (reflecion?: Reflecion) => void;

export default function ReflecionList({
  reflecions,
  books,
  bookId 
}: {
  reflecions: CompleteReflecion[];
  books: Book[];
  bookId?: BookId 
}) {
  const { optimisticReflecions, addOptimisticReflecion } = useOptimisticReflecions(
    reflecions,
    books 
  );
  const [open, setOpen] = useState(false);
  const [activeReflecion, setActiveReflecion] = useState<Reflecion | null>(null);
  const openModal = (reflecion?: Reflecion) => {
    setOpen(true);
    reflecion ? setActiveReflecion(reflecion) : setActiveReflecion(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeReflecion ? "Edit Reflecion" : "Create Reflecion"}
      >
        <ReflecionForm
          reflecion={activeReflecion}
          addOptimistic={addOptimisticReflecion}
          openModal={openModal}
          closeModal={closeModal}
          books={books}
        bookId={bookId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticReflecions.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticReflecions.map((reflecion) => (
            <Reflecion
              reflecion={reflecion}
              key={reflecion.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Reflecion = ({
  reflecion,
  openModal,
}: {
  reflecion: CompleteReflecion;
  openModal: TOpenModal;
}) => {
  const optimistic = reflecion.id === "optimistic";
  const deleting = reflecion.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("reflecions")
    ? pathname
    : pathname + "/reflecions/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{reflecion.content}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + reflecion.id }>
          Edit
        </Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No reflecions
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new reflecion.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Reflecions </Button>
      </div>
    </div>
  );
};
