// !!!!! -- 사용할 때 무한루프가 돌 수 있습니다. -- !!!!!
// 유저를 호출하는 곳에서 아래 코드를 사용해주세요.

// // redux 초기 import 
// import { useSelector, useDispatch } from 'react-redux';
// import { fetchUserInfo, resetUserState } from '../app/redux/user';
// import type { RootState, AppDispatch } from '../app/redux/store';

// // redux dispatch, 유저 객체 사용
// const dispatch = useDispatch<AppDispatch>();
// const { user, status } = useSelector((state: RootState) => state.user);

// useEffect(() => {
//   if (!user && status === 'idle') {
//     dispatch(fetchUserInfo()); // 유저 정보가 없으면 fetchUserInfo 호출
//   }
// }, [dispatch, user, status]);

// 삭제하고 싶다면 아래 코드를 사용
// dispatch(resetUserState());


import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GetMyPageResponse } from '../../shared/types/mypageApiResponse';
import axios from 'axios';

type RoleState = {
  roles: { [groupId: number]: string }; // 그룹 ID별 role 정보
  user: GetMyPageResponse | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: RoleState = {
  roles: {},
  user: null,
  status: 'idle',
  error: null,
};

// 유저 정보 불러오기 Thunk
export const fetchUserInfo = createAsyncThunk('user/fetchUserInfo', async (_, { rejectWithValue }) => {
  try {
    const response = await axios(`${import.meta.env.VITE_APP_API_BASE_URL}/v1/mypage`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
    });
    // console.log("response", response);
    return response.data.data;
  } catch (error: any) {
    console.error(error);
    return rejectWithValue(error.message);
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<{ groupId: number; role: string }>) => {
      const { groupId, role } = action.payload;
      state.roles[groupId] = role;
    },
    // resetUserState 리듀서 추가: 상태를 초기값으로 리셋
    resetUserState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserInfo.fulfilled, (state, action: PayloadAction<GetMyPageResponse>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setRole, resetUserState } = userSlice.actions;
export default userSlice.reducer;
