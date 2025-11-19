import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Furniture {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    thumbnailUrl: string;
    modelUrl: string;
}

interface FurnitureState {
    furniture: Furniture[];
    selectedFurniture: Furniture | null,
    loading: boolean;
    error: string | null;
}

const initialState: FurnitureState = {
    furniture: [],
    selectedFurniture: null,
    loading: false,
    error: null,
};

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/furniture`;

// Fetch all furniture
export const fetchFurniture = createAsyncThunk("furniture/fetchAll", async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data as Furniture[];
});

// Create new furniture
export const createFurniture = createAsyncThunk("furniture/create", async (productData: Omit<Furniture, "id" | "createdAt" | "updatedAt">) => {
    const response = await axios.post(API_BASE_URL, productData);
    return response.data as Furniture;
});

// Update furniture
export const updateFurniture = createAsyncThunk("furniture/update", async ({ id, data }: {
    id: string;
    data: Partial<Omit<Furniture, "id" | "createdAt" | "updatedAt">>;
}) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data as Furniture;
});

// Delete furniture
export const deleteFurniture = createAsyncThunk("furniture/delete", async (id: string) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
    return id; // return the deleted furniture ID
});

const furnitureSlice = createSlice({
    name: "furniture",
    initialState,
    reducers: {
        clearSelectedFurniture(state) {
            state.selectedFurniture = null;
        },
    },
    extraReducers: (builder) => {
        builder
        // Fetch all furniture
        .addCase(fetchFurniture.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchFurniture.fulfilled, (state, action: PayloadAction<Furniture[]>) => {
            state.loading = false;
            state.furniture = action.payload;
        })
        .addCase(fetchFurniture.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Failed to load furniture";
        })

        // Create
        .addCase(createFurniture.fulfilled, (state, action: PayloadAction<Furniture>) => {
            state.furniture.push(action.payload);
        })

        // Update
        .addCase(updateFurniture.fulfilled, (state, action: PayloadAction<Furniture>) => {
            const index = state.furniture.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) state.furniture[index] = action.payload;
            if (state.selectedFurniture?.id === action.payload.id) {
                state.selectedFurniture = action.payload;
            }
        })

        // Delete
        .addCase(deleteFurniture.fulfilled, (state, action: PayloadAction<string>) => {
            state.furniture = state.furniture.filter((p) => p.id !== action.payload);
        });
    },
});


export const { clearSelectedFurniture } = furnitureSlice.actions;
export default furnitureSlice.reducer;