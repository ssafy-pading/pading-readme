// videoConferenceContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { VideoConferenceContextType, VideoAction } from '../shared/types/videoConferenceType';

const initialState: VideoConferenceContextType = {
    isMute: false,
    isCameraOn: true,
    isChatOpen: false,
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    localParticipant: null,
    remoteParticipants: [],
    participantsCnt: 0,
    carouselItems: [],
    roomName: "",
    activeSpeakerId: null,
};

const videoReducer = (state: VideoConferenceContextType, action: VideoAction): VideoConferenceContextType => {
  switch (action.type) {
    case "TOGGLE_MUTE":
      return { ...state, isMute: action.payload ?? !state.isMute };
    case "TOGGLE_CAMERA":
      return { ...state, isCameraOn: action.payload ?? !state.isCameraOn };
    case "TOGGLE_CHAT":
      return { ...state, isChatOpen: action.payload ?? !state.isChatOpen };
    case "UPDATE_PARTICIPANTS":
      return { ...state, remoteParticipants: action.payload, participantsCnt: action.payload.length + (state.localParticipant ? 1 : 0) };
    case "SET_LOCAL_PARTICIPANT":
      return { ...state, localParticipant: action.payload, participantsCnt: state.remoteParticipants.length + 1 };
    case "UPDATE_CAROUSEL":
      return { ...state, carouselItems: action.payload };
    case "SET_CONNECTION_STATE":
      return { ...state, isConnected: action.payload.isConnected, isConnecting: action.payload.isConnecting };
    case "SET_ACTIVE_SPEAKER":
      return { ...state, activeSpeakerId: action.payload };
    case "SET_ROOM_NAME":
      return { ...state, roomName: action.payload };
    case "SET_ERROR":
      return { ...state, connectionError: action.payload };
    default:
      return state;
  }
};

const VideoConferenceContext = createContext<{
  state: VideoConferenceContextType;
  dispatch: React.Dispatch<VideoAction>;
} | undefined>(undefined);

export const VideoConferenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(videoReducer, initialState);

  return (
    <VideoConferenceContext.Provider value={{ state, dispatch }}>
      {children}
    </VideoConferenceContext.Provider>
  );
};

export const useVideoConference = () => {
  const context = useContext(VideoConferenceContext);
  if (context === undefined) {
    throw new Error('useVideoConference must be used within a VideoConferenceProvider');
  }
  return context;
};
