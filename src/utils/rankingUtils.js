// 랭킹 저장을 위한 락 메커니즘
const LOCK_KEY = 'ranking_lock';
const LOCK_TIMEOUT = 5000; // 5초

const acquireLock = async () => {
  return new Promise((resolve, reject) => {
    const currentTime = Date.now();
    const lockData = localStorage.getItem(LOCK_KEY);
    
    if (lockData) {
      const { timestamp } = JSON.parse(lockData);
      if (currentTime - timestamp < LOCK_TIMEOUT) {
        reject(new Error('이미 처리 중입니다.'));
        return;
      }
    }
    
    localStorage.setItem(LOCK_KEY, JSON.stringify({ timestamp: currentTime }));
    resolve();
  });
};

const releaseLock = () => {
  localStorage.removeItem(LOCK_KEY);
};

const checkDuplicate = (rankings, nickname, time, currentTime) => {
  return rankings.some(rank => {
    // 정확히 같은 기록 체크
    if (rank.time === time && rank.nickname === nickname) {
      return true;
    }
    
    // 매우 근접한 시간대의 같은 닉네임 기록 체크 (3초 이내)
    const rankDate = new Date(rank.date);
    const newDate = new Date(currentTime);
    const timeDiff = Math.abs(rankDate.getTime() - newDate.getTime());
    return rank.nickname === nickname && timeDiff < 3000;
  });
};

export const saveRanking = async (difficulty, nickname, time) => {
  if (!difficulty || !nickname || typeof time !== 'number' || isNaN(time)) {
    throw new Error('잘못된 입력값입니다.');
  }

  try {
    await acquireLock();

    const storageKey = `rankings-${difficulty}`;
    const currentTime = new Date().toISOString();
    
    // 기존 랭킹 로드
    const savedRankings = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    // 중복 체크
    if (checkDuplicate(savedRankings, nickname, time, currentTime)) {
      releaseLock();
      throw new Error('이미 등록된 기록입니다.');
    }

    // 새 랭킹 추가
    const newRanking = {
      nickname: nickname.trim(),
      time,
      date: currentTime
    };

    // 중복 제거를 위한 키 생성 함수
    const generateKey = (item) => `${item.nickname}-${item.time}-${item.date}`;
    
    // Set을 사용한 중복 제거
    const uniqueRankings = Array.from(
      new Set([...savedRankings, newRanking].map(item => JSON.stringify(item)))
    )
      .map(str => JSON.parse(str))
      .sort((a, b) => a.time - b.time)
      .slice(0, 10);

    // 저장
    localStorage.setItem(storageKey, JSON.stringify(uniqueRankings));
    
    releaseLock();
    return true;
  } catch (error) {
    releaseLock();
    throw error;
  }
};

export const getRankings = (difficulty) => {
  try {
    const rankingKey = `rankings-${difficulty}`;
    return JSON.parse(localStorage.getItem(rankingKey)) || [];
  } catch {
    return [];
  }
}; 