import "dotenv/config";
import {prisma} from "@repo/db/client"
import {Kafka} from "kafkajs";

const TOPIC_NAME = "zap-events"
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092")
    .split(",")
    .map((broker) => broker.trim())
    .filter(Boolean);

const kafka = new Kafka({
    clientId: 'outbox-processor',
    brokers: KAFKA_BROKERS
})

async function runScheduledZaps() {
    const scheduledZaps = await prisma.zap.findMany({
        where: {
            trigger: { triggerId: "schedule-trigger" }
        },
        include: { trigger: true }
    });

    for (const zap of scheduledZaps) {
        const metadata = zap.trigger?.metadata as Record<string, unknown>;
        const intervalMinutes = parseInt((metadata?.intervalMinutes as string) ?? "60");
        const lastRun = zap.trigger?.lastRunAt;
        const now = new Date();
        const minutesSinceLastRun = lastRun
            ? (now.getTime() - lastRun.getTime()) / 1000 / 60
            : Infinity;

        if (minutesSinceLastRun >= intervalMinutes) {
            await prisma.$transaction(async tx => {
                const run = await tx.zapRun.create({
                    data: { zapId: zap.id, metadata: { scheduledAt: now.toISOString() } }
                });
                await tx.zapRunOutbox.create({ data: { zapRunId: run.id } });
                await tx.trigger.update({
                    where: { id: zap.trigger!.id },
                    data: { lastRunAt: now }
                });
            });
            console.log(`Fired scheduled zap ${zap.id}`);
        }
    }
}

async function main() {
    const producer = kafka.producer();
    await producer.connect();

    while(1) {
        // Process outbox
        const pendingRows = await prisma.zapRunOutbox.findMany({
            where: {},
            take: 10
        })
        console.log(pendingRows);

        producer.send({
            topic: TOPIC_NAME,
            messages: pendingRows.map(r => ({
                value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 })
            }))
        })

        await prisma.zapRunOutbox.deleteMany({
            where: {
                id: { in: pendingRows.map(x => x.id) }
            }
        })

        // Fire any scheduled zaps that are due
        await runScheduledZaps();

        await new Promise(r => setTimeout(r, 3000));
    }
}

main();
