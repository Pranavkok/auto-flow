import express from "express";
import { prisma } from "@repo/db/client"

const app = express();
app.use(express.json())


app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;

    // store in db a new trigger
    await prisma.$transaction(async tx => {
        const run = await tx.zapRun.create({
            data: {
                zapId: zapId,
                metadata: body
            }
        });;

        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id
            }
        })
    })
    res.json({
        message: "Webhook received"
    })
})

app.listen(3002, () => {
    console.log("Serving smoothly")
})