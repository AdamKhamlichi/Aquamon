import { useState, useEffect } from "react";

const Timer = ({ onSecondsChange }) => {
    const [seconds, setSeconds] = useState(0);
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1;
  
          // Send updated seconds to the parent through the callback
          if (onSecondsChange) {
            onSecondsChange(newSeconds); // Notify parent with new seconds
          }
  
          return newSeconds;
        });
      }, 1000);
  
      // Cleanup interval when Timer component unmounts
      return () => clearInterval(intervalId);
    }, [onSecondsChange]); // Dependency array makes sure the effect runs only once
  
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const timeStarted = time % 60;
      return `${minutes < 10 ? '0' : ''}${minutes}:${timeStarted < 10 ? '0' : ''}${timeStarted}`;
    };
  
    return (
      <div>
        <h2>Timer: {formatTime(seconds)}</h2>
      </div>
    );
  };

export default Timer;