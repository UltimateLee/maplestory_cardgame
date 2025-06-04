import React, { useState, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  padding: 0 10px;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: calc(100vh - 100px);
  -webkit-overflow-scrolling: touch;
`;

const Title = styled.h2`
  color: #4834d4;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  text-align: center;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const DifficultyCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 150px;

  @media (max-width: 480px) {
    min-height: auto;
    padding: 12px;
  }
`;

const DifficultyButton = styled(motion.button)`
  padding: 12px 20px;
  font-size: clamp(1rem, 3vw, 1.2rem);
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6c5ce7 0%, #a363d9 100%);
  color: white;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: linear-gradient(135deg, #a363d9 0%, #6c5ce7 100%);
  }

  @media (max-width: 480px) {
    padding: 10px 15px;
  }
`;

const RankingPreview = styled.div`
  margin-top: 5px;
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const RankingTitle = styled.h3`
  color: #4834d4;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ExpandButton = styled(motion.button)`
  background: none;
  border: none;
  color: #4834d4;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
    transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
  
  &:hover {
    opacity: 0.8;
  }
`;

const RankingList = styled(motion.ul)`
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  max-height: ${props => props.isExpanded ? '200px' : '108px'};
  -webkit-overflow-scrolling: touch;
`;

const RankingItem = styled.li`
  display: grid;
  grid-template-columns: 30px 1fr 80px;
  gap: 8px;
  padding: 6px;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: #2d3436;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 480px) {
    padding: 5px;
    gap: 5px;
  }
`;

const Nickname = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TimeSpan = styled.span`
  white-space: nowrap;
  text-align: right;
`;

const difficulties = [
  { name: "초보자", value: 8, size: "2x4" },
  { name: "중급자", value: 12, size: "3x4" },
  { name: "상급자", value: 16, size: "4x4" },
  { name: "전문가", value: 20, size: "4x5" },
  { name: "마스터", value: 24, size: "4x6" }
];

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}분${remainingSeconds}초`;
};

function DifficultySelector({ onSelect }) {
  const [previewRankings, setPreviewRankings] = useState({});
  const [expandedDifficulties, setExpandedDifficulties] = useState({});

  const loadRankings = useCallback(() => {
    const rankings = {};
    difficulties.forEach(diff => {
      const savedRankings = JSON.parse(localStorage.getItem(`rankings-${diff.value}`)) || [];
      rankings[diff.value] = savedRankings;
    });
    setPreviewRankings(rankings);
  }, []);

  // 컴포넌트 마운트와 포커스 시 랭킹 데이터 로드
  useEffect(() => {
    loadRankings();

    // 윈도우 포커스 시 랭킹 새로고침
    const handleFocus = () => {
      loadRankings();
    };

    window.addEventListener('focus', handleFocus);
    
    // 1초마다 랭킹 새로고침
    const intervalId = setInterval(loadRankings, 1000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [loadRankings]);

  const toggleExpand = (difficultyValue) => {
    setExpandedDifficulties(prev => ({
      ...prev,
      [difficultyValue]: !prev[difficultyValue]
    }));
  };

  const ChevronIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  return (
    <Container>
      <Title>난이도를 선택하세요</Title>
      <Grid>
        {difficulties.map((diff, index) => (
          <DifficultyCard
            key={diff.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <DifficultyButton
              onClick={() => onSelect(diff.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {diff.name} ({diff.size})
            </DifficultyButton>
            <RankingPreview>
              <RankingTitle>
                🏆 최고 기록
                {previewRankings[diff.value]?.length > 3 && (
                  <ExpandButton
                    onClick={() => toggleExpand(diff.value)}
                    isExpanded={expandedDifficulties[diff.value]}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronIcon />
                  </ExpandButton>
                )}
              </RankingTitle>
              <RankingList
                animate={{ 
                  height: expandedDifficulties[diff.value] 
                    ? 'auto' 
                    : previewRankings[diff.value]?.length > 0 
                      ? '108px' // 3개 항목의 높이 (36px * 3)
                      : '36px'  // 1개 항목의 높이
                }}
                transition={{ duration: 0.3 }}
              >
                {previewRankings[diff.value]?.length > 0 ? (
                  previewRankings[diff.value]
                    .slice(0, expandedDifficulties[diff.value] ? undefined : 3)
                    .map((ranking, index) => (
                      <RankingItem key={ranking.date}>
                        <span>{index + 1}위</span>
                        <Nickname>{ranking.nickname || '익명'}</Nickname>
                        <TimeSpan>{formatTime(ranking.time)}</TimeSpan>
                      </RankingItem>
                    ))
                ) : (
                  <RankingItem>
                    <span>-</span>
                    <span>기록 없음</span>
                    <span>-</span>
                  </RankingItem>
                )}
              </RankingList>
            </RankingPreview>
          </DifficultyCard>
        ))}
      </Grid>
    </Container>
  );
}

export default DifficultySelector; 