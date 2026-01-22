import { useUser } from "@clerk/nextjs";
import axios from "axios";

import { Button } from "./ui/button";

export default function SyncButton() {
  const { user } = useUser();

  const syncUser = async () => {
    if (!user) return;
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
      clerkId: user.id,
    });
    alert("User synced!");
  };

  return (
    <Button variant="ghost" onClick={syncUser}>
      Sync User
    </Button>
  );
}
