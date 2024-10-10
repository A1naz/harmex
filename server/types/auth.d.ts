// auth.d.ts
declare module '#auth-utils' {
  interface User {
    uuid: string
    phoneNumber: string
    acesses: string[]
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {}
