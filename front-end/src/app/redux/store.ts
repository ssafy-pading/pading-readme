import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user";

export default configureStore({
    reducer: {
        user: userReducer
        // 여기에 리듀서 추가
    }
})