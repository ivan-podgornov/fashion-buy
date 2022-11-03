// jest.config.ts
import type { InitialOptionsTsJest } from 'ts-jest'

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      // ts-jest configuration goes here
    },
  },
}

// eslint-disable-next-line import/no-default-export
export default config
