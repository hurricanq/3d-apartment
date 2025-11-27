"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../lib/store";
import { fetchDesigns, deleteDesign } from "../lib/features/design/designSlice";
import { formatDate, formatTime } from "@/lib/format"

import LoadingSpinner from './LoadingSpinner';
import { Plus, Trash } from 'lucide-react'
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

    const handleDelete = (id: number) => {
        dispatch(deleteDesign(id));
    };

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
                <h3 className="text-lg font-bold mb-3">My Designs</h3>
                <div className="grid grid-cols-3 gap-5">
                    {designs.map(des => 
                        <Link
                            key={des.id}
                            href={`/designs/${des.id}`}
                            className="px-3 py-3 rounded bg-white shadow hover:bg-gray-100"
                        >
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-bold line-clamp-1">{des.name}</h4>
                                    <p><span className="font-semibold text-gray-700">Date Created: </span>{formatDate(des.createdAt)} at {formatTime(des.createdAt)}</p>
                                    <p><span className="font-semibold text-gray-700">Date Updated: </span>{formatDate(des.updatedAt)} at {formatTime(des.updatedAt)}</p>
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash />
                                            Delete
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Warning!</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete this design? You cannot undo this action.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button>Cancel</Button>
                                                <Button onClick={() => handleDelete(des.id)}>OK</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
