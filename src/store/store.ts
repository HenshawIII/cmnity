import { configureStore } from '@reduxjs/toolkit';
import streamReducer from '../features/streamSlice';
import assetsReducer from '../features/assetsSlice';
import userReducer from '../features/userSlice';
import chatReducer from '../features/chatSlice';
import profileReducer from '../features/profileSlice';

const store = configureStore({
  reducer: {
    streams: streamReducer,
    assets: assetsReducer,
    user: userReducer,
    chat: chatReducer,
    profile: profileReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
