import { configureStore } from "@reduxjs/toolkit";
import furnitureReducer from "./features/furniture/furnitureSlice";

export const store = configureStore({
    reducer: {
        furniture: furnitureReducer,
    },
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;