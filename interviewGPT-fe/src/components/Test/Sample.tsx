import React, { useState, useRef } from 'react';
import VideoRecorder from './VideoRecorder';

const ProctoredTest: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);

  const handleStartTest = () => {
    setIsTestStarted(true);
  };

  const handleFinishTest = () => {
    setIsTestFinished(true);
    setIsRecording(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  return (
    <div>
      {!isTestStarted && !isTestFinished && (
        <button onClick={handleStartTest}>Start Test</button>
      )}
      {isTestStarted && !isTestFinished && (
        <div>
          <h2>Test in Progress</h2>
          {!isRecording ? (
            <button onClick={handleStartRecording}>Start Recording</button>
          ) : (
            <button onClick={handleFinishTest}>Finish Test</button>
          )}
          <VideoRecorder isRecording={isRecording} />
        </div>
      )}
      {isTestFinished && (
        <div>
          <h2>Test Finished</h2>
          <p>Thank you for completing the test.</p>
        </div>
      )}
    </div>
  );
};

export default ProctoredTest;