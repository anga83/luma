import { describe, expect, it } from 'vitest'

import { getBasePath } from '../vite.config'

describe('getBasePath', () => {
  it('uses the repository path when building on GitHub Actions', () => {
    expect(
      getBasePath({ githubActions: 'true', githubRepository: 'anga83/luma' }),
    ).toBe('/luma/')
  })

  it('falls back to the root path outside GitHub Actions', () => {
    expect(
      getBasePath({ githubActions: 'false', githubRepository: 'anga83/luma' }),
    ).toBe('/')
    expect(getBasePath({ githubActions: '', githubRepository: '' })).toBe('/')
  })

  it('falls back to the root path for malformed repository values', () => {
    expect(
      getBasePath({ githubActions: 'true', githubRepository: 'owner/' }),
    ).toBe('/')
    expect(
      getBasePath({ githubActions: 'true', githubRepository: 'owner' }),
    ).toBe('/')
    expect(
      getBasePath({ githubActions: 'true', githubRepository: 'owner/repo/' }),
    ).toBe('/')
    expect(
      getBasePath({ githubActions: 'true', githubRepository: ' /repo' }),
    ).toBe('/')
    expect(getBasePath({ githubActions: 'true', githubRepository: undefined })).toBe(
      '/',
    )
  })
})
