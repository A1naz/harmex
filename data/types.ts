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
    username: string | undefined,
    firstName: string,
    lastName: string,
    email: string,
    wbApiKey: string,
    wbApiKeys: [],
    password: string,
    uuid: string,
    uuidCompany: string,
    acesses: string[],
    roles: string,
    tabs: string,
    newEmail: string,
    emailConfirmed: string,
    telegram: string | undefined,
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
        allowedPathes: OptionsMulti[]
}

export interface Partner{
    balance: number,
    refCount: number,
    rewardPercent: number,
}

export interface OptionsMulti {
    value: any,
    name: string
}

export enum FieldsType {
    text = 'text',
    email = 'email',
    multiOptions = 'multiOptions',
    password = 'password'
}

export interface ConfigModal {
    field: string, 
    header: string, 
    type: FieldsType,
    options?: any[]
}
