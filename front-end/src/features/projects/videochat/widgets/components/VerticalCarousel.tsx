import React, { useRef, useEffect } from "react"
import Slider from "react-slick"
import AudioComponent from "./AudioComponent"
import VideoComponent from "./VideoComponent"
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti"
import "./VerticalCarousel.css"
import { VerticalCarouselProps, RemoteParticipant } from "../../type/VideoConferenceTypes"
import { useSelector } from "react-redux"
import { RootState } from "../../../../../app/redux/store"
import profileImage from "../../../../../assets/profile_image.png"

const VerticalCarousel: React.FC<VerticalCarouselProps> = ({ isChatOpen, localParticipant, remoteParticipants, hasJoined, onJoin, isVideoOff }) => {
  const sliderRef = useRef<Slider>(null)
  const isMute = useSelector((state: RootState) => state.videoConference.isMute)

  const getSlideCount = () => {
    const participantCount = (localParticipant ? 1 : 0) + remoteParticipants.length
    const maxSlides = isChatOpen ? 2 : 4
    return Math.min(participantCount, maxSlides)
  }

  const slideHeight = getSlideCount() === 2 ? "h-1/2" : "h-1/4"

  const shouldShowCarouselButtons = () => {
    const participantCount = (localParticipant ? 1 : 0) + remoteParticipants.length
    return isChatOpen ? participantCount >= 3 : participantCount >= 5
  }

  const settings = {
    dots: false,
    infinite: false,
    vertical: true,
    verticalSwiping: true,
    slidesToShow: getSlideCount(),
    slidesToScroll: getSlideCount(),
    adaptiveHeight: false,
    draggable: false,
    arrows: false,
  }

  useEffect(() => {
    if (localParticipant?.audioTrack) {
      const track = localParticipant.audioTrack.mediaStreamTrack
      track.enabled = !isMute
    }
  }, [isMute, localParticipant])

  return (
    <div className="relative w-full h-full flex flex-col bg-[#212426] overflow-hidden">
      {hasJoined ? (
        <div className="h-full w-full">
          <Slider ref={sliderRef} {...settings}>
            {localParticipant && (
              <div className={`slick-item ${slideHeight} flex items-center justify-center aspect-[4/2.9]`}>
                <div className="relative w-full h-full p-2">
                  {localParticipant.videoTrack && !isVideoOff ? (
                    <div className="h-full w-full">
                      <VideoComponent videoTrack={localParticipant.videoTrack} participantIdentity={localParticipant.identity} muted={true} />
                    </div>
                  ) : (
                    <div className="h-full w-full bg-[#2F3336] flex justify-center items-center p-2 rounded-md">
                      <img src={localParticipant.image || profileImage} alt="profileImg" className="rounded-full w-[20%] h-[20%]" />
                    </div>
                  )}
                  <div className="absolute top-0 left-4 mt-2 text-xs text-white font-bold">{localParticipant.identity && "(You)"}</div>
                </div>
              </div>
            )}

            {remoteParticipants.map((participant: RemoteParticipant) => (
              <div className={`slick-item ${slideHeight} flex items-center justify-center aspect-[4/2.9]`}>
                <div className="relative w-full h-full p-2 pt-0">
                  {participant.videoTrack && (
                    <div className="relative h-full w-full bg-[#2F3336] flex justify-center items-center rounded-md">
                      <img src={participant.image || profileImage} alt="profileImg" className="absolute rounded-full w-[20%] h-[20%]" />
                      {participant.videoTrack && <VideoComponent videoTrack={participant.videoTrack} participantIdentity={participant.identity} />}
                      {participant.audioTrack && <AudioComponent audioTrack={participant.audioTrack} />}
                    </div>
                  )}
                  <div className="absolute top-0 left-4 mt-2 text-xs text-white font-bold">{participant.name}</div>
                </div>
              </div>
            ))}
          </Slider>

          {shouldShowCarouselButtons() && (
            <>
              <button onClick={() => sliderRef.current?.slickPrev()} className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-white bg-black bg-opacity-75 px-2 rounded-br-md rounded-bl-md">
                <TiArrowSortedUp size="1.5em" />
              </button>
              <button onClick={() => sliderRef.current?.slickNext()} className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 text-white bg-black bg-opacity-75 px-2 rounded-tr-md rounded-tl-md">
                <TiArrowSortedDown size="1.5em" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col justify-center h-full">
          <div className="flex flex-1 justify-center items-center">
            <button onClick={onJoin} className="join-btn bg-blue-500 text-white p-2 rounded-md hover:scale-110 transition-transform duration-200 ease-in-out">
              <p className="text-xs">화상회의 참여하기</p>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerticalCarousel
