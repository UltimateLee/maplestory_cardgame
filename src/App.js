import React, { useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import DifficultySelector from './components/DifficultySelector';
import GameBoard from './components/GameBoard';
import Timer from './components/Timer';
import Ranking from './components/Ranking';
import GameCompleteModal from './components/GameCompleteModal';
import { saveRanking } from './utils/rankingUtils';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
  color: #2d3436;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
`;

const CreatorInfo = styled.div`
  position: fixed;
  left: 15px;
  bottom: 15px;
  font-size: 0.9rem;
  color: #4834d4;
  opacity: 0.8;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
  z-index: 10;
  font-weight: 500;
`;

const GameHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 15px;
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex: 1;
  padding: 0;
  max-height: calc(100vh - 120px);
  position: relative;
  
  @media (max-width: 768px) {
    max-height: none;
    padding-bottom: 20px;
  }
`;

const Title = styled.h1`
  font-size: clamp(1.2rem, 3vw, 2rem);
  color: #4834d4;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin: 0;
  padding: 0;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  gap: 10px;

  img {
    height: 40px;
    width: auto;
    object-fit: contain;
  }
`;

const TimerWrapper = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RankingWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [time, setTime] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [finalTime, setFinalTime] = useState(0);
  const lastTimeRef = useRef(0);
  const gameCompletionRef = useRef(false);

  const handleTimeUpdate = useCallback((newTime) => {
    if (newTime !== lastTimeRef.current) {
      setTime(newTime);
      lastTimeRef.current = newTime;
    }
  }, []);

  const handleDifficultySelect = (cardCount) => {
    setDifficulty(cardCount);
    setGameStarted(true);
    setGameCompleted(false);
    setTime(0);
    setFinalTime(0);
    setNickname('');
    setShowModal(false);
    gameCompletionRef.current = false;
    lastTimeRef.current = 0;
  };

  const handleGameComplete = (finalTime) => {
    if (gameCompletionRef.current || typeof finalTime !== 'number' || isNaN(finalTime)) {
      return;
    }

    gameCompletionRef.current = true;
    setGameCompleted(true);
    setFinalTime(finalTime);
    setShowModal(true);
  };

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameCompleted(false);
    setDifficulty(null);
    setTime(0);
    setFinalTime(0);
    setNickname('');
    gameCompletionRef.current = false;
    lastTimeRef.current = 0;
  }, []);

  const handleNicknameSubmit = async (name) => {
    if (!name || !name.trim() || !finalTime || isNaN(finalTime) || !gameCompleted) {
      return;
    }

    const trimmedNickname = name.trim();

    try {
      await saveRanking(difficulty, trimmedNickname, finalTime);
      setNickname(trimmedNickname);
      setShowModal(false);
      setTimeout(resetGame, 2000);
    } catch (error) {
      console.error('랭킹 저장 중 오류 발생:', error);
      alert(error.message);
      resetGame();
    }
  };

  const handleCloseModal = () => {
    if (!gameCompletionRef.current) {
      setShowModal(false);
      if (gameCompleted && nickname) {
        setTimeout(resetGame, 1000);
      }
    }
  };

  return (
    <AppContainer>
      <GameHeader>
        <Title>
          <img src="/images/Mob_Orange_Mushroom.webp" alt="Orange Mushroom" />
          메이플스토리 카드 매칭 게임
        </Title>
        {gameStarted && (
          <TimerWrapper>
            <Timer 
              isRunning={!gameCompleted} 
              onTimeUpdate={handleTimeUpdate}
            />
          </TimerWrapper>
        )}
      </GameHeader>
      {!gameStarted ? (
        <DifficultySelector onSelect={handleDifficultySelect} />
      ) : (
        <GameContainer>
          <GameBoard 
            cardCount={difficulty} 
            onGameComplete={() => handleGameComplete(time)}
          />
          {nickname && (
            <RankingWrapper>
              <Ranking 
                time={finalTime} 
                difficulty={difficulty} 
                nickname={nickname} 
              />
            </RankingWrapper>
          )}
        </GameContainer>
      )}
      <GameCompleteModal
        isOpen={showModal}
        onClose={handleCloseModal}
        time={finalTime}
        onSubmit={handleNicknameSubmit}
      />
      <CreatorInfo>Made by 이형진</CreatorInfo>
    </AppContainer>
  );
}

export default App;
