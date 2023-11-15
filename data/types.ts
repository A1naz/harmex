import { MenuSection } from "./menu/types"

export interface Entity {
    _id?: any;
    id?: any;
}

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

export interface IUser extends Entity {
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
    roles: UserRoles[],
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
    "email" | "username" | "uuid" | "telegram" | "balance" | "firstName" | 
    "lastName" | "telegramUserId" | "wbApiKeys" | "partner" | "isBanned"
    > {
        hasPassword: boolean,
        role: string,
        mmenuItems: MenuSection[],
        allowedPathes: OptionsMulti[]
}

export interface Partner{
    balance: number,
    refCount: number,
    rewardPercent: number,
}

export enum UserRoles {
    admin = 'admin',
    user = 'user',
    staff = 'staff'
}

export interface OptionsMulti {
    value: string,
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
