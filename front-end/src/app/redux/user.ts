// user를 사용하기 전에 useEffect에서 dispatch(getUser()) 로 초기화 시키기
// useEffect(() => {
//     dispatch(getUser());
//   }, [dispatch]);

// 그룹마다 role은 { groupId : role } 의 형태로 존재함, 만약 존재하지 않는다면 직접 넣어야 함
// ex) 3 : MANAGER, 5 : MEMBER...
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import useMypageAxios from '../../shared/apis/useMypageAxios';
import { GetMyPageResponse } from '../../shared/types/mypageApiResponse';

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
    const { getProfile } = useMypageAxios();
    try {
        const response = await getProfile();
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // 그룹의 role을 직접 추가할 수 있는 reducer
        setRole: (state, action: PayloadAction<{ groupId: number; role: string }>) => {
        const { groupId, role } = action.payload;
        state.roles[groupId] = role;
        },
        // 유저 정보를 요청하는 액션 (내부적으로 fetchUserInfo 호출)
        getUser: (state) => {
        if (!state.user && state.status === 'idle') {
            state.status = 'loading';
            // 내부에서 fetchUserInfo Thunk를 호출
            fetchUserInfo();
        }
        },
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

export const { setRole, getUser } = userSlice.actions;
export default userSlice.reducer;
