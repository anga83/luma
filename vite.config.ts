import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

type BasePathOptions = {
  githubActions?: string
  githubRepository?: string
}

export function getBasePath(options?: BasePathOptions) {
  const resolvedGithubActions =
    options?.githubActions ?? (options ? undefined : process.env.GITHUB_ACTIONS)
  const resolvedGithubRepository =
    options?.githubRepository ??
    (options ? undefined : process.env.GITHUB_REPOSITORY)

  if (resolvedGithubActions === 'true' && resolvedGithubRepository) {
    const parts = resolvedGithubRepository.split('/')
    if (parts.length === 2) {
      const [owner, repo] = parts.map((part) => part.trim())
      if (owner && repo) {
        return `/${repo}/`
      }
    }
  }

  return '/'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
})
