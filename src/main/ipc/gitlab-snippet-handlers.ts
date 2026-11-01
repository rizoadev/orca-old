import { ipcMain } from 'electron'
import type { Store } from '../persistence'
import {
  createProjectSnippet,
  deleteProjectSnippet,
  getProjectSnippet,
  listProjectSnippets,
  updateProjectSnippet
} from '../gitlab/client'
import { normalizeGitLabPositiveInteger } from '../gitlab/gitlab-preload-args'
import type { GitLabRepoSelectorArgs } from './gitlab-repo-access'
import { assertRegisteredRepo, localGitOptionArgs, repoConnectionId } from './gitlab-repo-access'

export function registerGitLabSnippetHandlers(store: Store): void {
  ipcMain.handle(
    'gitlab:listProjectSnippets',
    async (
      _event,
      args: GitLabRepoSelectorArgs & {
        limit?: number
      }
    ) => {
      const repo = assertRegisteredRepo(args, store)
      return listProjectSnippets(
        repo.path,
        normalizeGitLabPositiveInteger(args.limit, 50, 100),
        repo.issueSourcePreference,
        repoConnectionId(repo),
        ...localGitOptionArgs(store, repo)
      )
    }
  )

  ipcMain.handle(
    'gitlab:getProjectSnippet',
    async (
      _event,
      args: GitLabRepoSelectorArgs & {
        snippetId: number
      }
    ) => {
      const repo = assertRegisteredRepo(args, store)
      return getProjectSnippet(
        repo.path,
        normalizeGitLabPositiveInteger(args.snippetId, 1, Number.MAX_SAFE_INTEGER),
        repo.issueSourcePreference,
        repoConnectionId(repo),
        ...localGitOptionArgs(store, repo)
      )
    }
  )

  ipcMain.handle(
    'gitlab:createProjectSnippet',
    async (
      _event,
      args: GitLabRepoSelectorArgs & {
        title: string
        fileName: string
        content: string
        description?: string
        visibility?: 'private' | 'internal' | 'public'
      }
    ) => {
      const repo = assertRegisteredRepo(args, store)
      return createProjectSnippet(
        repo.path,
        {
          title: args.title,
          fileName: args.fileName,
          content: args.content,
          description: args.description,
          visibility: args.visibility
        },
        repo.issueSourcePreference,
        repoConnectionId(repo),
        ...localGitOptionArgs(store, repo)
      )
    }
  )

  ipcMain.handle(
    'gitlab:updateProjectSnippet',
    async (
      _event,
      args: GitLabRepoSelectorArgs & {
        snippetId: number
        updates: {
          title?: string
          fileName?: string
          content?: string
          description?: string
          visibility?: 'private' | 'internal' | 'public'
        }
      }
    ) => {
      const repo = assertRegisteredRepo(args, store)
      return updateProjectSnippet(
        repo.path,
        normalizeGitLabPositiveInteger(args.snippetId, 1, Number.MAX_SAFE_INTEGER),
        args.updates ?? {},
        repo.issueSourcePreference,
        repoConnectionId(repo),
        ...localGitOptionArgs(store, repo)
      )
    }
  )

  ipcMain.handle(
    'gitlab:deleteProjectSnippet',
    async (
      _event,
      args: GitLabRepoSelectorArgs & {
        snippetId: number
      }
    ) => {
      const repo = assertRegisteredRepo(args, store)
      return deleteProjectSnippet(
        repo.path,
        normalizeGitLabPositiveInteger(args.snippetId, 1, Number.MAX_SAFE_INTEGER),
        repo.issueSourcePreference,
        repoConnectionId(repo),
        ...localGitOptionArgs(store, repo)
      )
    }
  )
}
