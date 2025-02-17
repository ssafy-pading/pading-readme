import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isVideoOff: false,
  isMute: false,
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
  },
});

export const { toggleVideo, toggleMute } = videoConferenceSlice.actions;
export default videoConferenceSlice.reducer;
