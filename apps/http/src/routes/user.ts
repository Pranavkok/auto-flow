import { Router } from "express";
import { authMiddleware } from "../middleware.js";
import { SigninSchema, SignupSchema } from "../types/index.js";
import {prisma} from "@repo/db/client"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_PASSWORD = process.env.JWT_PASSWORD as string || "secret";

const router = Router();

router.post("/signup", async (req, res) => {
    const body = req.body;
    const parsedData = SignupSchema.safeParse(body);

    if (!parsedData.success) {
        console.log(parsedData.error);
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    try {
        const userExists = await prisma.user.findFirst({
            where: {
                email: parsedData.data.username
            }
        });

        if (userExists) {
            return res.status(403).json({
                message: "User already exists"
            })
        }

        const user = await prisma.user.create({
            data: {
                email: parsedData.data.username,
                password: await bcrypt.hash(parsedData.data.password, 10),
                name: parsedData.data.name
            }
        });

        const token = jwt.sign({
            id: user.id
        }, JWT_PASSWORD);

        return res.json({
            token
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }

})

router.post("/signin", async (req, res) => {
    const body = req.body;
    const parsedData = SigninSchema.safeParse(body);

    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await prisma.user.findFirst({
        where: {
            email: parsedData.data.username,
        }
    });
    
    if (!user || !(await bcrypt.compare(parsedData.data.password, user.password))) {
        return res.status(403).json({
            message: "Sorry credentials are incorrect"
        })
    }

    // sign the jwt
    const token = jwt.sign({
        id: user.id
    }, JWT_PASSWORD);

    res.json({
        token: token,
    });
})

router.get("/", authMiddleware, async (req, res) => {
    // TODO: Fix the type
    // @ts-ignore
    const id = req.id;
    const user = await prisma.user.findFirst({
        where: {
            id
        },
        select: {
            name: true,
            email: true
        }
    });

    return res.json({
        user
    });
})

export const userRouter = router;
