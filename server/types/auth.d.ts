// auth.d.ts
declare module '#auth-utils' {
  interface User {
    uuid: string
    phoneNumber: string
    email: string
    emailConfirmed: boolean
    isTwoFaEnabled: boolean
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {}
