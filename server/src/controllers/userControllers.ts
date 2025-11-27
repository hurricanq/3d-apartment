import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { clerkClient } from "@clerk/express";

const prisma = new PrismaClient();

export const syncUser = async (req: Request, res: Response): Promise<void> => {
    const { clerkId } = req.body;
    if (!clerkId) {
        res.status(400).json({ message: "Missing clerkId" });
        return;
    } 

    try {
        // Fetch user data from Clerk
        const clerkUser = await clerkClient.users.getUser(clerkId);

        const username = clerkUser.username;
        const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;

        // Validate required fields
        if (!username || !primaryEmail) {
            res.status(400).json({ message: "User data incomplete (missing username or email)" });
            return;
        }

        // Upsert (update + insert) into the database
        const user = await prisma.user.upsert({
            where: { clerkId: clerkUser.id },
            update: {
                username,
                email: primaryEmail,
            },
            create: {
                clerkId: clerkUser.id,
                username,
                email: primaryEmail,
            },
        });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to sync user" });
    }
};
