import {
    LocalVideoTrack,
    RemoteTrack, //remote는 track으로 관리하는 이유가 한 remote 참가자에서 다양한 track을 가질 수 있기 때문
    RemoteTrackPublication,
    Room,
    RoomEvent,
    createLocalTracks,
    LocalAudioTrack,
} from "livekit-client";
import { useState, useEffect, useRef } from "react";
import VerticalCarousel from './VerticalCarousel';
import Modal from "react-modal";
import VideoComponent from "./VideoComponent";
import { IoClose } from "react-icons/io5";

type TrackInfo = {
    trackPublication: RemoteTrackPublication;
    participantIdentity: string;
};

interface Participant {
    id: string;
    identity: string;
    isLocal: boolean;
    videoTrack: LocalVideoTrack | RemoteTrack | undefined;
    audioTrack: LocalAudioTrack | RemoteTrack | undefined;
}

interface OpenViduComponentProps {
    isChatOpen: boolean
}

const APPLICATION_SERVER_URL = import.meta.env.VITE_APPLICATION_SERVER_URL;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

const OpenViduComponent: React.FC<OpenViduComponentProps> = ({
    isChatOpen
}) => {
    const [room, setRoom] = useState<Room | undefined>(undefined);
    const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | undefined>(undefined);
    const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | undefined>(undefined);
    const [remoteTracks, setRemoteTracks] = useState<TrackInfo[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [hasJoined, setHasJoined] = useState(false);

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const [previewVideoTrack, setPreviewVideoTrack] = useState<LocalVideoTrack | undefined>(undefined);
    const [previewAudioTrack, setPreviewAudioTrack] = useState<LocalAudioTrack | undefined>(undefined);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [volume, setVolume] = useState<number>(0);

    // 참가자 상태 동기화
    useEffect(() => {
        const newParticipants: Participant[] = [];
        console.log("APPLICATION_SERVER_URL", APPLICATION_SERVER_URL);
        console.log("LIVEKIT_URL", LIVEKIT_URL);
        // 로컬 참가자 추가
        {
            (localVideoTrack || localAudioTrack) &&
            newParticipants.push({
                id: 'local',
                identity: "You",
                isLocal: true,
                videoTrack: localVideoTrack,
                audioTrack: localAudioTrack,
            });
        }

        // 원격 참가자 추가 (존재하는 참가자인지 확인)
        remoteTracks.forEach(({ trackPublication, participantIdentity }) => {
            // 이미 존재하는 참가자인지 확인
            const existingParticipant = newParticipants.find(p => p.id === participantIdentity);
            if (existingParticipant) { // 이미 존재한다면 track만 업데이트
                if (trackPublication.kind === "video") {
                    existingParticipant.videoTrack = trackPublication.track as RemoteTrack;
                } else if (trackPublication.kind === "audio") {
                    existingParticipant.audioTrack = trackPublication.track as RemoteTrack;
                }
            } else {
                newParticipants.push({
                    id: participantIdentity,
                    identity: participantIdentity,
                    isLocal: false,
                    videoTrack: trackPublication.kind === "video" ? trackPublication.track as RemoteTrack : undefined,
                    audioTrack: trackPublication.kind === "audio" ? trackPublication.track as RemoteTrack : undefined
                });
            }
        });

        setParticipants(newParticipants);
    }, [localVideoTrack, localAudioTrack, remoteTracks]);
    

    // 카메라 & 마이크 미리보기 실행
    const openPreview = async () => {
        try {
            const tracks = await createLocalTracks({ video: true, audio: true });
            const videoTrack = tracks.find(track => track.kind === "video") as LocalVideoTrack;
            const audioTrack = tracks.find(track => track.kind === "audio") as LocalAudioTrack;

            if (videoTrack) setPreviewVideoTrack(videoTrack);
            if (audioTrack) {
                setPreviewAudioTrack(audioTrack);
                playAudioTrack(audioTrack);
                analyzeAudioTrack(audioTrack);
            }
            setIsPreviewOpen(true);
        } catch (error) {
            console.error("Preview error:", error);
        }
    };

    // 오디오 트랙 재생
    const playAudioTrack = (audioTrack: LocalAudioTrack) => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }
        audioTrack.attach(audioRef.current);
        audioRef.current.play();
    };

    // 오디오 볼륨 감지
    const analyzeAudioTrack = (audioTrack: LocalAudioTrack) => {
        if (!audioTrack.mediaStream) return; // 미디어 스트림 여부 확인. 없으면 source 선언에서 에러 발생

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(audioTrack.mediaStream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyser);

        const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            const avgVolume = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
            setVolume(avgVolume);
            requestAnimationFrame(updateVolume);
        };

        updateVolume();
    };

    const closePreview = () => {
        previewVideoTrack?.stop();
        previewAudioTrack?.stop();
        setPreviewVideoTrack(undefined);
        setPreviewAudioTrack(undefined);
        setIsPreviewOpen(false);
    };

    // 룸에 실제로 입장
    const joinRoom = async () => {
        const room = new Room();
        setRoom(room);
        console.log("room", room);

        room.on(RoomEvent.TrackSubscribed, (_, publication) => {
            setRemoteTracks((prev) =>
                prev.filter((track) => track.trackPublication.trackSid !== publication.trackSid)
            );
        });

        room.on(RoomEvent.TrackUnsubscribed, (_, publication) => {
            setRemoteTracks(prev =>
                prev.filter(track => track.trackPublication.trackSid !== publication.trackSid)
            );
        });

        try {
            const token = await getToken();
            await room.connect(LIVEKIT_URL, token);

            await room.localParticipant.enableCameraAndMicrophone();
            const videoTrack = room.localParticipant.videoTrackPublications.values().next().value?.track;
            const audioTrack = room.localParticipant.audioTrackPublications.values().next().value?.track;
            setLocalVideoTrack(videoTrack as LocalVideoTrack);
            setLocalAudioTrack(audioTrack as LocalAudioTrack);
            console.log("room.localParticipant", room.localParticipant)

            setHasJoined(true);
            closePreview(); // 미리보기 닫기
        } catch (error) {
            console.error("Connection error:", error);
            leaveRoom();
        }
    };

    const leaveRoom = async () => {
        if (room) {
            await room.disconnect();
            setRoom(undefined);
            setLocalVideoTrack(undefined);
            setLocalAudioTrack(undefined);
            setRemoteTracks([]);
            setHasJoined(false);
        }
    };

    const getToken = async () => {
        const response = await fetch(`${APPLICATION_SERVER_URL}/v1/openvidu/token/1`, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMiIsIm5hbWUiOiLqsJXslYjsiJgiLCJ0b2tlbl90eXBlIjoiQUNDRVNTIiwiaWF0IjoxNzM5MTAyMTIzLCJleHAiOjE3NDAzMTE3MjN9.Q7FV6fu0fn5e2_mhekucOnC7r1puXEkM5TIuC4dmlHM",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                session: "default-room",
                data: JSON.stringify({ participant: "User" })
            })
        });
        return (await response.json()).token;
    };

    return (
        <div className="h-full w-full flex flex-1">
            <div className="h-full w-full">
                <VerticalCarousel
                    isChatOpen={isChatOpen}
                    participants={participants}
                    hasJoined={hasJoined}
                    onJoin={openPreview}
                />
            </div>

            <Modal
                isOpen={isPreviewOpen}
                onRequestClose={closePreview}
                className="flex items-center justify-center z-20"
                overlayClassName="flex items-center justify-center fixed inset-0 bg-black bg-opacity-40 z-20"
                ariaHideApp={false}
                shouldCloseOnOverlayClick={true}
            >
                <div className="bg-[#0F172A] h-1/2 w-1/2 p-6 rounded-lg shadow-lg text-center border border-[#273654] relative">
                    {/* Close 버튼 */}
                    <button
                        onClick={closePreview}
                        className="absolute top-2 right-4 text-white text-xl flex items-center justify-center w-8 h-8 rounded-full hover:scale-110"
                    >
                        <IoClose className="text-2xl" />
                    </button>
                    <div className="mt-5">
                        {previewVideoTrack && (
                            <VideoComponent videoTrack={previewVideoTrack} participantIdentity="" />
                        )}
                    </div>
                    {/* 🔊 볼륨 시각화 바 */}
                    <div className="mt-0 w-full">
                        <progress value={volume} max="255" className="w-full h-2 bg-gray-200 rounded"></progress>
                    </div>

                    <div className="flex justify-center mt-4">
                        <button onClick={joinRoom} className="w-1/4 bg-blue-500 text-white px-4 py-2 rounded-md font-bold">
                            입장
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default OpenViduComponent;
