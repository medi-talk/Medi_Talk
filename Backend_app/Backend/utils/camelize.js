// snake_case -> camelCase

const toCamel = s => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

// 단일 Row의 키를 camelCase로 변환
const camelizeRow = (row = {}) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [toCamel(k), v])
  );

// 복수 Row의 키를 camelCase로 변환
const camelizeRows = (rows = []) => rows.map(camelizeRow);


module.exports = { toCamel, camelizeRow, camelizeRows };