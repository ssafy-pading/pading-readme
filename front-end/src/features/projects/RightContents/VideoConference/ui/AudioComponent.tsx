import { LocalAudioTrack, RemoteTrack } from "livekit-client";
import { useEffect, useRef } from "react";

interface AudioComponentProps {
    audioTrack: LocalAudioTrack | RemoteTrack;
}

function AudioComponent({ audioTrack }: AudioComponentProps) {
    const audioElement = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioElement.current) {
            audioTrack.attach(audioElement.current);
        }

        return () => {
            audioTrack.detach();
        };
    }, [audioTrack]);

    return <audio ref={audioElement} id={audioTrack?.sid} />;
}

export default AudioComponent;
