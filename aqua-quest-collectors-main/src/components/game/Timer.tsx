import { useState, useEffect } from "react";

const Timer = () => {
    const [seconds, setSeconds] = useState(0);
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
  
      return () => clearInterval(intervalId);
    }, []);
  
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const timeStarted = time % 60;
      return `${minutes < 10 ? '0' : ''}${minutes}:${timeStarted < 10 ? '0' : ''}${timeStarted}`;
    };
  
    return (
      <div>
        <h1>{formatTime(seconds)}</h1>
      </div>
    );
  };

export default Timer;