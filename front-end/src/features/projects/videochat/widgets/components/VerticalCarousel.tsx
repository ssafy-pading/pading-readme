import React, { useRef, useEffect, useState } from "react";
import Slider from "react-slick";
import AudioComponent from "./AudioComponent";
import VideoComponent from "./VideoComponent";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import "./VerticalCarousel.css";
import { VerticalCarouselProps } from "../../type/VideoConferenceTypes";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../../app/redux/store";

const VerticalCarousel: React.FC<VerticalCarouselProps> = ({
  isChatOpen,
  localParticipant,
  remoteParticipants,
  hasJoined,
  onJoin,
}) => {
  const sliderRef = useRef<Slider>(null);
  const isVideoOff = useSelector((state: RootState) => state.videoConference.isVideoOff);
  const isMute = useSelector((state: RootState) => state.videoConference.isMute);

  const getSlideCount = () => {
    const participantCount = (localParticipant ? 1 : 0) + remoteParticipants.length;
    const maxSlides = isChatOpen ? 2 : 4;
    return Math.min(participantCount, maxSlides);
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

  useEffect(() => {
    if (localParticipant?.videoTrack) {
      const track = localParticipant.videoTrack.mediaStreamTrack;
      track.enabled = !isVideoOff;
    }
  }, [isVideoOff, localParticipant]);

  useEffect(() => {
    if (localParticipant?.audioTrack) {
      const track = localParticipant.audioTrack.mediaStreamTrack;
      track.enabled = !isMute;
    }
  }, [isMute, localParticipant]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#212426] overflow-hidden">
      {hasJoined ? (
        <>
          <Slider ref={sliderRef} {...settings}>
            {localParticipant && localParticipant.videoTrack && (
              <div key={localParticipant.id} className="relative p-2 pb-0">
                <VideoComponent
                  videoTrack={localParticipant.videoTrack}
                  participantIdentity={localParticipant.identity}
                  muted={true}
                />
                <div className="absolute top-0 left-4 mt-2 text-xs text-white font-bold">
                  {localParticipant.identity && "(You)"}
                </div>
              </div>
            )}

            {remoteParticipants.map((participant) =>
              participant.videoTrack ? (
                <div key={participant.id} className="relative p-2 pt-1 pb-0">
                  {participant.videoTrack && (
                    <VideoComponent
                      videoTrack={participant.videoTrack}
                      participantIdentity={participant.identity}
                    />
                  )}
                  {participant.audioTrack && (
                    <AudioComponent audioTrack={participant.audioTrack} />
                  )}
                  <div className="absolute top-0 left-4 mt-2 text-xs text-white font-bold">
                    {participant.name}
                  </div>
                </div>
              ) : null)}
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
          <div className="h-[25px] bg-[#2F3336] flex items-center font-bold text-white text-xs pl-4 border-b border-[#666871] border-opacity-50">
            Video
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
