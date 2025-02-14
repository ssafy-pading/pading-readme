import { useEffect, useRef } from "react";
import { AudioComponentProps } from "../../type/VideoConferenceTypes";

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
