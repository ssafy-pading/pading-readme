import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user";
import videoConferenceReducer from './videoConferenceSlice';
import codeReducer from './codeSlice';

const store =  configureStore({
    reducer: {
        user: userReducer,
        // 여기에 리듀서 추가
        videoConference: videoConferenceReducer,
        code: codeReducer, 
    }
})

// ✅ RootState 타입 정의 (전체 상태 타입)
export type RootState = ReturnType<typeof store.getState>;

// ✅ AppDispatch 타입 정의 (dispatch 타입)
export type AppDispatch = typeof store.dispatch;

export default store;