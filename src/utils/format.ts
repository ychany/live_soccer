// 날짜/시간 포맷 유틸리티

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

export function formatMatchTime(elapsed: number | null, status: string): string {
  if (status === 'HT') return 'HT';
  if (status === 'FT') return 'FT';
  if (status === 'AET') return 'AET';
  if (status === 'PEN') return 'PEN';
  if (status === 'NS') return '-';
  if (elapsed === null) return '-';
  return `${elapsed}'`;
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 0) {
    return '진행 중';
  }
  if (diffMins < 60) {
    return `${diffMins}분 후`;
  }
  if (diffHours < 24) {
    return `${diffHours}시간 후`;
  }
  if (diffDays < 7) {
    return `${diffDays}일 후`;
  }
  return formatDate(dateString);
}

// 폼 문자열 파싱 (WWDLW -> ['W', 'W', 'D', 'L', 'W'])
export function parseForm(form: string | null): string[] {
  if (!form) return [];
  return form.split('');
}

// 폼 결과별 색상
export function getFormColor(result: string): string {
  switch (result) {
    case 'W':
      return '#10B981'; // green
    case 'D':
      return '#6B7280'; // gray
    case 'L':
      return '#EF4444'; // red
    default:
      return '#6B7280';
  }
}

// 경기 상태 텍스트
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    TBD: '미정',
    NS: '예정',
    '1H': '전반전',
    HT: '하프타임',
    '2H': '후반전',
    ET: '연장전',
    BT: '휴식',
    P: '승부차기',
    SUSP: '중단',
    INT: '중단',
    FT: '종료',
    AET: '연장 종료',
    PEN: '승부차기 종료',
    PST: '연기',
    CANC: '취소',
    ABD: '중단',
    AWD: '몰수',
    WO: '부전승',
  };
  return statusMap[status] || status;
}

// 숫자 포맷 (1000 -> 1,000)
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('ko-KR');
}

// 퍼센트 포맷 (0.75 -> 75%)
export function formatPercent(value: number | string | null): string {
  if (value === null) return '-';
  if (typeof value === 'string') {
    return value.includes('%') ? value : `${value}%`;
  }
  return `${Math.round(value * 100)}%`;
}

// 선수 포지션 한글 변환
export function getPositionText(position: string): string {
  const positionMap: Record<string, string> = {
    G: 'GK',
    D: 'DF',
    M: 'MF',
    F: 'FW',
    Goalkeeper: 'GK',
    Defender: 'DF',
    Midfielder: 'MF',
    Attacker: 'FW',
  };
  return positionMap[position] || position;
}

// 키/몸무게 포맷
export function formatHeight(height: string | null): string {
  if (!height) return '-';
  return height;
}

export function formatWeight(weight: string | null): string {
  if (!weight) return '-';
  return weight;
}
