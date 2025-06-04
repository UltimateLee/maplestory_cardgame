import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';

const Board = styled.div`
  display: grid;
  gap: 5px;
  width: min(80vh, 80vw);
  margin: 0 auto;
  padding: 5px;
  height: min-content;
  aspect-ratio: ${props => {
    switch(props.cardCount) {
      case 8: return '2/1';   // 2행 4열
      case 12: return '4/3';  // 3행 4열
      case 16: return '1/1';  // 4행 4열
      case 20: return '5/4';  // 4행 5열
      case 24: return '3/2';  // 4행 6열
      default: return '1/1';
    }
  }};

  @media (max-width: 768px) {
    width: 95vw;
    gap: 8px;
    padding: 8px;
  }
`;

const Card = styled(motion.div)`
  width: 100%;
  position: relative;
  cursor: pointer;
  perspective: 1000px;

  &:before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  @media (max-width: 768px) {
    &:before {
      padding-top: 100%; /* 정사각형 비율 유지 */
    }
  }
`;

const CardInner = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const CardFront = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: linear-gradient(135deg, #6c5ce7 0%, #a363d9 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: white;

  @media (max-width: 768px) {
    border-radius: 8px;
    font-size: clamp(1.5rem, 5vw, 2.2rem);
  }
`;

const CardBack = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;

  img {
    width: 80%;
    height: 80%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    border-radius: 8px;
    padding: 8px;

    img {
      width: 85%;
      height: 85%;
    }
  }
`;

// 메이플스토리 몬스터 이미지 배열
const monsterImages = [
  '/images/Mob_Lotus_29.webp',
  '/images/Mob_Damien_29.webp',
  '/images/Mob_Will_29.webp',
  '/images/Mob_Lucid.webp',
  '/images/Mob_Black_Mage.webp',
  '/images/Mob_Verus_Hilla.webp',
  '/images/Mob_Von_Leon.webp',
  '/images/Mob_Magnus.webp',
  '/images/Mob_Arkarium.webp',
  '/images/Mob_Stump.webp',
  '/images/Mob_Mushmom.webp',
  '/images/Mob_Jr._Boogie.webp',
  '/images/Mob_Octopus.webp',
  '/images/Mob_Pink_Bean.webp',
  '/images/Mob_Red_Snail.webp',
  '/images/Mob_Pig.webp',
  '/images/Mob_Yeti.webp',
  '/images/Mob_Orange_Mushroom.webp',
  '/images/Full_Mob_Horntail.webp',
  '/images/Mob_Zakum.webp',
  '/images/Full_Mob_Balrog.webp',
  '/images/Mob_Papulatus_Clock.webp',
  '/images/Mob_Cygnus.webp',
  '/images/Mob_Guard_Captain_Darknell.webp',
  '/images/Mob_Giant_Monster_Gloom.webp',
  '/images/Mob_Guardian_Angel_Slime.webp',
  '/images/Mob_Kalos_the_Guardian_29.webp',
  '/images/Mob_Chosen_Seren_29.webp',
  '/images/Mob_Kaling.webp',
  '/images/Mob_Bad_Brawler.webp',
  '/images/Mob_Rampant_Cyborg.webp',
  '/images/Mob_Vicious_Hunter.webp',
  '/images/Mob_Mad_Mage.webp',
  '/images/Mob_Black_Knight.webp'
];

// 그리드 레이아웃 설정 함수
const getGridLayout = (count) => {
  switch(count) {
    case 8:
      return "repeat(2, 1fr) / repeat(4, 1fr)"; // 2행 4열
    case 12:
      return "repeat(3, 1fr) / repeat(4, 1fr)"; // 3행 4열
    case 16:
      return "repeat(4, 1fr) / repeat(4, 1fr)"; // 4행 4열
    case 20:
      return "repeat(4, 1fr) / repeat(5, 1fr)"; // 4행 5열
    case 24:
      return "repeat(4, 1fr) / repeat(6, 1fr)"; // 4행 6열
    default:
      return "repeat(4, 1fr) / repeat(4, 1fr)";
  }
};

const difficulties = {
  8: { rows: 2, cols: 4 },   // 2x4
  12: { rows: 3, cols: 4 },  // 3x4
  16: { rows: 4, cols: 4 },  // 4x4
  20: { rows: 4, cols: 5 },  // 4x5
  24: { rows: 4, cols: 6 }   // 4x6
};

function GameBoard({ cardCount, onGameComplete }) {
  const [cards, setCards] = useState([]);
  const [flippedIndexes, setFlippedIndexes] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [hasGameCompleted, setHasGameCompleted] = useState(false);
  const gameCompletionRef = useRef(false);

  // Fisher-Yates 셔플 알고리즘 구현
  const shuffleArray = (array) => {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  // 인접한 카드가 같은 쌍이 되지 않도록 확인
  const validateShuffle = (cards) => {
    const layout = difficulties[cardCount] || { rows: 4, cols: 4 };
    const { rows, cols } = layout;

    for (let i = 0; i < cards.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      // 주변 카드 인덱스 계산
      const neighbors = [];
      if (row > 0) neighbors.push(i - cols);           // 위
      if (row < rows - 1) neighbors.push(i + cols);    // 아래
      if (col > 0) neighbors.push(i - 1);              // 왼쪽
      if (col < cols - 1) neighbors.push(i + 1);       // 오른쪽

      // 인접한 카드 중 같은 이미지가 있는지 확인
      const hasAdjacentMatch = neighbors.some(
        idx => idx >= 0 && idx < cards.length && cards[i].image === cards[idx]?.image
      );

      if (hasAdjacentMatch) return false;
    }
    return true;
  };

  // 게임 초기화
  useEffect(() => {
    const initializeGame = () => {
      const shuffledMonsters = shuffleArray([...monsterImages]);
      const selectedMonsters = shuffledMonsters.slice(0, cardCount / 2);
      
      const cardPairs = [...selectedMonsters, ...selectedMonsters].map((monster, index) => ({
        id: index,
        image: monster,
        isFlipped: false,
        isMatched: false,
      }));

      let attempts = 0;
      let shuffledCards;
      do {
        shuffledCards = shuffleArray([...cardPairs]);
        attempts++;
      } while (!validateShuffle(shuffledCards) && attempts < 10);

      setCards(shuffledCards);
      setFlippedIndexes([]);
      setMatchedPairs([]);
      setHasGameCompleted(false);
      gameCompletionRef.current = false;
    };

    initializeGame();
  }, [cardCount]);

  // 게임 완료 체크
  useEffect(() => {
    const checkGameCompletion = () => {
      if (!hasGameCompleted && 
          !gameCompletionRef.current && 
          matchedPairs.length === cardCount / 2) {
        gameCompletionRef.current = true;
        setHasGameCompleted(true);
        onGameComplete();
      }
    };

    checkGameCompletion();
  }, [matchedPairs, cardCount, onGameComplete, hasGameCompleted]);

  const handleCardClick = (index) => {
    // 이미 완료된 게임이면 클릭 무시
    if (hasGameCompleted || gameCompletionRef.current) {
      return;
    }

    // 이미 뒤집힌 카드나 매치된 카드는 무시
    if (flippedIndexes.includes(index) || matchedPairs.includes(cards[index].image)) {
      return;
    }

    // 이미 2장이 뒤집혀 있으면 무시
    if (flippedIndexes.length === 2) {
      return;
    }

    const newFlippedIndexes = [...flippedIndexes, index];
    setFlippedIndexes(newFlippedIndexes);

    if (newFlippedIndexes.length === 2) {
      const [firstIndex, secondIndex] = newFlippedIndexes;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.image === secondCard.image) {
        setMatchedPairs(prev => [...prev, firstCard.image]);
        setFlippedIndexes([]);
      } else {
        setTimeout(() => {
          setFlippedIndexes([]);
        }, 1000);
      }
    }
  };

  return (
    <Board 
      style={{ gridTemplate: getGridLayout(cardCount) }}
      cardCount={cardCount}
    >
      {cards.map((card, index) => (
        <Card
          key={card.id}
          onClick={() => handleCardClick(index)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CardInner
            animate={{
              rotateY: flippedIndexes.includes(index) || matchedPairs.includes(card.image) ? 180 : 0
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <CardFront>?</CardFront>
            <CardBack>
              <img src={card.image} alt="monster" />
            </CardBack>
          </CardInner>
        </Card>
      ))}
    </Board>
  );
}

export default GameBoard; 