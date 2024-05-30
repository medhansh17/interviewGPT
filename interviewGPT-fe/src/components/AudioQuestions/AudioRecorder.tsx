// import { useState, useRef } from "react";

// const mimeType = "audio/webm";

// const AudioRecorder = () => {
//   const [permission, setPermission] = useState(false);
//   const [stream, setStream] = useState<MediaStream | null>(null);

//   const mediaRecorder = useRef<MediaRecorder | null>(null);
//   const [recordingStatus, setRecordingStatus] = useState<
//     "inactive" | "recording"
//   >("inactive");

//   //   const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

//   const startRecording = async () => {
//     if (!stream) return;

//     setRecordingStatus("recording");
//     const media = new MediaRecorder(stream, { mimeType });
//     mediaRecorder.current = media;

//     const localAudioChunks: Blob[] = [];
//     mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
//       if (event.data.size > 0) {
//         localAudioChunks.push(event.data);
//       }
//     };

//     mediaRecorder.current.onstop = () => {
//       //   const audioBlob = new Blob(localAudioChunks, { type: mimeType });
//       //   const audioUrl = URL.createObjectURL(audioBlob);
//       // Perform any actions with the audioUrl here if needed
//       //   setAudioChunks([]);
//     };

//     // setAudioChunks(localAudioChunks);
//     mediaRecorder.current.start();
//   };

//   const stopRecording = () => {
//     if (mediaRecorder.current && recordingStatus === "recording") {
//       setRecordingStatus("inactive");
//       mediaRecorder.current.stop();
//     }
//   };

//   const getMicrophonePermission = async () => {
//     if ("MediaRecorder" in window) {
//       try {
//         const streamData = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//           video: false,
//         });
//         setPermission(true);
//         setStream(streamData);
//       } catch (err: any) {
//         alert(err.message);
//       }
//     } else {
//       alert("The MediaRecorder API is not supported in your browser.");
//     }
//   };

//   return (
//     <div>
//       <h2>Audio Recorder</h2>
//       <main>
//         <div className="audio-controls">
//           {!permission ? (
//             <button onClick={getMicrophonePermission} type="button">
//               Get Microphone
//             </button>
//           ) : null}
//           {permission && recordingStatus === "inactive" ? (
//             <button onClick={startRecording} type="button">
//               Start Recording
//             </button>
//           ) : null}
//           {recordingStatus === "recording" ? (
//             <button onClick={stopRecording} type="button">
//               Stop Recording
//             </button>
//           ) : null}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AudioRecorder;
