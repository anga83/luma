import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export function getBasePath(
  githubActions = process.env.GITHUB_ACTIONS,
  githubRepository = process.env.GITHUB_REPOSITORY,
) {
  if (githubActions === 'true' && githubRepository) {
    const [, repo] = githubRepository.split('/')
    if (repo) {
      return `/${repo}/`
    }
  }

  return '/'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
})
