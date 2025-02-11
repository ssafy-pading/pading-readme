import { LocalAudioTrack, RemoteAudioTrack } from "livekit-client";
import { useEffect, useRef } from "react";

interface AudioComponentProps {
    audioTrack: LocalAudioTrack | RemoteAudioTrack;
}

function AudioComponent({ audioTrack }: AudioComponentProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioTrack.attach(audioRef.current);
        }

        return () => {
            if(audioRef.current){
                audioTrack.detach(audioRef.current);
            }
        };
    }, [audioTrack]);

    return <audio ref={audioRef} id={audioTrack?.sid} autoPlay playsInline />;
}

export default AudioComponent;
