import React, { useState, useRef, useEffect } from "react";
import "./online.css";
import api from "@/components/customAxios/Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

const IntroScreen: React.FC = () => {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isMicrophoneAccessible, setIsMicrophoneAccessible] =
    useState<boolean>(false);
  const [isPhone, setIsPhone] = useState<boolean>(false);
  const [isCameraAccessible, setIsCameraAccessible] = useState<boolean>(false);
  const [isBrowserAccessible, setIsBrowserAccessible] = useState<boolean>(true);
  const [hasTakenSelfie, setHasTakenSelfie] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsPhone(isMobile()); // Set the state to indicate if user is on phone
    const checkMediaAccess = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsBrowserAccessible(false);
      }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setIsCameraAccessible(true);
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
        }
      } catch (error) {
        setIsCameraAccessible(false);
      }

      try {
        const microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setIsMicrophoneAccessible(true);
        microphoneStream.getTracks().forEach((track) => track.stop());
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
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL("image/png");
      localStorage.setItem("userSelfie", photoData);
      setUserPhoto(photoData);
      setHasTakenSelfie(true);

      // Convert dataURL to File object
      const blob = dataURLToBlob(photoData);
      const file = new File([blob], "selfie.png", { type: "image/png" });

      // Upload the selfie
      const candidateId = "12345"; // Replace with the actual candidate ID
      uploadSelfie(candidateId, file);
    }
  };

  const dataURLToBlob = (dataURL: any) => {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const uploadSelfie = async (imageFile: any) => {
    const formData = new FormData();
    formData.append(
      "candidate_id",
      JSON.parse(sessionStorage.getItem("question") ?? "").candidate_id
    );
    formData.append("image", imageFile);

    try {
      const response = await api.post("/upload_screenshot", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        console.log("Image uploaded successfully:", response.data.image_url);
      } else {
        console.error("Image upload failed:", response.data.error);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const retakeSelfie = () => {
    setUserPhoto(null);
    setHasTakenSelfie(false);
  };

  return (
    <div>
      <h1 className="text-center font-semibold text-3xl p-[3rem]">
        Welcome To Online Proctored Exam
      </h1>
      <div className="w-[90%] mx-auto bg-white p-6 rounded-lg shadow">
        <h2
          className="text-lg ml-[5rem]  font-semibold mb-4"
          style={{ fontSize: "1.3rem" }}
        >
          System Check & Verification Photo
        </h2>
        <div className="flex items-center justify-center ">
          <div className=" flex-1">
            <div className="flex items-center mx-auto mb-8  int-page">
              <div className="flex">
                <div>
                  <FontAwesomeIcon
                    icon={faCamera}
                    style={{ color: "rgb(175 171 171)" }}
                  />
                </div>
                <div className="ml-3 text-sm text-zinc-700">Camera</div>
              </div>
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full p-1 ${
                  isCameraAccessible
                    ? "bg-green-100 text-green-500"
                    : "bg-red-100 text-red-500"
                }`}
              >
                {isCameraAccessible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex items-center mx-auto mb-8 int-page">
              <div className="flex">
                <div>
                  <FontAwesomeIcon
                    icon={faMicrophone}
                    style={{ color: "rgb(175 171 171)" }}
                  />
                </div>
                <div className="ml-3 text-sm text-zinc-700">Microphone</div>
              </div>
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full p-1 ${
                  isMicrophoneAccessible
                    ? "bg-green-100 text-green-500"
                    : "bg-red-100 text-red-500"
                }`}
              >
                {isMicrophoneAccessible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex items-center mx-auto mb-8  int-page">
              <div className="flex">
                <div>
                  <FontAwesomeIcon
                    icon={faCamera}
                    style={{ color: "rgb(175 171 171)" }}
                  />
                </div>
                <div className="ml-3 text-sm text-zinc-700">Browser</div>
              </div>
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full p-1 ${
                  isBrowserAccessible
                    ? "bg-green-100 text-green-500"
                    : "bg-red-100 text-red-500"
                }`}
              >
                {isBrowserAccessible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex items-center mx-auto mb-8  int-page">
              <div className="flex">
                <div>
                  <FontAwesomeIcon
                    icon={faCamera}
                    style={{ color: "rgb(175 171 171)" }}
                  />
                </div>
                <div className="ml-3 text-sm text-zinc-700">
                  {isPhone == false ? "Desktop" : "Switch to Desktop"}
                </div>
              </div>
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full p-1 ${
                  isPhone == false
                    ? "bg-green-100 text-green-500"
                    : "bg-red-100 text-red-500"
                }`}
              >
                {isPhone == false ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="text-xs text-red-500 ml-2">
              {isMicrophoneAccessible
                ? ""
                : "Please speak louder or adjust microphone level"}
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
            <p className="text-sm text-red-600 text-center mt-2">
              * Cannot proceed without a selfie
            </p>
            <p className="text-sm text-zinc-600 text-center mt-2">
              Please ensure your face is within this box and there is adequate
              lighting
            </p>
            {hasTakenSelfie ? (
              <button
                style={{ width: "30%" }}
                onClick={retakeSelfie}
                className="block  mx-auto bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mt-4 w-full"
              >
                Retake Selfie
              </button>
            ) : (
              <button
                style={{ width: "30%" }}
                onClick={takeSelfie}
                className="block  mx-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-4 w-full"
              >
                Click a Selfie
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-solid border-lightgray mt-8">
          <button
            onClick={() => navigate("/instruction")}
            style={{ width: "30%" }}
            disabled={
              !isBrowserAccessible ||
              !isCameraAccessible ||
              !isMicrophoneAccessible ||
              isPhone ||
              !hasTakenSelfie
            }
            className={`w-[18%] mx-auto block ${
              !isBrowserAccessible ||
              !isCameraAccessible ||
              !isMicrophoneAccessible ||
              isPhone ||
              !hasTakenSelfie
                ? "bg-gray-300"
                : "bg-green-500 hover:bg-green-600"
            } text-white py-2 px-4 rounded mt-4 w-full`}
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
