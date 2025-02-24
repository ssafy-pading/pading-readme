import { LocalVideoTrack, RemoteTrackPublication, Room, RoomEvent, createLocalTracks, LocalAudioTrack, RemoteVideoTrack, RemoteAudioTrack } from "livekit-client"
import { useParams } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import VerticalCarousel from "./VerticalCarousel"
import Modal from "react-modal"
import VideoComponent from "./VideoComponent"
import { IoClose } from "react-icons/io5"
import { FiInfo } from "react-icons/fi"
import { PulseLoader } from "react-spinners"
import { Participant, RemoteParticipant } from "../../type/VideoConferenceTypes"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../../../app/redux/store"
import MuteButton from "../../../projectpage/widgets/buttons/ProjectMuteButton"
import { BsFillCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs"
import useProjectAxios from "../../../../../shared/apis/useProjectAxios"

const APPLICATION_SERVER_URL = import.meta.env.VITE_APP_API_BASE_URL
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL

type TrackInfo = {
  trackPublication: RemoteTrackPublication
  participantIdentity: string
}

const OpenViduComponent: React.FC<{
  isChatOpen: boolean
}> = ({ isChatOpen }) => {
  const [room, setRoom] = useState<Room | undefined>(undefined)
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | undefined>(undefined)
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | undefined>(undefined)
  const [remoteTracks, setRemoteTracks] = useState<TrackInfo[]>([])
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null)
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([])
  const [hasJoined, setHasJoined] = useState<boolean>(false)
  const [isMute, setIsMute] = useState<boolean>(false)
  const [isPressed, setIsPressed] = useState<boolean>(false)

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false)

  const [previewVideoTrack, setPreviewVideoTrack] = useState<LocalVideoTrack | undefined>(undefined)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [volume, setVolume] = useState<number>(0)
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false)

  const [joiningRoom, setJoiningRoom] = useState<boolean>(false)

  const { groupId, projectId } = useParams<{ groupId: string; projectId: string }>()

  const { getProjectMemberStatus } = useProjectAxios();
  const dispatch = useDispatch()
  const onLeave = useSelector((state: RootState) => state.videoConference.onLeave)

  useEffect(()=>{
    console.log("localParticipant: ", localParticipant);
    console.log("grouId: ", groupId)
  }, [localParticipant])

  useEffect(() => {
    const fetchMembersAndUpdateParticipants = async () => {
      try {
        const onlineMembers = await getProjectMemberStatus(groupId ?? '', projectId ?? '');
  
        if (localVideoTrack || localAudioTrack) {
          const localMember = onlineMembers.find(member => member.id.toString() === room?.localParticipant.identity);
          setLocalParticipant({
            id: room?.localParticipant.identity || '',
            identity: "You",
            isLocal: true,
            image: localMember?.image || null,
            videoTrack: localVideoTrack,
            audioTrack: localAudioTrack,
          });
        } else {
          setLocalParticipant(null);
        }
  
        const remoteMap: { [key: string]: Participant } = {};
        remoteTracks.forEach(({ trackPublication, participantIdentity }) => {
          if (!remoteMap[participantIdentity]) {
            const remoteMember = onlineMembers.find(member => member.id.toString() === participantIdentity);
            remoteMap[participantIdentity] = {
              id: participantIdentity,
              identity: participantIdentity,
              isLocal: false,
              image: remoteMember?.image || null,
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
  
        const newRemoteParticipants = Object.values(remoteMap).map((participant) => {
          const remoteParticipant = room?.remoteParticipants.get(participant.id);
          return {
            ...participant,
            name: remoteParticipant?.name || participant.identity,
          };
        });
  
        console.log("newRemoteParticipants: ", newRemoteParticipants);
        setRemoteParticipants(newRemoteParticipants);
      } catch (error) {
        console.error("Error fetching project member status:", error);
      }
    };
  
    fetchMembersAndUpdateParticipants();
  }, [localVideoTrack, localAudioTrack, remoteTracks, room, groupId, projectId, getProjectMemberStatus]);
  

  const openPreview = async () => {
    try {
      const tracks = await createLocalTracks({ video: true, audio: true })
      const videoTrack = tracks.find((t) => t.kind === "video") as LocalVideoTrack
      const audioTrack = tracks.find((t) => t.kind === "audio") as LocalAudioTrack
      setPreviewVideoTrack(videoTrack)

      // 오디오 컨텍스트 생성
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(new MediaStream([audioTrack.mediaStreamTrack]))
      microphone.connect(analyser)

      // 볼륨 레벨 모니터링
      const checkVolume = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        const volumeLevel = Math.max(...dataArray)
        setVolume(volumeLevel)
        requestAnimationFrame(checkVolume)
      }

      checkVolume()
      setIsPreviewOpen(true)
    } catch (error) {
      console.error("Preview error:", error)
      setShowPermissionModal(true)
    }
  }

  const closePreview = () => {
    previewVideoTrack?.stop()
    previewVideoTrack?.mediaStreamTrack.stop()
    previewVideoTrack?.detach()
    setPreviewVideoTrack(undefined)
    setIsPreviewOpen(false)
    audioContextRef.current?.close()
    audioContextRef.current = null
  }

  // 룸에 실제로 입장
  const joinRoom = async () => {
    setJoiningRoom(true)
    const room = new Room()
    setRoom(room)
    console.log("room", room);

    room.on(RoomEvent.TrackSubscribed, (_track, publication, participant) => {
      setRemoteTracks((prev) => [...prev, { trackPublication: publication, participantIdentity: participant.identity }])
    })

    room.on(RoomEvent.TrackUnsubscribed, (_track, publication) => {
      setRemoteTracks((prev) => prev.filter((track) => track.trackPublication.trackSid !== publication.trackSid))
    })

    try {
      const token = await getToken()
      await room.connect(LIVEKIT_URL, token)
      // console.log("token: ", token);

      await room.localParticipant.enableCameraAndMicrophone()
      const videoPublication = Array.from(room.localParticipant.videoTrackPublications.values())[0]
      const audioPublication = Array.from(room.localParticipant.audioTrackPublications.values())[0]
      setLocalVideoTrack(videoPublication?.track as LocalVideoTrack)
      setLocalAudioTrack(audioPublication?.track as LocalAudioTrack)
      // console.log("room.localParticipant", room.localParticipant)
      // console.log("room.remoteParticipants", room.remoteParticipants)

      setHasJoined(true)
      setJoiningRoom(!false)
      closePreview()
    } catch (error) {
      console.error("Connection error:", error)
      leaveRoom()
    }
  }

  const leaveRoom = async () => {
    if (!room) return

    try {
      await room.disconnect()

      // 1. 로컬 비디오, 오디오 트랙 중지
      localVideoTrack?.stop()
      localAudioTrack?.stop()
      localVideoTrack?.mediaStreamTrack.stop()
      localAudioTrack?.mediaStreamTrack.stop()

      // 2. 화면에서 트랙 제거
      localVideoTrack?.detach()
      localAudioTrack?.detach()

      // 3. MediaStream 트랙들 모두 중지
      if (localVideoTrack?.mediaStreamTrack) {
        const stream = new MediaStream([localVideoTrack.mediaStreamTrack])
        stream.getTracks().forEach((track) => track.stop())
      }

      if (localAudioTrack?.mediaStreamTrack) {
        const stream = new MediaStream([localAudioTrack.mediaStreamTrack])
        stream.getTracks().forEach((track) => track.stop())
      }

      // 4. 이벤트 리스너 제거
      room.localParticipant.removeAllListeners()
      room.removeAllListeners()

      // 5. 원격 참가자의 리스너 정리
      room.remoteParticipants.forEach((participant) => {
        participant.removeAllListeners()
      })

      remoteParticipants.forEach((participant) => {
        participant.videoTrack?.detach()
        participant.audioTrack?.detach()
        participant.videoTrack?.stop()
        participant.audioTrack?.stop()
        participant.videoTrack?.mediaStreamTrack.stop()
        participant.audioTrack?.mediaStreamTrack.stop()
      })

      // 6. 상태 초기화
      setRoom(undefined)
      setLocalVideoTrack(undefined)
      setLocalAudioTrack(undefined)
      setRemoteTracks([])
      setHasJoined(false)
    } catch (error) {
      console.error("Error while leaving the room:", error)
    }
  }

  const getToken = async () => {
    const response = await fetch(`${APPLICATION_SERVER_URL}/v1/openvidu/token/groups/${groupId}/projects/${projectId}`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: "default-room",
        data: JSON.stringify({ participant: "User" }),
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to get token: ${error.errorMessage}`)
    }
    const data = await response.json()
    return data.token
  }

  useEffect(() => {
    dispatch({ type: "videoConference/setOnLeave", payload: leaveRoom })
    console.log("leaveRoom")
    return () => {
      dispatch({ type: "videoConference/setOnLeave", payload: null })
    }
  }, [dispatch])

  useEffect(() => {
    if (onLeave === null) {
      leaveRoom()
      closePreview()
    }
  }, [onLeave])

  // 페이지 새로고침 시 리소스 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      leaveRoom()
      closePreview()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    return () => {
      leaveRoom()
      closePreview()
    }
  }, [])

  const muteVideo = () => {
    if (!isMute) {
      localVideoTrack?.mute()
      setIsMute(true)
    } else {
      localVideoTrack?.unmute()
      setIsMute(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-1 flex-col">
      <div className="h-[27px] w-full bg-[#2F3336] flex items-center font-bold text-white text-xs px-4 border-b border-[#666871] border-opacity-50 justify-between">
        <div>Video</div>
        <div className="flex gap-3">
          <MuteButton />
          <button
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onClick={muteVideo}
            className={`text-white cursor-pointer transition-transform duration-200 ease-in-out ${isPressed ? "scale-75" : "scale-100"}`}
          >
            {!isMute ? <BsFillCameraVideoFill className="text-md" /> : <BsCameraVideoOffFill className="text-md" />}
          </button>
        </div>
      </div>
      {/* <button onClick={muteVideo}>버 튼</button> */}
      <VerticalCarousel
        isChatOpen={isChatOpen}
        localParticipant={localParticipant || undefined}
        remoteParticipants={remoteParticipants}
        hasJoined={hasJoined}
        onJoin={openPreview}
        isVideoOff={isMute}
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
            <p className="text-gray-400 mb-4">회의에 참여하려면 브라우저에서 카메라와 마이크 권한을 허용해야 합니다.</p>
            <p className="text-gray-400 text-sm mb-4">권한이 차단된 경우, 아래 가이드를 참고하여 브라우저 설정에서 변경해주세요.</p>
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
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setShowPermissionModal(false)}>
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
          <div className="bg-[#212426] h-1/2 w-1/2 p-6 rounded-lg shadow-lg text-center relative">
            <button onClick={closePreview} className="absolute top-2 right-4 text-white text-xl flex items-center justify-center w-8 h-8 rounded-full hover:scale-110">
              <IoClose className="text-xl" />
            </button>
            <div className="mt-5">{previewVideoTrack && <VideoComponent videoTrack={previewVideoTrack} participantIdentity="" />}</div>
            <div className="mt-0 w-full">
              <progress value={volume} max="255" className="w-full h-2 bg-gray-200 rounded"></progress>
            </div>

            <div className="flex justify-center mt-4">
              {joiningRoom ? (
                <div className="flex text-sm w-1/4 h-8 bg-blue-500 rounded-md justify-center items-center">
                  <PulseLoader size={8} margin={4} color={"#ffffff"} />
                </div>
              ) : (
                <button onClick={joinRoom} className="text-sm w-1/4 h-8 bg-blue-500 text-white rounded-md">
                  참여하기
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default OpenViduComponent
