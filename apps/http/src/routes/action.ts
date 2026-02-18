import { Router } from "express";
import {prisma as prismaClient} from "@repo/db/client"

const router = Router();

router.get("/available", async (req, res) => {
    const availableActions = await prismaClient.availableAction.findMany({});
    res.json({
        availableActions
    })
});

export const actionRouter = router;