import { useState, useEffect } from "react";

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // update every 1 second

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return <div className="text-base dark:text-white">{time.toLocaleTimeString()}</div>;
}

export default Clock;
