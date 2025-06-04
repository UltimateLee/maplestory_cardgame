import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';

const TimerContainer = styled.div`
  font-size: 1.5rem;
  color: #4834d4;
  font-weight: bold;
`;

function Timer({ isRunning, onTimeUpdate }) {
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      // 이전 타이머가 있다면 정리
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const startTime = Date.now() - (time * 1000);
      
      timerRef.current = setInterval(() => {
        const currentTime = Math.floor((Date.now() - startTime) / 1000);
        
        // 마지막 업데이트와 현재 시간이 다를 때만 업데이트
        if (currentTime !== lastUpdateRef.current) {
          setTime(currentTime);
          onTimeUpdate(currentTime);
          lastUpdateRef.current = currentTime;
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      // 타이머 정지 시 인터벌 정리
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRunning, onTimeUpdate]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 타이머 리셋
  useEffect(() => {
    if (!isRunning) {
      setTime(0);
      lastUpdateRef.current = 0;
    }
  }, [isRunning]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <TimerContainer>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </TimerContainer>
  );
}

export default Timer; 