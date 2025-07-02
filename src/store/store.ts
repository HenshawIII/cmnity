import { configureStore } from '@reduxjs/toolkit';
import streamReducer from '../features/streamSlice';
import assetsReducer from '../features/assetsSlice';
import userReducer from '../features/userSlice';
import chatReducer from '../features/chatSlice';

const store = configureStore({
  reducer: {
    streams: streamReducer,
    assets: assetsReducer,
    user: userReducer,
    chat: chatReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
