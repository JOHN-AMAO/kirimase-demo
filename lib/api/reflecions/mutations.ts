import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  ReflecionId, 
  NewReflecionParams,
  UpdateReflecionParams, 
  updateReflecionSchema,
  insertReflecionSchema, 
  reflecions,
  reflecionIdSchema 
} from "@/lib/db/schema/reflecions";
import { getUserAuth } from "@/lib/auth/utils";

export const createReflecion = async (reflecion: NewReflecionParams) => {
  const { session } = await getUserAuth();
  const newReflecion = insertReflecionSchema.parse({ ...reflecion, userId: session?.user.id! });
  try {
    const [r] =  await db.insert(reflecions).values(newReflecion).returning();
    return { reflecion: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateReflecion = async (id: ReflecionId, reflecion: UpdateReflecionParams) => {
  const { session } = await getUserAuth();
  const { id: reflecionId } = reflecionIdSchema.parse({ id });
  const newReflecion = updateReflecionSchema.parse({ ...reflecion, userId: session?.user.id! });
  try {
    const [r] =  await db
     .update(reflecions)
     .set({...newReflecion, updatedAt: new Date() })
     .where(and(eq(reflecions.id, reflecionId!), eq(reflecions.userId, session?.user.id!)))
     .returning();
    return { reflecion: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteReflecion = async (id: ReflecionId) => {
  const { session } = await getUserAuth();
  const { id: reflecionId } = reflecionIdSchema.parse({ id });
  try {
    const [r] =  await db.delete(reflecions).where(and(eq(reflecions.id, reflecionId!), eq(reflecions.userId, session?.user.id!)))
    .returning();
    return { reflecion: r };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

