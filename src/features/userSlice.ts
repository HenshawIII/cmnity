import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  solanaWalletAddress: string | null;
}

const initialState: UserState = {
  solanaWalletAddress: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSolanaWalletAddress: (state, action: PayloadAction<string>) => {
      state.solanaWalletAddress = action.payload;
    },
  },
});

export const { setSolanaWalletAddress } = userSlice.actions;
export default userSlice.reducer; 