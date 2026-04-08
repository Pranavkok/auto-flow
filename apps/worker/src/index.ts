import "dotenv/config";
import { prisma as prismaClient } from "@repo/db";
import { Kafka } from "kafkajs";
import { parse } from "./parser.js";
import { sendEmail } from "./email.js";
import { sendSol } from "./solana.js";
import { sendSlackMessage } from "./slack.js";
import { sendDiscordMessage } from "./discord.js";
import { makeHttpRequest } from "./httpRequest.js";

const TOPIC_NAME = "zap-events"
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092")
    .split(",")
    .map((broker) => broker.trim())
    .filter(Boolean);

const kafka = new Kafka({
    clientId: 'outbox-processor-2',
    brokers: KAFKA_BROKERS
})

async function main() {
    const consumer = kafka.consumer({ groupId: 'main-worker-2' });
    await consumer.connect();
    const producer = kafka.producer();
    await producer.connect();

    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true })

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value?.toString(),
            })
            if (!message.value?.toString()) {
                return;
            }

            const parsedValue = JSON.parse(message.value?.toString());
            const zapRunId = parsedValue.zapRunId;
            const stage = parsedValue.stage;

            const zapRunDetails = await prismaClient.zapRun.findFirst({
                where: {
                    id: zapRunId
                },
                include: {
                    zap: {
                        include: {
                            actions: {
                                include: {
                                    type: true
                                }
                            }
                        }
                    },
                }
            });
            const currentAction = zapRunDetails?.zap.actions.find(x => x.sortingOrder === stage);

            if (!currentAction) {
                console.log("Current action not found?");
                return;
            }

            const zapRunMetadata = zapRunDetails?.metadata;

            if (currentAction.type.id === "mail-action") {
                const body = parse((currentAction.metadata as Record<string, unknown>)?.body as string, zapRunMetadata);
                const to = parse((currentAction.metadata as Record<string, unknown>)?.to as string, zapRunMetadata);
                const subject = parse(
                    ((currentAction.metadata as Record<string, unknown>)?.subject as string) ?? "Hello from FlowMate",
                    zapRunMetadata
                );
                console.log(`Sending out email to ${to} body is ${body}`)
                await sendEmail(to, subject, body);
            }

            if (currentAction.type.id === "solana-action") {
                const amount = parse((currentAction.metadata as Record<string, unknown>)?.amount as string, zapRunMetadata);
                const address = parse((currentAction.metadata as Record<string, unknown>)?.to as string, zapRunMetadata);
                console.log(`Sending out SOL of ${amount} to address ${address}`);
                await sendSol(address, amount);
            }

            if (currentAction.type.id === "log-action") {
                const label = parse(
                    (currentAction.metadata as Record<string, unknown>)?.label as string ?? "ZapRun",
                    zapRunMetadata
                );
                console.log(`[LOG ACTION] ${label}`, JSON.stringify(zapRunMetadata, null, 2));
            }

            if (currentAction.type.id === "slack-action") {
                const webhookUrl = parse((currentAction.metadata as Record<string, unknown>)?.webhookUrl as string, zapRunMetadata);
                const message = parse((currentAction.metadata as Record<string, unknown>)?.message as string, zapRunMetadata);
                console.log(`Sending Slack message`);
                await sendSlackMessage(webhookUrl, message);
            }

            if (currentAction.type.id === "discord-action") {
                const webhookUrl = parse((currentAction.metadata as Record<string, unknown>)?.webhookUrl as string, zapRunMetadata);
                const message = parse((currentAction.metadata as Record<string, unknown>)?.message as string, zapRunMetadata);
                console.log(`Sending Discord message`);
                await sendDiscordMessage(webhookUrl, message);
            }

            if (currentAction.type.id === "http-action") {
                const url = parse((currentAction.metadata as Record<string, unknown>)?.url as string, zapRunMetadata);
                const method = parse((currentAction.metadata as Record<string, unknown>)?.method as string ?? "GET", zapRunMetadata);
                const body = parse((currentAction.metadata as Record<string, unknown>)?.body as string ?? "", zapRunMetadata);
                console.log(`Making HTTP ${method} to ${url}`);
                await makeHttpRequest(url, method, body);
            }

            await new Promise(r => setTimeout(r, 500));

            const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1;
            console.log(lastStage);
            console.log(stage);
            if (lastStage !== stage) {
                console.log("pushing back to the queue")
                await producer.send({
                    topic: TOPIC_NAME,
                    messages: [{
                        value: JSON.stringify({
                            stage: stage + 1,
                            zapRunId
                        })
                    }]
                })
            }

            console.log("processing done");
            await consumer.commitOffsets([{
                topic: TOPIC_NAME,
                partition: partition,
                offset: (parseInt(message.offset) + 1).toString()
            }])
        },
    })
}

main()
