import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #4834d4;
  margin-bottom: 20px;
`;

const TimeDisplay = styled.p`
  font-size: 1.5rem;
  color: #2d3436;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 2px solid #4834d4;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: #686de0;
    box-shadow: 0 0 0 2px rgba(104, 109, 224, 0.2);
  }
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #6c5ce7 0%, #a363d9 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function GameCompleteModal({ isOpen, onClose, time, onSubmit }) {
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAttemptRef = useRef(false);
  const modalRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setNickname('');
      setIsSubmitting(false);
      submitAttemptRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    // ESC 키로 모달 닫기 방지
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSubmitting) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 이미 제출 시도했거나 제출 중이면 무시
    if (submitAttemptRef.current || isSubmitting) {
      return;
    }

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      return;
    }

    // 폼 재제출 방지
    if (formRef.current) {
      formRef.current.setAttribute('disabled', 'true');
    }

    setIsSubmitting(true);
    submitAttemptRef.current = true;

    try {
      // 제출 버튼 더블 클릭 방지
      const submitButton = formRef.current?.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
      }

      await onSubmit(trimmedNickname);
    } catch (error) {
      console.error('닉네임 제출 중 오류 발생:', error);
      setIsSubmitting(false);
      submitAttemptRef.current = false;
      
      // 에러 발생 시 폼 재활성화
      if (formRef.current) {
        formRef.current.removeAttribute('disabled');
        const submitButton = formRef.current.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current && !isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          ref={modalRef}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <Title>게임 완료! 🎉</Title>
            <TimeDisplay>클리어 시간: {formatTime(time)}</TimeDisplay>
            <form ref={formRef} onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={10}
                disabled={isSubmitting}
                autoComplete="off"
              />
              <Button
                type="submit"
                disabled={!nickname.trim() || isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? '등록 중...' : '등록하기'}
              </Button>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}

export default GameCompleteModal; 