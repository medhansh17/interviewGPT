// // import React, { useEffect, useRef } from 'react';

// // interface Props {
// //   isRecording: boolean;
// // }

// // const VideoRecorder: React.FC<Props> = ({ isRecording }) => {
// //   const videoRef = useRef<HTMLVideoElement>(null);
// //   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
// //   const chunksRef = useRef<any[]>([]);

// //   useEffect(() => {
// //     const startRecording = async () => {
// //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
// //       if (videoRef.current) {
// //         videoRef.current.srcObject = stream;
// //       }

// //       const mediaRecorder = new MediaRecorder(stream);
// //       mediaRecorder.ondataavailable = (event: BlobEvent) => {
// //         chunksRef.current.push(event.data);
// //       };
// //       mediaRecorderRef.current = mediaRecorder;
// //       mediaRecorder.start();
// //     };

// //     const stopRecording = () => {
// //       if (mediaRecorderRef.current) {
// //         mediaRecorderRef.current.stop();
// //       }
// //     };

// //     if (isRecording) {
// //       startRecording();
// //     } else {
// //       stopRecording();
// //     }

// //     return () => {
// //       stopRecording();
// //     };
// //   }, [isRecording]);

// //   return (
// //     <div>
// //       <video ref={videoRef} width="320" height="240" autoPlay muted></video>
// //     </div>
// //   );
// // };

// // export default VideoRecorder;

// import React, { useState } from 'react';

// const Audio: React.FC = () => {
//   const [recording, setRecording] = useState<boolean>(false);
//   const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
//   const [question, setQuestion] = useState<string>("What is your answer?");

//   let mediaRecorder: MediaRecorder | null = null;
//   let stream: MediaStream | null = null;

//   const startRecording = async () => {
//     stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     mediaRecorder = new MediaRecorder(stream);
    
//     mediaRecorder.ondataavailable = (event) => {
//       setAudioChunks([...audioChunks, event.data]);
//     };

//     mediaRecorder.onstop = () => {
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };

//     mediaRecorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     if (mediaRecorder && mediaRecorder.state === 'recording') {
//       mediaRecorder.stop();
//       setRecording(false);
//     }
//   };

//   const playRecording = () => {
//     const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
//     const audioUrl = URL.createObjectURL(audioBlob);
//     const audio= new Audio(audioUrl);
//     audio.play();
//   };

//   return (
//     <div className="bg-gray-200 min-h-screen flex justify-center items-center">
//       <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
//         <h2 className="text-xl font-semibold mb-4">{question}</h2>
//         {!recording ? (
//           <button
//             onClick={startRecording}
//             className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
//           >
//             Start Recording
//           </button>
//         ) : (
//           <button
//             onClick={stopRecording}
//             className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
//           >
//             Stop Recording
//           </button>
//         )}
//         {recording && <p className="mt-2">Recording...</p>}
//         {audioChunks.length > 0 && (
//           <button
//             onClick={playRecording}
//             className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
//           >
//             Play Recording
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Audio;