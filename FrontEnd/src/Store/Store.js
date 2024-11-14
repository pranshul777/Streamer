import { configureStore } from '@reduxjs/toolkit';
import userSlice from "./Slices/userSlice.js";
import channelSlice from "./Slices/channelSlice.js";
const store = configureStore({
  reducer: {
    user : userSlice,
    channel : channelSlice
  },
});

export default store;