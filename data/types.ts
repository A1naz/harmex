import { MenuSection } from "./menu/types"

export interface StateMain {
    client: Client,
    dodge: boolean,
    theme: string,
    pickpoints: any[],
    selectedItem: number | null,
    drawerOpened: boolean | null,
    infoModal: boolean,
    infoType: string,
    faqModal: boolean,
}

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

export interface Client extends Pick<
    IUser, 
    "email" | "username" | "uuid" | "telegram" | "balance" | 
    "firstName" | "lastName" | "telegramUserId" | "wbApiKeys" | 
    "partner" | "isBanned"
    > {
        hasPassword: boolean,
        mmenuItems: MenuSection[],
        allowedPathes: string[]
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
