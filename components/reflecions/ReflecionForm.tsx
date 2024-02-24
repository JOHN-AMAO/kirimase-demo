import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/reflecions/useOptimisticReflecions";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type Reflecion, insertReflecionParams } from "@/lib/db/schema/reflecions";
import {
  createReflecionAction,
  deleteReflecionAction,
  updateReflecionAction,
} from "@/lib/actions/reflecions";
import { type Book, type BookId } from "@/lib/db/schema/books";

const ReflecionForm = ({
  books,
  bookId,
  reflecion,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  reflecion?: Reflecion | null;
  books: Book[];
  bookId?: BookId
  openModal?: (reflecion?: Reflecion) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Reflecion>(insertReflecionParams);
  const editing = !!reflecion?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("reflecions");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Reflecion },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`Reflecion ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const reflecionParsed = await insertReflecionParams.safeParseAsync({ bookId, ...payload });
    if (!reflecionParsed.success) {
      setErrors(reflecionParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = reflecionParsed.data;
    const pendingReflecion: Reflecion = {
      updatedAt: reflecion?.updatedAt ?? new Date(),
      createdAt: reflecion?.createdAt ?? new Date(),
      id: reflecion?.id ?? "",
      userId: reflecion?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingReflecion,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateReflecionAction({ ...values, id: reflecion.id })
          : await createReflecionAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingReflecion 
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
              <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.content ? "text-destructive" : "",
          )}
        >
          Content
        </Label>
        <Input
          type="text"
          name="content"
          className={cn(errors?.content ? "ring ring-destructive" : "")}
          defaultValue={reflecion?.content ?? ""}
        />
        {errors?.content ? (
          <p className="text-xs text-destructive mt-2">{errors.content[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {bookId ? null : <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.bookId ? "text-destructive" : "",
          )}
        >
          Book
        </Label>
        <Select defaultValue={reflecion?.bookId} name="bookId">
          <SelectTrigger
            className={cn(errors?.bookId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a book" />
          </SelectTrigger>
          <SelectContent>
          {books?.map((book) => (
            <SelectItem key={book.id} value={book.id.toString()}>
              {book.id}{/* TODO: Replace with a field from the book model */}
            </SelectItem>
           ))}
          </SelectContent>
        </Select>
        {errors?.bookId ? (
          <p className="text-xs text-destructive mt-2">{errors.bookId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div> }
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: reflecion });
              const error = await deleteReflecionAction(reflecion.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: reflecion,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default ReflecionForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
