import React from "react";
import { notFound } from "next/navigation";
import RoomTest from "@/components/RoomTest";

export default async function DesignPage({ params }: { params: { id: string } }) {
    const { id } = params;

    // Fetch design from backend API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs/${id}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    if (!res.ok) {
        return notFound();
    }

    const design = await res.json();

    return (
        <div className="w-full h-screen">
            <div className="p-4 border-b">
                <h1 className="text-xl font-bold">{design.name}</h1>
            </div>

            <RoomTest data={design.data} />
        </div>
    );
}
