import { configureStore } from "@reduxjs/toolkit";
import subscribeActionMiddleware from "redux-subscribe-action";
import rootReducer from "./rootSlice";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(subscribeActionMiddleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
