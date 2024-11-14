import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {},
  reducers: {
    // Set the entire user object
    setUser: (state, action) => {
      return action.payload;
    },
    
    // Unsubscribe user from a specific channel or item
    unSubscribe: (state, action) => {
      console.log(state);
      state.subscribedTo = state.subscribedTo.filter(item => item !== action.payload); // as state in immutable but we can update it like this
    },
    
    // Subscribe user to a new channel or item
    Subscribe: (state, action) => {
      console.log(state);
      state.subscribedTo.push(action.payload);
    },
    
    // Remove user (reset state)
    removeUser: () => {
      return {};  // Return an empty object or null based on your use case
    },
  },
});

export const { setUser, unSubscribe, Subscribe, removeUser } = userSlice.actions;

export default userSlice.reducer;
