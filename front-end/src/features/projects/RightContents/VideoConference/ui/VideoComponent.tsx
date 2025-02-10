// VideoComponent.tsx
import { useRef, useEffect } from 'react';
import { LocalVideoTrack, RemoteTrack } from 'livekit-client';

interface VideoComponentProps {
  videoTrack: LocalVideoTrack | RemoteTrack;
  participantIdentity: string;
}

const VideoComponent = ({ videoTrack, participantIdentity }: VideoComponentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoTrack.attach(videoRef.current);
    }
    return () => {
      videoTrack.detach();
    };
  }, [videoTrack]);

  return (
    <div id={"camera-" + participantIdentity} className="video-container rounded-md overflow-hidden">
      <video ref={videoRef} id={videoTrack?.sid} style={{ transform: "scaleX(-1)" }} className="w-full h-full object-cover"></video>
    </div>
  );
};

export default VideoComponent;
