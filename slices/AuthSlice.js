import { createSlice } from '@reduxjs/toolkit';

// Holds the signed-in customer's profile row only. Auth tokens are NOT stored here:
// supabase-js persists/refreshes the session itself (lib/supabase.js).
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export default authSlice.reducer;
