"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUser = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("@clerk/express");
const prisma = new client_1.PrismaClient();
const syncUser = async (req, res) => {
    const { clerkId } = req.body;
    if (!clerkId) {
        res.status(400).json({ message: "Missing clerkId" });
        return;
    }
    try {
        // Fetch user data from Clerk
        const clerkUser = await express_1.clerkClient.users.getUser(clerkId);
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to sync user" });
    }
};
exports.syncUser = syncUser;
//# sourceMappingURL=userControllers.js.map