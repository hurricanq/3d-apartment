import express from "express";
import "dotenv/config";
import cors from "cors";
import { clerkClient, clerkMiddleware, getAuth } from '@clerk/express'
import { verifyWebhook } from '@clerk/express/webhooks'

// Routes
import templateRoutes from "./routes/templateRoutes";
import designRoutes from "./routes/designRoutes";
import furnitureRoutes from "./routes/furnitureRoutes";

// Configurations
const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:3000',
    ],
    credentials: true,
}));
app.use(clerkMiddleware())

// Home route (test)
app.get("/", (_, res) => {
    res.send("This is home route");
});

// Authentication route (test)
app.get('/user', async (req, res) => {
    // Use `getAuth()` to access `isAuthenticated` and the user's ID
    const { isAuthenticated, userId } = getAuth(req)

    // If user isn't authenticated, return a 401 error
    if (!isAuthenticated) {
        return res.status(401).json({ error: 'User not authenticated' })
    }

    // Use `clerkClient` to access Clerk's JS Backend SDK methods
    // and get the user's User object
    const user = await clerkClient.users.getUser(userId)

    res.json(user)
});

app.post('/api/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const evt = await verifyWebhook(req)

        // Do something with payload
        // For this guide, log payload to console
        const { id } = evt.data
        const eventType = evt.type
        if (evt.type === 'user.created') {
            console.log('userId:', evt.data.id)
        }

        return res.send('Webhook received')
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return res.status(400).send('Error verifying webhook')
    }
})

app.use("/templates", templateRoutes);
app.use("/designs", designRoutes);
app.use("/furniture", furnitureRoutes);

// Server
const port = Number(process.env.PORT) || 3002;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});