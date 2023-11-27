import { defineStore } from 'pinia'
import { Account } from '~/data/types'

export interface ISearchQueryChange {
  value: string
  queryIndex: number
  productIndex: number
}

export const useAccountStore = defineStore('account', {
  state: () => ({
    accounts: [] as Account[],
  }),
  persist: {
    storage: persistedState.localStorage,
  },
  actions: {
    setAccount(username: string, sessionToken: string) {
      let counter = 0
      if (username && sessionToken) {
        this.accounts.forEach((account) => {
          if (account.username === username) {
            account.sessionToken = sessionToken
            counter++
          }
        })
        if (counter === 0) {
          this.accounts.push({ username, sessionToken })
        }
      }
    },
  },
})
