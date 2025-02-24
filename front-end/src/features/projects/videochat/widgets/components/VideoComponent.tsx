import { useRef, useEffect } from "react"
import { VideoComponentProps } from "../../type/VideoConferenceTypes"
import profileImage from "../../../../../assets/profile_image.png"

const VideoComponent = ({ videoTrack, participantIdentity, muted = false, isVideoOff }: VideoComponentProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoTrack.attach(videoRef.current)
    }
    return () => {
      videoTrack.detach()
    }
  }, [videoTrack])

  return (
    <div id={"camera-" + participantIdentity} className="video-container rounded-md overflow-hidden">
      {!isVideoOff ? (
        <video ref={videoRef} autoPlay playsInline muted={muted} id={videoTrack?.sid} style={{ transform: "scaleX(-1)" }} className="w-full h-full object-cover"></video>
      ) : (
        <div className="w-full h-full bg-[#2F3336] flex justify-center items-center">
          <img src={profileImage} alt="profileImg" className="absolute rounded-full w-[20%]" />
        </div>
      )}
    </div>
  )
}

export default VideoComponent
