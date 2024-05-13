import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import api from '../customAxios/Axios';
import { useNavigate } from 'react-router-dom';
import MainAssessment from '../MainAssessment';
import Timer from '../McqComp/Timer';

const Sample: React.FC = () => {
  const initialTime = 120; // Initial time in seconds
  const [time, setTime] = useState<number>(0); // Start time from 0
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const [canName,setCanname]=useState("");
  const [id, setId] = useState<number>(0);
  const [behavioralQuestions, setBehavioralQuestions] = useState<any[]>([]);
  
  
  useEffect(() => {
    const storedItemString = localStorage.getItem('item');
    if (storedItemString) {
      
      const storedItem = JSON.parse(storedItemString);
      console.log(storedItem)
      setCanname(storedItem?.candidate_name);
      setId(storedItem?.job_id)
  }
  
    const fetchBehavioralQuestions = async () => {
      console.log(canName,id)
      try {
      if(canName && id){

        const resp = await api.post('/fetch_behavioural_questions', { candidate_name: canName, job_id:id });
        setBehavioralQuestions(resp.data.Behaviour_q);
      }} catch (error) {
        console.error('Error fetching behavioral questions:', error);
      }
    };

    fetchBehavioralQuestions();

    const delayTimer = setTimeout(() => {
      setTimerStarted(true);
      startRecording();
    }, 5000);

    return () => clearTimeout(delayTimer);
  }, [canName,id]);

  useEffect(() => {
    if (!timerStarted || isPaused) return;

    timerInterval.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime >= initialTime) {
          clearInterval(timerInterval.current!);
          complete();
          return prevTime;
        }
        return prevTime + 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval.current!);
  }, [timerStarted, isPaused]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = handleDataAvailable;
        mediaRecorder.current.start();
        setIsRecording(true);
      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
      });
  };

  const handleDataAvailable = (event: BlobEvent) => {
    chunks.current.push(event.data);
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const complete = async () => {
    stopRecording();

    if (currentQuestionIndex === behavioralQuestions.length - 1) {
      navigate("/mcq-main");
    }

  
      

    if (currentQuestionIndex < behavioralQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setTime(0);
      setTimerStarted(true);
      setIsPaused(false);
    } else {
      console.log("All questions completed");
    }
  };

  const handleStop = () => {
    clearInterval(timerInterval.current!);
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const progressBarWidth = `${(time / initialTime) * 100}%`;

  return (
    <div className='flex'>
      <MainAssessment/>
      <div style={{ width: "-webkit-fill-available"}}>
        <div className="bg-zinc-200 dark:bg-zinc-900 p-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-zinc-800 dark:text-white">Online Coding Assessment</div>
            {/* <Timer> */}
          </div>
        </div>
        <div className='mx-auto py-8' style={{ width: "84%" }}>
          <p style={{fontSize:"1.3rem"}}>{behavioralQuestions[currentQuestionIndex]?.b_question_text}</p>
        </div>
        <div className="relative m-auto p-4 bg-white shadow-lg rounded-lg flex justify-around" style={{ width: "84%", height: "70vh", flexDirection: "column" }}>
          <div className="text-xl font-semibold mb-4 text-center">Speak the answer to the question you hear</div>
          <div className="flex justify-center items-center ">
            <button className="bg-orange-500 text-white p-3 rounded-full w-20 h-20 flex items-center justify-center">
              <FontAwesomeIcon icon={faMicrophone} style={{ fontSize: "2rem" }} />
            </button>
          </div>
          <div className="flex justify-center items-center" style={{ flexDirection: "column" }}>
            <div className="w-64 h-2 bg-zinc-300 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-2" style={{ width: progressBarWidth }}></div>
            </div>
            <div className=" m-4 text-lg font-semibold text-gray-600">
              {formatTime(time)}/02:00
            </div>
            {isPaused ? (
              <button onClick={handleResume} className="bg-green-500 text-white px-6 py-2 rounded-lg">Resume</button>
            ) : (
              <button onClick={handleStop} className="bg-red-500 text-white px-6 py-2 rounded-lg">Stop</button>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-4 ">
              <div className="text-orange-500 font-semibold text-center"></div>
              {currentQuestionIndex === behavioralQuestions.length - 1 ? (
                <button onClick={complete} className="bg-orange-500 text-white px-6 py-2 rounded-lg">Finish</button>
              ) : (
                <button onClick={complete} className="bg-orange-500 text-white px-6 py-2 rounded-lg">Next</button>
              )}
            </div>
            <div className="flex justify-end mt-4">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sample;
