"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(50, "O nome pode ter no máximo 50 caracteres").optional(),
  image: z.string().url("A URL da foto de perfil deve ser válida").or(z.string().regex(/^\/avatars\/[a-z0-9-]+\.png$/, "Avatar inválido")).optional(),
});

export async function updateProfile(data: { name?: string; image?: string }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Você precisa estar conectado para atualizar o perfil." };
    }

    // Validar os dados recebidos
    const parsed = profileSchema.safeParse(data);
    if (!parsed.success) {
      const errorMsg =
        parsed.error.flatten().fieldErrors.name?.[0] ||
        parsed.error.flatten().fieldErrors.image?.[0] ||
        "Dados inválidos.";
      return { error: errorMsg };
    }

    const { name, image } = parsed.data;

    // Atualizar no banco de dados
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(image !== undefined && { image }),
      },
    });

    // Revalidar rotas para recarregar o perfil atualizado
    revalidatePath("/profile");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { error: "Erro interno ao atualizar o perfil. Tente novamente." };
  }
}

export async function updateVipStatus(planId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Você precisa estar conectado para assinar um plano VIP." };
    }

    // Map plan ID to database value
    let status = "FREE";
    if (planId === "sommelier") {
      status = "SOMMELIER";
    } else if (planId === "ionista") {
      status = "ACIONISTA";
    }

    // Update in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { vipStatus: status },
    });

    // Revalidate routes
    revalidatePath("/vip");
    revalidatePath("/profile");
    revalidatePath("/");

    return { success: true, vipStatus: status };
  } catch (error) {
    console.error("Erro ao atualizar status VIP:", error);
    return { error: "Erro interno ao processar a assinatura. Tente novamente." };
  }
}
