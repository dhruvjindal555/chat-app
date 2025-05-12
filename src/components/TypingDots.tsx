import React, { useEffect, useState } from 'react';

const TypingDots = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500); // adjust the speed here

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-sm text-green-500 truncate">
      typing{dots}
    </div>
  );
};

export default TypingDots;
