
export interface IUser {
    isBanned: boolean,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    wbApiKey: string,
    wbApiKeys: [],
    password: string,
    uuid: string,
    uuidCompany: string,
    acesses: MenuAcesses[],
    roles: string,
    tabs: string,
    newEmail: string,
    emailConfirmed: string,
    telegram: string,
    telegramUserId: string,
    telegramUnlinkEmailSend: Date,
    tg2fa: boolean,
    balance: number,
    registrationDate: Date,
    partner: Partner
}

export interface MenuAcesses {
    id: number, 
    items: number[]
}

export interface Partner{
    balance: number,
    refCount: number,
    rewardPercent: number,
}
