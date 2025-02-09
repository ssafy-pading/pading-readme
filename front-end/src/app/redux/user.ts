import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        value: {
            name: "희원",
            email: null,
        }
    },
    reducers: {
        setUser: (state, action) => {
            state.value = action.payload;
        },
    },
});

export default userSlice.reducer;