"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../lib/store";
import { fetchDesigns } from "../lib/features/design/designSlice";

import LoadingSpinner from './LoadingSpinner';
import { Divide, Plus } from 'lucide-react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import TemplatesList from './TemplatesList';

export default function DesignsList() {
    const dispatch = useDispatch<AppDispatch>();
    const { designs, loading, error } = useSelector((state: RootState) => state.designs);
    
    useEffect(() => {
        dispatch(fetchDesigns());
    }, [dispatch]);
    
    if (loading) return <LoadingSpinner />;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex flex-col gap-5">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Plus />
                        Create New Design
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Choose a template</DialogTitle>
                        <DialogDescription>
                            Customize your own room based on a template.
                        </DialogDescription>
                    </DialogHeader>
                    <TemplatesList />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div>
                <h3 className="text-lg font-bold">My Designs</h3>
                <div className="grid grid-cols-4">
                    {designs.map(des => 
                        <Link
                            key={des.id}
                            href="/designs"
                            className="px-3 py-1 rounded bg-white shadow"
                        >
                            {des.name}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
