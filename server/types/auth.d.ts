// auth.d.ts
declare module '#auth-utils' {
  interface User {
    uuid: string
    email: string
    emailConfirmed: boolean
    isTwoFaEnabled: boolean
    phoneNumber: string
    acesses: string[]
    username: string | undefined
    balance: number
    fizFace: boolean
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {}
