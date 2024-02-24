"use server";

import { revalidatePath } from "next/cache";
import {
  createReflecion,
  deleteReflecion,
  updateReflecion,
} from "@/lib/api/reflecions/mutations";
import {
  ReflecionId,
  NewReflecionParams,
  UpdateReflecionParams,
  reflecionIdSchema,
  insertReflecionParams,
  updateReflecionParams,
} from "@/lib/db/schema/reflecions";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateReflecions = () => revalidatePath("/reflecions");

export const createReflecionAction = async (input: NewReflecionParams) => {
  try {
    const payload = insertReflecionParams.parse(input);
    await createReflecion(payload);
    revalidateReflecions();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateReflecionAction = async (input: UpdateReflecionParams) => {
  try {
    const payload = updateReflecionParams.parse(input);
    await updateReflecion(payload.id, payload);
    revalidateReflecions();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteReflecionAction = async (input: ReflecionId) => {
  try {
    const payload = reflecionIdSchema.parse({ id: input });
    await deleteReflecion(payload.id);
    revalidateReflecions();
  } catch (e) {
    return handleErrors(e);
  }
};