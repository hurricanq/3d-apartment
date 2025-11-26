import { configureStore } from "@reduxjs/toolkit";

import templateReducer from "./features/template/templateSlice";
import designReducer from "./features/design/designSlice";
import furnitureReducer from "./features/furniture/furnitureSlice";

export const store = configureStore({
    reducer: {
        templates: templateReducer,
        designs: designReducer,
        furniture: furnitureReducer
    },
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;