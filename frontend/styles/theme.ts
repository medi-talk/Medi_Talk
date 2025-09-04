export const COLORS = {
  primary: '#5B86E5',
  white: '#FFFFFF',
  lightGray: '#F5F5F7',
  gray: '#A9A9A9',
  darkGray: '#555555',
  danger: '#FF6B6B',
};

/**앱 크기 전체 크기 정의 
 */
export const SIZES = {
  base: 8,
  padding: 24,
  radius: 12,
  h1: 30,
  h2: 22,
  h3: 16,
  p: 16,
};

/**
  앱 스타일 추가
 */
export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold', lineHeight: 36 },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold', lineHeight: 30 },
  h3: { fontSize: SIZES.h3, fontWeight: 'bold', lineHeight: 22 },
  p: { fontSize: SIZES.p, lineHeight: 24 },
} as const;