import { type Book } from "@/lib/db/schema/books";
import { type Reflecion, type CompleteReflecion } from "@/lib/db/schema/reflecions";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Reflecion>) => void;

export const useOptimisticReflecions = (
  reflecions: CompleteReflecion[],
  books: Book[]
) => {
  const [optimisticReflecions, addOptimisticReflecion] = useOptimistic(
    reflecions,
    (
      currentState: CompleteReflecion[],
      action: OptimisticAction<Reflecion>,
    ): CompleteReflecion[] => {
      const { data } = action;

      const optimisticBook = books.find(
        (book) => book.id === data.bookId,
      )!;

      const optimisticReflecion = {
        ...data,
        book: optimisticBook,
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticReflecion]
            : [...currentState, optimisticReflecion];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticReflecion } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: "delete" } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticReflecion, optimisticReflecions };
};
