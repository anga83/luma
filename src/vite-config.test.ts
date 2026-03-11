import { describe, expect, it } from 'vitest'

import { getBasePath } from '../vite.config'

describe('getBasePath', () => {
  it('uses the repository path when building on GitHub Actions', () => {
    expect(getBasePath('true', 'anga83/luma')).toBe('/luma/')
  })

  it('falls back to the root path outside GitHub Actions', () => {
    expect(getBasePath('false', 'anga83/luma')).toBe('/')
    expect(getBasePath('', '')).toBe('/')
  })
})
