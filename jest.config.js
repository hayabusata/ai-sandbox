const nextJest = require('next/jest')

// next/jestの実行環境情報を引数に渡す
const createJestConfig = nextJest({
  // Next.jsアプリのルートディレクトリを指定
  dir: './',
})

// Jestのカスタム設定
const customJestConfig = {
  // testEnvironmentにjsdomを指定
  testEnvironment: 'jest-environment-jsdom',
  // TypeScriptのファイル拡張子をテスト対象に含める
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // `ts-jest` を使用してTypeScriptをトランスパイル
  // Next.js v12以降、SWCがデフォルトで使われるため、`ts-jest`は不要な場合がある。
  // `next/jest` がSWCを適切に設定してくれる。
  // preset: 'ts-jest', // next/jest を使う場合は不要になることが多い

  // `moduleNameMapper` でCSS Modulesや静的ファイルなどをモック
  moduleNameMapper: {
      // CSS Modulesのモック (一時的にコメントアウト)
      // '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      // 画像ファイルなどの静的ファイルのモック (一時的にコメントアウト)
      // '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    // Next.jsのパスエイリアス (`@/components/*` など) の設定
    // tsconfig.json の paths と合わせる
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js|jsx)',
    '**/?(*.)+(spec|test).(ts|tsx|js|jsx)'
  ],
  // setupFilesAfterEnv でテスト環境のセットアップファイル指定 (例: @testing-library/jest-dom の拡張)
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // ts-jest の設定 (next/jest を使う場合は通常不要)
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.jest.json', // テスト用のtsconfigを指定する場合
  //   },
  // },

  // transformIgnorePatternsでnode_modules内のトランスパイル対象外を指定
  // Next.jsプロジェクトでは、一部のES Modules形式のライブラリをトランスパイルする必要がある場合がある
  transformIgnorePatterns: [
    '/node_modules/(?!some-es-module-library)/', // 例
  ],

  // collectCoverageでカバレッジ収集を有効にするか
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8', // または 'babel'
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts', // 型定義ファイルは除外
    '!src/**/index.ts', // indexファイルを除外する場合
    '!src/pages/_app.tsx', // Next.jsの特殊ファイルを除外
    '!src/pages/_document.tsx',
  ],
}

// createJestConfigを実行して、Next.jsのデフォルト設定とカスタム設定をマージ
module.exports = createJestConfig(customJestConfig)
