import { TariffTypeEnum, FieldsType, UserRoles } from "./enums"
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
    faqModal: boolean,
    swapAccountModal: boolean,
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
    partner: Partner,
    tariff: ITariff
}

export interface Client extends Omit<
    IUser, 
    "acesses" | "tabs" | "newEmail" | "emailConfirmed" | "telegramUnlinkEmailSend"
    | "tg2fa" | "registrationDate" | "wbApiKey" | "password" | "uuidCompany" | "roles"
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

export interface OptionsMulti {
    value: string,
    name: string
}

export interface ConfigTable {
    field: string, 
    header: string, 
    type: FieldsType,
    actions?: any
}


export interface ConfigModal {
    field: string, 
    header: string, 
    type: FieldsType,
    options?: any[]
}

export interface IPlan {
    name: string,
    createdAt: Date,
    tariff: ITariff
}

export interface ITariff {
    buyouts: TariffProp,
    deliveryStorage: TariffProp,
    review: TariffProp,
    likeReview: TariffProp,
    likeProduct: TariffProp,
    questionProduct: TariffProp,
    cart: TariffProp,
    autoAnswer: TariffProp,
}

export interface TariffProp {
    type: TariffTypeEnum, 
    value: number
}


export interface ITabs { 
    title: string, 
    slot: string, 
    query: string 
}

export interface IResTable {
    list: any[],
    count: number
}
