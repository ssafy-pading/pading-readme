import React, { useRef, useEffect } from "react";
import Slider from "react-slick";
import VideoComponent from "./VideoComponent";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import "./VerticalCarousel.css";
import { LocalVideoTrack, LocalAudioTrack, RemoteTrack } from "livekit-client";
import AudioComponent from "./AudioComponent";

interface Participant {
  id: string;
  identity: string;
  isLocal: boolean;
  videoTrack: LocalVideoTrack | RemoteTrack | undefined;
  audioTrack: LocalAudioTrack | RemoteTrack | undefined;
}

interface VerticalCarouselProps {
  isChatOpen: boolean;
  participants: Participant[];
  hasJoined: boolean;
  onJoin: () => void;
}

const VerticalCarousel: React.FC<VerticalCarouselProps> = ({
  isChatOpen,
  participants,
  hasJoined,
  onJoin,
}) => {
  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    const slideHeight = isChatOpen ? "50%" : "25%";
    document.documentElement.style.setProperty("--slide-height", slideHeight);
  }, [isChatOpen]);

  const getSlideCount = () => {
    const participantCount = participants.length;
    const baseSlides = isChatOpen ? 2 : 4;
    return participantCount <= baseSlides ? participantCount : baseSlides;
  };

  const settings = {
    dots: false,
    infinite: false,
    vertical: true,
    verticalSwiping: true,
    slidesToShow: getSlideCount(),
    slidesToScroll: isChatOpen ? 2 : 4,
    adaptiveHeight: false,
    draggable: false,
    arrows: false,
    beforeChange: (current: number, next: number) => {
      console.log(current, next);
    },
  };

  const videoParticipants = participants.filter(
    p => p.videoTrack && p.videoTrack.kind === "video"
  );

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0F172A] overflow-hidden">
      {hasJoined ? (
        <>
          <Slider ref={sliderRef} {...settings}>
            {videoParticipants.map((participant) => (
              <div key={participant.id} className="relative p-2">
                {participant.videoTrack && (
                    <VideoComponent
                      videoTrack={participant.videoTrack}
                      participantIdentity={participant.identity}
                    />
                  )}
                {participant.audioTrack && !participant.isLocal && (
                    <AudioComponent audioTrack={participant.audioTrack} />
                  )}
                <div className="absolute top-0 left-4 mt-2 text-sm text-white">
                  {participant.identity} {participant.isLocal && '(You)'}
                </div>
              </div>
            ))}
          </Slider>

          {getSlideCount() > 2 && (
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
        <div className="flex justify-center mt-10">
          <button onClick={onJoin} className="join-btn bg-blue-500 text-white p-3 rounded-lg">
            <p className="text-sm">화상회의 참여하기</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default VerticalCarousel;
