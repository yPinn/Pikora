/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 允許 PascalCase（對 React 組件友善）
    'subject-case': [0],
  },
};

export default config;
