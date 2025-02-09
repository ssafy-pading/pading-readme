import { RemoteParticipant, RemoteTrackPublication } from "livekit-client";

export interface Participant {
  id: string;
  identity: string;
  audioTrack?: MediaStreamTrack;
  videoTrack?: MediaStreamTrack;
  isSpeaking: boolean;
}

export interface LocalVideoTrack extends MediaStreamTrack {
    isLocal: boolean;  // 필요하면 추가 속성 정의
  }

export interface LocalParticipant extends Participant {
  videoTrack: LocalVideoTrack;
  permissions: {
    canPublish: boolean;
    canSubscribe: boolean;
  };
}

export interface RemoteParticipantType extends Participant {
  connectionId: string;
  tracks: Map<string, RemoteTrackPublication>;
}

export interface VideoConferenceContextType {
  // 기본 상태
  isMute: boolean;
  isCameraOn: boolean;
  isChatOpen: boolean;
  
  // 연결 상태
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // 참여자 관리
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  participantsCnt: number;
  
  // 미디어 요소
  carouselItems: {
    track: LocalVideoTrack | RemoteTrackPublication;
    participantId: string;
    isLocal: boolean;
  }[];
  
  // 방 정보
  roomName: string;
  activeSpeakerId: string | null;
}

export type VideoAction = 
  | { type: "TOGGLE_MUTE"; payload?: boolean }
  | { type: "TOGGLE_CAMERA"; payload?: boolean }
  | { type: "TOGGLE_CHAT"; payload?: boolean }
  | { type: "UPDATE_PARTICIPANTS"; payload: RemoteParticipant[] }
  | { type: "SET_LOCAL_PARTICIPANT"; payload: LocalParticipant }
  | { type: "UPDATE_CAROUSEL"; payload: VideoConferenceContextType['carouselItems'] }
  | { type: "SET_CONNECTION_STATE"; payload: { isConnected: boolean; isConnecting: boolean } }
  | { type: "SET_ACTIVE_SPEAKER"; payload: string | null }
  | { type: "SET_ROOM_NAME"; payload: string }
  | { type: "SET_ERROR"; payload: string | null };
