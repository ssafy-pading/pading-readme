import { LocalVideoTrack, LocalAudioTrack, RemoteVideoTrack, RemoteAudioTrack, Room } from "livekit-client";

// openvidu 참가자 타입
export interface Participant {
    id: string;
    identity: string;
    isLocal: boolean;
    videoTrack: LocalVideoTrack | RemoteVideoTrack | undefined;
    audioTrack?: LocalAudioTrack | RemoteAudioTrack | undefined;
}

export interface RemoteParticipant extends Participant {
    name: string;
}


export interface VerticalCarouselProps {
    isChatOpen: boolean;
    localParticipant?: Participant;
    remoteParticipants: RemoteParticipant[];
    hasJoined: boolean;
    onJoin: () => void;
    startVideo: () => void;
}

export interface VideoComponentProps {
  videoTrack: LocalVideoTrack | RemoteVideoTrack;
  participantIdentity: string;
  muted?: boolean;
  isVideoOff?: boolean;
}

export interface AudioComponentProps {
    audioTrack: LocalAudioTrack | RemoteAudioTrack;
}



