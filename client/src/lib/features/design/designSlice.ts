import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Design {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    data: any;
    userId: string;
}

interface DesignState {
    designs: Design[];
    selectedDesign: Design | null,
    loading: boolean;
    error: string | null;
}

export interface CreateDesignDTO {
    name: string;
    templateId: number;
    userId: string;
}

export interface UpdateDesignDTO {
    name?: string;
    data?: any;
}

const initialState: DesignState = {
    designs: [],
    selectedDesign: null,
    loading: false,
    error: null,
};

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/designs`;

// Fetch all designs
export const fetchDesigns = createAsyncThunk("designs/fetchAll", async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data as Design[];
});

// Fetch design by ID
export const fetchDesignById = createAsyncThunk("designs/fetchById", async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data as Design;
});

// Create new design
export const createDesign = createAsyncThunk("designs/create", async (designData: CreateDesignDTO) => {
    const response = await axios.post(API_BASE_URL, designData, {
        withCredentials: true,
    });
    return response.data as Design;
});

// Update design
export const updateDesign = createAsyncThunk("designs/update", async ({ id, data }: {
    id: number;
    data: UpdateDesignDTO
}) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data as Design;
});

// Delete design
export const deleteDesign = createAsyncThunk("designs/delete", async (id: number) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
    return id; // return the deleted design ID
});

const designSlice = createSlice({
    name: "designs",
    initialState,
    reducers: {
        clearSelectedDesign(state) {
            state.selectedDesign = null;
        },
    },
    extraReducers: (builder) => {
        builder
        // Fetch all designs
        .addCase(fetchDesigns.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchDesigns.fulfilled, (state, action: PayloadAction<Design[]>) => {
            state.loading = false;
            state.designs = action.payload;
        })
        .addCase(fetchDesigns.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Failed to load designs";
        })

        // Fetch design by ID
        .addCase(fetchDesignById.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.selectedDesign = null;
        })
        .addCase(fetchDesignById.fulfilled, (state, action: PayloadAction<Design>) => {
            state.loading = false;
            state.selectedDesign = action.payload;
        })
        .addCase(fetchDesignById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Failed to load design";
        })

        // Create
        .addCase(createDesign.fulfilled, (state, action: PayloadAction<Design>) => {
            state.designs.push(action.payload);
        })

        // Update
        .addCase(updateDesign.fulfilled, (state, action: PayloadAction<Design>) => {
            const index = state.designs.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) state.designs[index] = action.payload;
            if (state.selectedDesign?.id === action.payload.id) {
                state.selectedDesign = action.payload;
            }
        })

        // Delete
        .addCase(deleteDesign.fulfilled, (state, action: PayloadAction<number>) => {
            state.designs = state.designs.filter((p) => p.id !== action.payload);
        });
    },
});


export const { clearSelectedDesign } = designSlice.actions;
export default designSlice.reducer;