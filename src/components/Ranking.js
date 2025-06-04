import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { getRankings } from '../utils/rankingUtils';

const RankingContainer = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  width: 100%;
  max-width: 400px;
`;

const RankingTitle = styled.h2`
  color: #ffd700;
  text-align: center;
  margin-bottom: 15px;
`;

const RankingList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RankingItem = styled(motion.li)`
  display: grid;
  grid-template-columns: 30px 1fr 80px;
  gap: 10px;
  padding: 10px;
  margin: 5px 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  color: white;
  align-items: center;

  &.current {
    background: rgba(76, 175, 80, 0.3);
    border: 1px solid #4CAF50;
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

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}분${remainingSeconds}초`;
};

function Ranking({ difficulty, time, nickname }) {
  const [rankings, setRankings] = useState([]);
  const [currentRank, setCurrentRank] = useState(null);

  // 랭킹 데이터 로드 및 현재 순위 계산
  useEffect(() => {
    const loadRankings = () => {
      const currentRankings = getRankings(difficulty);
      setRankings(currentRankings);

      // 현재 기록의 순위 찾기
      if (time && nickname) {
        const rank = currentRankings.findIndex(r => 
          r.time === time && r.nickname === nickname
        ) + 1;
        setCurrentRank(rank);
      }
    };

    loadRankings();
    const intervalId = setInterval(loadRankings, 1000);
    
    return () => clearInterval(intervalId);
  }, [difficulty, time, nickname]);

  return (
    <RankingContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RankingTitle>🏆 랭킹</RankingTitle>
      <RankingList>
        {rankings.map((ranking, index) => (
          <RankingItem
            key={`${ranking.nickname}-${ranking.time}-${ranking.date}`}
            className={index + 1 === currentRank ? 'current' : ''}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span>{index + 1}위</span>
            <Nickname>{ranking.nickname || '익명'}</Nickname>
            <TimeSpan>{formatTime(ranking.time)}</TimeSpan>
          </RankingItem>
        ))}
      </RankingList>
    </RankingContainer>
  );
}

export default Ranking; 