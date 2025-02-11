import React, { useRef, useEffect } from "react";
import Slider from "react-slick";
import AudioComponent from "./AudioComponent";
import VideoComponent from "./VideoComponent";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import "./VerticalCarousel.css";
import { LocalVideoTrack, LocalAudioTrack, RemoteVideoTrack, RemoteAudioTrack } from "livekit-client";

export interface Participant {
  id: string;
  identity: string;
  isLocal: boolean;
  videoTrack: LocalVideoTrack | RemoteVideoTrack | undefined;
  audioTrack?: LocalAudioTrack | RemoteAudioTrack | undefined;
}

interface VerticalCarouselProps {
  isChatOpen: boolean;
  localParticipant?: Participant;
  remoteParticipants: Participant[];
  hasJoined: boolean;
  onJoin: () => void;
}

const VerticalCarousel: React.FC<VerticalCarouselProps> = ({
  isChatOpen,
  localParticipant,
  remoteParticipants,
  hasJoined,
  onJoin,
}) => {
  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    const slideHeight = isChatOpen ? "50%" : "25%";
    document.documentElement.style.setProperty("--slide-height", slideHeight);
  }, [isChatOpen]);

  const getSlideCount = () => {
    const participantCount = (localParticipant ? 1 : 0) + remoteParticipants.length;
    return isChatOpen ? Math.min(participantCount, 2) : Math.min(participantCount, 4);
  };
  
  const shouldShowCarouselButtons = () => {
    const participantCount = (localParticipant ? 1 : 0) + remoteParticipants.length;
    return isChatOpen ? participantCount >= 3 : participantCount >= 5;
  };
  
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
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0F172A] overflow-hidden">
      {hasJoined ? (
        <>
          <Slider ref={sliderRef} {...settings}>
            {localParticipant && localParticipant.videoTrack && (
              <div key={localParticipant.id} className="relative p-2">
                <VideoComponent
                  videoTrack={localParticipant.videoTrack}
                  participantIdentity={localParticipant.identity}
                  muted={true}
                />
                <div className="absolute top-0 left-4 mt-2 text-sm text-white">
                  {localParticipant.identity && "(You)"}
                </div>
              </div>
            )}

            {remoteParticipants.map((participant) => 
              participant.videoTrack ? (
              <div key={participant.id} className="relative p-2">
                {participant.videoTrack && (
                  <VideoComponent
                    videoTrack={participant.videoTrack}
                    participantIdentity={participant.identity}
                  />
                )}
                {participant.audioTrack && (
                  <AudioComponent audioTrack={participant.audioTrack} />
                )}
                <div className="absolute top-0 left-4 mt-2 text-sm text-white">
                  {participant.identity}
                </div>
              </div>
            ):null)}
          </Slider>

          {shouldShowCarouselButtons() && (
            <>
              <button
                onClick={() => sliderRef.current?.slickPrev()}
                className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-white bg-black bg-opacity-75 px-2 rounded-br-md rounded-bl-md"
              >
                <TiArrowSortedUp size="1.5em" />
              </button>
              <button
                onClick={() => sliderRef.current?.slickNext()}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 text-white bg-black bg-opacity-75 px-2 rounded-tr-md rounded-tl-md"
              >
                <TiArrowSortedDown size="1.5em" />
              </button>
            </>
          )}
        </>
      ) : (
        <div className="flex flex-col justify-center h-full">
          <div className="bg-gray-800 flex justify-center">
            화상 회의
          </div>
          <div className="flex flex-1 justify-center items-center">
            <button onClick={onJoin} className="join-btn bg-blue-500 text-white p-3 rounded-lg">
              <p className="text-sm">화상회의 참여하기</p>
            </button>
          </div>
        </div>
      )}
    </div >
  );
};

export default VerticalCarousel;
