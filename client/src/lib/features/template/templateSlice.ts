import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { DesignData } from "@/lib/types/design";

export interface Template {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  data: DesignData;
}

interface TemplateState {
  templates: Template[];
  selectedTemplate: Template | null;
  loading: boolean;
  error: string | null;
}

const initialState: TemplateState = {
  templates: [],
  selectedTemplate: null,
  loading: false,
  error: null,
};

export interface UpdateTemplateDTO {
  name?: string;
  description?: string;
  data?: DesignData;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/templates`;

// Fetch all templates
export const fetchTemplates = createAsyncThunk(
  "templates/fetchAll",
  async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data as Template[];
  },
);

// Fetch template by ID
export const fetchTemplateById = createAsyncThunk(
  "templatess/fetchById",
  async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data as Template;
  },
);

// Create new template
export const createTemplate = createAsyncThunk(
  "templates/create",
  async (templateData: Omit<Template, "id" | "createdAt" | "updatedAt">) => {
    const response = await axios.post(API_BASE_URL, templateData);
    return response.data as Template;
  },
);

// Update template
export const updateTemplate = createAsyncThunk(
  "templates/update",
  async ({ id, data }: { id: number; data: UpdateTemplateDTO }) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data as Template;
  },
);

// Delete template
export const deleteTemplate = createAsyncThunk(
  "templates/delete",
  async (id: number) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
    return id; // return the deleted template ID
  },
);

const templateSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    clearSelectedTemplate(state) {
      state.selectedTemplate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all furniture
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTemplates.fulfilled,
        (state, action: PayloadAction<Template[]>) => {
          state.loading = false;
          state.templates = action.payload;
        },
      )
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load templates";
      })

      // Create
      .addCase(
        createTemplate.fulfilled,
        (state, action: PayloadAction<Template>) => {
          state.templates.push(action.payload);
        },
      )

      // Update
      .addCase(
        updateTemplate.fulfilled,
        (state, action: PayloadAction<Template>) => {
          const index = state.templates.findIndex(
            (p) => p.id === action.payload.id,
          );
          if (index !== -1) state.templates[index] = action.payload;
          if (state.selectedTemplate?.id === action.payload.id) {
            state.selectedTemplate = action.payload;
          }
        },
      )

      // Delete
      .addCase(
        deleteTemplate.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.templates = state.templates.filter(
            (p) => p.id !== action.payload,
          );
        },
      );
  },
});

export const { clearSelectedTemplate } = templateSlice.actions;
export default templateSlice.reducer;
