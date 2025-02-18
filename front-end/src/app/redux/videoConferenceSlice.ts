import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type OnLeave = () => void;
interface VideoSliceType {
  isVideoOff: boolean;
  isMute: boolean;
  onLeave: OnLeave | null;
}

const initialState: VideoSliceType = {
  isVideoOff: false,
  isMute: false,
  onLeave: null,
};

const videoConferenceSlice = createSlice({
  name: 'videoConference',
  initialState,
  reducers: {
    toggleVideo: (state) => {
      state.isVideoOff = !state.isVideoOff;
    },
    toggleMute: (state) => {
      state.isMute = !state.isMute;
    },
    setOnLeave: (state, action: PayloadAction<OnLeave | null>) => {
      state.onLeave = action.payload;
    },
    leaveRoom: (state) => {
      if (state.onLeave) {
        state.onLeave(); // 안전하게 함수 호출
        state.onLeave = null; // 상태 초기화
      }
    },
  },
});

export const { toggleVideo, toggleMute, setOnLeave, leaveRoom } = videoConferenceSlice.actions;
export default videoConferenceSlice.reducer;
