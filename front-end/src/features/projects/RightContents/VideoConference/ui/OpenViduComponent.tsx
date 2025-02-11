import {
    LocalVideoTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
    createLocalTracks,
    LocalAudioTrack,
    RemoteVideoTrack,
    RemoteAudioTrack,
} from "livekit-client";
import { useState, useEffect, useRef } from "react";
import VerticalCarousel, { Participant } from './VerticalCarousel';
import Modal from "react-modal";
import VideoComponent from "./VideoComponent";
import AudioComponent from "./AudioComponent";
import { IoClose } from "react-icons/io5";
import { FiInfo } from "react-icons/fi";

const APPLICATION_SERVER_URL = import.meta.env.VITE_APPLICATION_SERVER_URL;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

type TrackInfo = {
    trackPublication: RemoteTrackPublication;
    participantIdentity: string;
};

const OpenViduComponent: React.FC<{ isChatOpen: boolean }> = ({ isChatOpen }) => {
    const [room, setRoom] = useState<Room | undefined>(undefined);
    const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | undefined>(undefined);
    const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | undefined>(undefined);
    const [remoteTracks, setRemoteTracks] = useState<TrackInfo[]>([]);
    const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
    const [remoteParticipants, setRemoteParticipants] = useState<Participant[]>([]);
    const [hasJoined, setHasJoined] = useState<boolean>(false);

    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

    const [previewVideoTrack, setPreviewVideoTrack] = useState<LocalVideoTrack | undefined>(undefined);
    const [previewAudioTrack, setPreviewAudioTrack] = useState<LocalAudioTrack | undefined>(undefined);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [volume, setVolume] = useState<number>(0);
    const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);

    useEffect(() => {
        if (localVideoTrack || localAudioTrack) {
            setLocalParticipant({
                id: "local",
                identity: "You",
                isLocal: true,
                videoTrack: localVideoTrack,
                audioTrack: localAudioTrack,
            });
        } else {
            setLocalParticipant(null);
        }

        const remoteMap: { [key: string]: Participant } = {};
        remoteTracks.forEach(({ trackPublication, participantIdentity }) => {
            if (!remoteMap[participantIdentity]) {
                remoteMap[participantIdentity] = {
                    id: participantIdentity,
                    identity: participantIdentity,
                    isLocal: false,
                    videoTrack: undefined,
                    audioTrack: undefined,
                };
            }
            if (trackPublication.kind === "video") {
                remoteMap[participantIdentity].videoTrack = trackPublication.track as RemoteVideoTrack;
            } else if (trackPublication.kind === "audio") {
                remoteMap[participantIdentity].audioTrack = trackPublication.track as RemoteAudioTrack;
            }
        });
        setRemoteParticipants(Object.values(remoteMap));
    }, [localVideoTrack, localAudioTrack, remoteTracks]);

    const openPreview = async () => {
        try {
            const tracks = await createLocalTracks({ video: true, audio: true });
            const videoTrack = tracks.find((t) => t.kind === "video") as LocalVideoTrack;
            const audioTrack = tracks.find((t) => t.kind === "audio") as LocalAudioTrack;
            setPreviewVideoTrack(videoTrack);
            setPreviewAudioTrack(audioTrack);

            if (!audioRef.current) {
                audioRef.current = new Audio();
            }
            audioTrack.attach(audioRef.current);
            await audioRef.current.play();

            setIsPreviewOpen(true);
        } catch (error) {
            console.error("Preview error:", error);
            setShowPermissionModal(true);
        }
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

        room.on(RoomEvent.TrackSubscribed, (_track, publication, participant) => {
            setRemoteTracks((prev) => [
                ...prev,
                { trackPublication: publication, participantIdentity: participant.identity },
            ]);
        });

        room.on(RoomEvent.TrackUnsubscribed, (_track, publication) => {
            setRemoteTracks((prev) =>
                prev.filter((track) => track.trackPublication.trackSid !== publication.trackSid)
            );
        });

        try {
            const token = await getToken();
            await room.connect(LIVEKIT_URL, token);

            await room.localParticipant.enableCameraAndMicrophone();
            const videoPublication = Array.from(room.localParticipant.videoTrackPublications.values())[0];
            const audioPublication = Array.from(room.localParticipant.audioTrackPublications.values())[0];
            setLocalVideoTrack(videoPublication?.track as LocalVideoTrack);
            setLocalAudioTrack(audioPublication?.track as LocalAudioTrack);
            console.log("room.localParticipant", room.localParticipant)

            setHasJoined(true);
            closePreview();
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
        const response = await fetch(`${APPLICATION_SERVER_URL}/v1/openvidu/token/groups/8/projects/1`, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("accessToken"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                session: "default-room",
                data: JSON.stringify({ participant: "User" })
            })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to get token: ${error.errorMessage}`);
        }
        const data = await response.json();
        return data.token;
    };

    return (
        <div className="h-full w-full flex flex-1">
            <VerticalCarousel
                isChatOpen={isChatOpen}
                localParticipant={localParticipant || undefined}
                remoteParticipants={remoteParticipants}
                hasJoined={hasJoined}
                onJoin={openPreview}
            />

            {showPermissionModal && (
                <Modal
                    isOpen={showPermissionModal}
                    onRequestClose={() => setShowPermissionModal(false)}
                    className="flex items-center justify-center z-20"
                    overlayClassName="flex items-center justify-center fixed inset-0 bg-black bg-opacity-40 z-20"
                    ariaHideApp={false}
                >
                    <div className="bg-[#212426] text-white p-6 rounded-lg shadow-lg text-center flex-col justify-center">
                        <h2 className="text-xl font-bold mb-4">카메라 및 마이크 권한 필요</h2>
                        <p className="text-gray-400 mb-4">
                            회의에 참여하려면 브라우저에서 카메라와 마이크 권한을 허용해야 합니다.
                        </p>
                        <p className="text-gray-400 text-sm mb-4">
                            권한이 차단된 경우, 아래 가이드를 참고하여 브라우저 설정에서 변경해주세요.
                        </p>
                        <div className="text-left text-sm text-gray-300 bg-[#212426] p-3 rounded">
                            <p className="flex items-center gap-1">
                                <strong>Chrome:</strong> 주소창 왼쪽 <FiInfo /> 아이콘 클릭 → '카메라'와 '마이크'를 '허용'으로 변경
                            </p>
                            <p className="flex items-center gap-1">
                                <strong>Edge:</strong> 주소창 왼쪽 <FiInfo /> 아이콘 클릭 → '사이트 권한' → '카메라'와 '마이크' 허용
                            </p>
                            <p>
                                <strong>Safari (iOS):</strong> 설정 → Safari → '카메라' 및 '마이크' 허용
                            </p>
                        </div>
                        <button
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => setShowPermissionModal(false)}
                        >
                            닫기
                        </button>
                    </div>
                </Modal>
            )}
            {isPreviewOpen && (
                <Modal
                    isOpen={isPreviewOpen}
                    onRequestClose={closePreview}
                    className="flex items-center justify-center z-20"
                    overlayClassName="flex items-center justify-center fixed inset-0 bg-black bg-opacity-40 z-20"
                    ariaHideApp={false}
                >
                    <div className="bg-[#0F172A] h-1/2 w-1/2 p-6 rounded-lg shadow-lg text-center border border-[#273654] relative">
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
            )}
        </div>
    );
}

export default OpenViduComponent;
