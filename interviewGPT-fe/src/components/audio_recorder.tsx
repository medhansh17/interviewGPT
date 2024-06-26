import { useRef, useState, useEffect } from "react";
import { submitAudio } from "@/api/audioSubmission";
import { useToast } from "./toast";
import { useLoader } from "@/context/loaderContext";

const AudioRecorder = ({
  question_id,
  candidate_id,
  jobId,
}: {
  question_id: string;
  candidate_id: string;
  jobId: string | null;
}) => {
  const { setLoading } = useLoader();
  const toast = useToast();
  const mediaStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const isRecording = useRef<boolean>(false);
  const [minutes, setMinutes] = useState<number>(2);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  useEffect(() => {
    // Reset the state when the question changes
    setRecordedUrl(null);
    setMinutes(2);
    setSeconds(0);
    setIsRunning(false);
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
    clearInterval(timerRef.current);
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
    }
  }, [question_id]);

  const submitAudioBlob = async (blob: Blob) => {
    setLoading(true);
    try {
      await submitAudio({
        audioBlob: blob,
        question_id: question_id,
        candidate_id: candidate_id,
        jobId: jobId,
      });
    } catch (error) {
      setLoading(false);
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error",
        title: "Error submitting audio",
        description: "",
        open: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorder.current.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
      mediaRecorder.current.onstop = () => {
        const recordedBlob = new Blob(chunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(recordedBlob);
        setRecordedUrl(url);
        chunks.current = [];
        submitAudioBlob(recordedBlob);
      };
      mediaRecorder.current.start();
      isRecording.current = true;
      setIsRunning(true);
      startTimer();
    } catch (error) {
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error",
        title: "Error starting recording",
        description: "Kindly check your microphone permissions",
        open: true,
      });
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorder.current &&
      (mediaRecorder.current.state === "recording" ||
        mediaRecorder.current.state === "paused")
    ) {
      mediaRecorder.current.stop();
      isRecording.current = false;
      setIsRunning(false);
      clearInterval(timerRef.current);
      setMinutes(2);
      setSeconds(0);
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    let secondsCounter = seconds;
    let minutesCounter = minutes;
    timerRef.current = setInterval(() => {
      secondsCounter--;
      if (secondsCounter === -1) {
        secondsCounter = 59;
        minutesCounter--;
      }
      if (minutesCounter === 0 && secondsCounter === 0) {
        stopRecording();
      } else {
        setSeconds(secondsCounter);
        setMinutes(minutesCounter);
      }
    }, 1000);
  };

  const handleReRecord = () => {
    setRecordedUrl(null);
    startRecording();
  };

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "50px" }}>
          <span>{minutes < 10 ? `0${minutes}` : minutes}</span>:
          <span>{seconds < 10 ? `0${seconds}` : seconds}</span>
        </div>
        <p>{isRunning ? "Recording" : "Not recording"}</p>
      </div>
      {recordedUrl && (
        <div className="mt-4">
          <audio controls src={recordedUrl} />
        </div>
      )}
      <div className="w-[150px] flex justify-between mt-2">
        {!recordedUrl && (
          <>
            <button
              className="bg-blue-500 text-white p-2 rounded-lg shadow"
              onClick={startRecording}
              disabled={isRecording.current}
            >
              Start
            </button>
            <button
              className="bg-blue-500 text-white p-2 rounded-lg shadow"
              onClick={stopRecording}
              disabled={!isRecording.current}
            >
              Stop
            </button>
          </>
        )}
        {recordedUrl && (
          <button
            className="bg-blue-500 text-white p-2 rounded-lg shadow"
            onClick={handleReRecord}
          >
            Re-record
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
