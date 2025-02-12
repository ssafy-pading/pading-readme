import { LocalVideoTrack, LocalAudioTrack, RemoteVideoTrack, RemoteAudioTrack } from "livekit-client";

// openvidu 참가자 타입
export type Participant = {
    id: string;
    identity: string;
    isLocal: boolean;
    videoTrack: LocalVideoTrack | RemoteVideoTrack | undefined;
    audioTrack?: LocalAudioTrack | RemoteAudioTrack | undefined;
}


export interface VerticalCarouselProps {
    isChatOpen: boolean;
    localParticipant?: Participant;
    remoteParticipants: Participant[];
    hasJoined: boolean;
    onJoin: () => void;
}

export interface VideoComponentProps {
  videoTrack: LocalVideoTrack | RemoteVideoTrack;
  participantIdentity: string;
  muted?: boolean;
}

export interface AudioComponentProps {
    audioTrack: LocalAudioTrack | RemoteAudioTrack;
}



