import { createSlice } from '@reduxjs/toolkit';

const channelSlice = createSlice({
  name: 'channel',
  initialState: {},
  reducers: {
    SetChannel: (state, action) => {
      return action.payload;
    },

    // Remove user (reset state)
    removeChannel: () => {
      return {};  // Return an empty object or null based on your use case
    },
  },
});

export const { SetChannel, removeChannel } = channelSlice.actions;

export default channelSlice.reducer;
