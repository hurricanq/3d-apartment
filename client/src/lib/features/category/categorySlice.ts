import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Category {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    thumbnailUrl: string;
}

interface CategoryState {
    categories: Category[];
    selectedCategory: Category | null,
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    selectedCategory: null,
    loading: false,
    error: null,
};

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/categories`;

// Fetch all categories
export const fetchCategories = createAsyncThunk("categories/fetchAll", async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data as Category[];
});

// Create new category
export const createCategory = createAsyncThunk("categories/create", async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    const response = await axios.post(API_BASE_URL, categoryData);
    return response.data as Category;
});

// Update category
export const updateCategory = createAsyncThunk("categories/update", async ({ id, data }: {
    id: string;
    data: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>;
}) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data as Category;
});

// Delete category
export const deleteCategory = createAsyncThunk("categories/delete", async (id: string) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
    return id; // return the deleted category ID
});

const categorySlice = createSlice({
    name: "categories",
    initialState,
    reducers: {
        clearSelectedCategory(state) {
            state.selectedCategory = null;
        },
    },
    extraReducers: (builder) => {
        builder
        // Fetch all categories
        .addCase(fetchCategories.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
            state.loading = false;
            state.categories = action.payload;
        })
        .addCase(fetchCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Failed to load categories";
        })

        // Create
        .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
            state.categories.push(action.payload);
        })

        // Update
        .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
            const index = state.categories.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) state.categories[index] = action.payload;
            if (state.selectedCategory?.id === action.payload.id) {
                state.selectedCategory = action.payload;
            }
        })

        // Delete
        .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
            state.categories = state.categories.filter((p) => p.id !== action.payload);
        });
    },
});


export const { clearSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;