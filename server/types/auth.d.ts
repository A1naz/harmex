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
    orgInn: string | undefined
    orgName: string | undefined
    ffEnabled: boolean
    orgIP: string | undefined
    docName: string | undefined
    docType: string | undefined
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {}
