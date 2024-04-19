import React, { useEffect, useRef } from 'react';

interface Props {
  isRecording: boolean;
}

const VideoRecorder: React.FC<Props> = ({ isRecording }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<any[]>([]);

  useEffect(() => {
    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        chunksRef.current.push(event.data);
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };

    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      stopRecording();
    };
  }, [isRecording]);

  return (
    <div>
      <video ref={videoRef} width="320" height="240" autoPlay muted></video>
    </div>
  );
};

export default VideoRecorder;