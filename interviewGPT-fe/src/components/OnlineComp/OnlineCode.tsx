// import React, { useState } from 'react'
// import SideBar from './SideBar';
// import Code from './Code';

// const OnlineCode = () => {
//   const [currentIndex,setCurrentIndex]=useState(0);

//   const previousbtn=()=>{
//     if(currentIndex==0){
//       setCurrentIndex(questions.length-1)
//     }else setCurrentIndex(currentIndex-1)
//   }
//   const nextbtn=()=>{
//     if(currentIndex==questions.length-1){
//       setCurrentIndex(0)
//     }else setCurrentIndex(currentIndex+1)
//   }
  

//   const questions=[
//     {id:1,question:"What is blah blah1 nbgctxawsgom t eswa    nbgctxawsgom t eswa            u  yf xw fgyffswwrtrpmbcfedggyrrewd nbgctxawsgom t eswa            u  yf xw fgyffswwrtrpmbcfedggyrrewd nbgctxawsgom t eswa            u  yf xw fgyffswwrtrpmbcfedggyrrewd         u  yf xw fgyffswwrtrpmbcfedggyrrewd"},
//     {id:2,question:"What is blah blah2"},
//     {id:3,question:"What is blah blah3"},
//     {id:4,question:"What is blah blah4"},
//   ]
//   // const {id,question}=questions[currentIndex]
//   return (
//     <div className="flex h-screen">
//           <SideBar questions={questions} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}/>
//           <Code questions={questions} setCurrentIndex={setCurrentIndex} currentIndex={currentIndex} />
//         </div>
        

//   )
// }

// export default OnlineCode;



// import React, { useState } from 'react';

// const IntroScreen: React.FC = () => {
//   const [isMicrophoneAccessible, setIsMicrophoneAccessible] = useState<boolean>(false);
//   const [isCameraAccessible, setIsCameraAccessible] = useState<boolean>(false);

//   const allowMicrophoneAccess = () => {
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then(() => setIsMicrophoneAccessible(true))
//       .catch(() => setIsMicrophoneAccessible(false));
//   };

//   const allowCameraAccess = () => {
//     navigator.mediaDevices.getUserMedia({ video: true })
//       .then(() => setIsCameraAccessible(true))
//       .catch(() => setIsCameraAccessible(false));
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen">
//       <h1 className="text-4xl font-bold mb-4">Online Proctored Exam</h1>
//       <div className="max-w-md text-center">
//         <p className="mb-2">Welcome to the exam. Before you begin, please ensure that your system meets the following requirements:</p>
//         <div className="flex justify-center mb-4">
//           <button
//             className={`mr-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isMicrophoneAccessible ? 'bg-green-500' : 'bg-red-500'}`}
//             onClick={allowMicrophoneAccess}
//           >
//             {isMicrophoneAccessible ? <i className="fas fa-check-circle mr-2"></i> : <i className="fas fa-times-circle mr-2"></i>}
//             Allow Microphone
//           </button>
//           <button
//             className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isCameraAccessible ? 'bg-green-500' : 'bg-red-500'}`}
//             onClick={allowCameraAccess}
//           >
//             {isCameraAccessible ? <i className="fas fa-check-circle mr-2"></i> : <i className="fas fa-times-circle mr-2"></i>}
//             Allow Camera
//           </button>
//         </div>
//         <p>Please make sure your microphone and camera are working properly. Once you're ready, click the button below to start the exam.</p>
//       </div>
//       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//         Start Exam
//       </button>
//     </div>
//   );
// };

// export default IntroScreen;

// import React, { useState, useRef, useEffect } from 'react';

// const IntroScreen: React.FC = () => {
//   const [userPhoto, setUserPhoto] = useState<string | null>(null);
//   const [isMicrophoneAccessible, setIsMicrophoneAccessible] = useState<boolean>(false);
//   const [isCameraAccessible, setIsCameraAccessible] = useState<boolean>(false);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const chunksRef = useRef<any[]>([]);

//   const allowMicrophoneAccess = () => {
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then(() => setIsMicrophoneAccessible(true))
//       .catch(() => setIsMicrophoneAccessible(false));
//   };

//   const allowCameraAccess = () => {
//     navigator.mediaDevices.getUserMedia({ video: true })
//       .then((stream) => {
//         setIsCameraAccessible(true);
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       })
//       .catch(() => setIsCameraAccessible(false));
//   };

//   const takeSelfie = () => {
//     if (videoRef.current && canvasRef.current) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext('2d');
//       ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
//       const photoData = canvas.toDataURL('image/png');
//       setUserPhoto(photoData);
//     }
//   };
//   useEffect(()=>{
//     const startRecording = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }

//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorder.ondataavailable = (event: BlobEvent) => {
//         chunksRef.current.push(event.data);
//       };
//       mediaRecorderRef.current = mediaRecorder;
//       mediaRecorder.start();
//     };
//     startRecording()
//   })

//   return (
//     <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow">
//       <h2 className="text-lg font-semibold mb-4">System Check & Verification Photo</h2>
//       <div className="space-y-3">
//         <div className="flex items-center">
//           <span className={`flex-shrink-0 w-6 h-6 rounded-full p-1 ${isCameraAccessible ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
//             {isCameraAccessible ? (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth="2">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//               </svg>
//             ) : (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth="2">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             )}
//           </span>
//           <span className="ml-3 text-sm text-zinc-700">Camera</span>
//         </div>
//         <div className="flex items-center">
//           <span className={`flex-shrink-0 w-6 h-6 rounded-full p-1 ${isMicrophoneAccessible ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
//             {isMicrophoneAccessible ? (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth="2">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//               </svg>
//             ) : (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth="2">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             )}
//           </span>
//           <span className="ml-3 text-sm text-zinc-700">Microphone</span>
//           <span className="text-xs text-red-500 ml-2">
//             {isMicrophoneAccessible ? '' : 'Please speak louder or adjust microphone level'}
//           </span>
//         </div>
//         <div className="flex items-center">
//           <button
//             onClick={allowCameraAccess}
//             className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
//           >
//             Allow Camera
//           </button>
//           <button
//             onClick={allowMicrophoneAccess}
//             className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded ml-2"
//           >
//             Allow Microphone
//           </button>
//         </div>
//       </div>
//       <div className="mt-4 mb-2">
//         <div className="border-2 border-red-500 w-full h-32 flex justify-center items-center relative">
//           <video
//             ref={videoRef}
//             className="absolute inset-0 w-full h-full object-cover"
//             autoPlay
//             playsInline
//             muted
//           ></video>
//           {userPhoto && (
//             <img
//               src={userPhoto}
//               alt="Selfie"
//               className="absolute inset-0 w-full h-full object-cover"
//             />
//           )}
//         </div>
//         <p className="text-sm text-zinc-600 mt-2">Please ensure your face is within this box and there is adequate lighting</p>
//       </div>
//       <button onClick={takeSelfie} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-4 w-full">Click a Selfie</button>
//       <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mt-4 w-full">Proceed to test</button>
//       <canvas ref={canvasRef} className="hidden"></canvas>
//     </div>
//   );
// };

// export default IntroScreen;



import React, { useState, useRef, useEffect } from 'react';
import './online.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const IntroScreen: React.FC = () => {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isMicrophoneAccessible, setIsMicrophoneAccessible] = useState<boolean>(false);
  const [isCameraAccessible, setIsCameraAccessible] = useState<boolean>(false);
  const [isBrowserAccessible, setIsBrowserAccessible] = useState<boolean>(true);
  const [hasTakenSelfie, setHasTakenSelfie] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
 const navigate=useNavigate()
  useEffect(() => {
    const checkMediaAccess = async () => {

     

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsBrowserAccessible(false);
      }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setIsCameraAccessible(true);
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
      } catch (error) {
        setIsCameraAccessible(false);
      }

      try {
        const microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicrophoneAccessible(true);
        microphoneStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        setIsMicrophoneAccessible(false);
      }
    };

    checkMediaAccess();
  }, []);

  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL('image/png');
      setUserPhoto(photoData);
      setHasTakenSelfie(true);
    }
  };

  const retakeSelfie = () => {
    setUserPhoto(null);
    setHasTakenSelfie(false);
  };

  return (
    <div>
      <h1 className='text-center font-semibold text-3xl p-[3rem]'>Welcom To Online Proctored Exam</h1>
    <div className="w-[90%] mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg ml-[5rem]  font-semibold mb-4" style={{fontSize:"1.3rem"}}>System Check & Verification Photo</h2>
      <div className='flex items-center justify-center '>
        <div className=" flex-1">
          <div className="flex items-center mx-auto mb-8  int-page">
            <div className='flex'>
              <div><FontAwesomeIcon icon={faCamera} style={{ color:   'rgb(175 171 171)' }} /></div>
              <div className="ml-3 text-sm text-zinc-700">Camera</div>
            </div>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full p-1 ${isCameraAccessible ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
              {isCameraAccessible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex items-center mx-auto mb-8 int-page">
            <div className='flex'>
              <div><FontAwesomeIcon icon={faMicrophone} style={{ color:   'rgb(175 171 171)' }} /></div>
              <div className="ml-3 text-sm text-zinc-700">Microphone</div>
            </div>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full p-1 ${isMicrophoneAccessible ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
              {isMicrophoneAccessible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex items-center mx-auto mb-8  int-page">
            <div className='flex'>
              <div><FontAwesomeIcon icon={faCamera} style={{ color:   'rgb(175 171 171)' }} /></div>
              <div className="ml-3 text-sm text-zinc-700">Browser</div>
            </div>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full p-1 ${isBrowserAccessible ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
              {isBrowserAccessible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          <div className="text-xs text-red-500 ml-2">
            {isMicrophoneAccessible ? '' : 'Please speak louder or adjust microphone level'}
          </div>
        </div>
        <div className="mt-4 mb-2 flex-1">
          <div className="border-2 border-red-500 w-[50%] h-[15rem] m-auto flex justify-center items-center relative">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            ></video>
            {userPhoto && (
              <img
                src={userPhoto}
                alt="Selfie"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
          <p className="text-sm text-zinc-600 text-center mt-2">Please ensure your face is within this box and there is adequate lighting</p>
          {hasTakenSelfie ? (
            <button style={{width:"30%"}} onClick={retakeSelfie} className="block w-[33%] mx-auto bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mt-4 w-full">Retake Selfie</button>
          ) : (
            <button style={{width:"30%"}} onClick={takeSelfie} className="block w-[33%] mx-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-4 w-full">Click a Selfie</button>
          )}
        </div>
      </div>
      <div className='border-t border-solid border-lightgray mt-8'>
        <button onClick={()=>navigate("/instruction")} style={{width:"30%"}}
          disabled={!isBrowserAccessible || !isCameraAccessible || !isMicrophoneAccessible}
          className={`w-[18%] ml-auto block ${(!isBrowserAccessible || !isCameraAccessible || !isMicrophoneAccessible) ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'} text-white py-2 px-4 rounded mt-4 w-full`}
        >
          Proceed to test
        </button>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
    </div>
  );
};

export default IntroScreen;
