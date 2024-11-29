import type { ObjectId } from 'mongoose'
import type { DocuemntEnum, FieldsType, TariffTypeEnum, UserRoles } from './enums'
import type { MenuSection } from './menu/types'

export interface Entity {
  _id?: ObjectId
  id?: any
}

export interface StateMain {
  client: Client
  dodge: boolean
  theme: string
  pickpoints: any[]
  selectedItem: number | null
  drawerOpened: boolean | null
  faqModal: boolean
  swapAccountModal: boolean
  twoFaQRModal: boolean
  notificationsLength: number
}

export interface IUser extends Entity {
  save: () => unknown
  orgKey: string
  orgName: string
  orgOgrn: string
  orgInn: string
  middleName: string
  phoneNumber: string
  phoneConfirmed: boolean
  isBanned: boolean
  username: string | undefined
  firstName: string
  lastName: string
  email?: string
  apiKeys?: Array<{
    mp: string
    keys: string[]
  }>
  wbApiKey: string
  wbApiKeys: []
  password: string
  uuid: string
  uuidCompany: string
  roles: UserRoles[]
  tabs: string
  newEmail: string
  emailConfirmed: boolean
  telegram: string
  telegramUserId: string
  telegramUnlinkEmailSend: Date
  tg2fa: boolean
  balance: number
  tariffBalance: number
  registrationDate: Date
  partner: Partner
  tariff: ITariff
  twoFaQR: string | null
  twoFaSecret: string
  isTwoFaEnabled: boolean
  post: object
  MPTariffs: []
  newPassword: string
  ffEnabled: boolean
  terminateSession: boolean
  bik: string
  rs: string
  bankInfo: object
  fizFace: boolean
  staff: boolean
  landing: string
  quickAccesses: Array<string>
  acesses: Array<string>
  services: Array<string>
  favourites: Array<string>
  votedFor: Array<string>
  votedForService: Array<object>
  isPartnerWithdrawAvailable: Boolean
  ks: string
}

export interface IUserLogs extends Entity {
  userId: ObjectId
  userNick: string
  userEmail: string
  uuidCompany: string
  description: string
  documentType: DocuemntEnum
  documentId: string
  mp: string
  createdAt?: Date
}
export interface UserOperation extends Pick<IUserLogs, 'documentType'> {
  documentId: any
  comment?: string
}

export interface Client
  extends Omit<
    IUser,
    | 'acesses'
    | 'tabs'
    | 'newEmail'
    | 'emailConfirmed'
    | 'telegramUnlinkEmailSend'
    | 'tg2fa'
    | 'registrationDate'
    | 'wbApiKey'
    | 'password'
    | 'uuidCompany'
    | 'roles'
  > {
  hasPassword: boolean
  role: string
  mmenuItems: MenuSection[]
  allowedPathes: OptionsMulti[]
  isTwoFaEnabled: boolean
}

export interface Partner {
  balance: number
  refCount: number
  rewardPercent: number
  secondLevelPercent: number
  followCount: number
}

export interface OptionsMulti {
  value: string
  name: string
}

export interface ConfigTable {
  field: string
  header: string
  type: FieldsType
  actions?: any
}

export interface ConfigModal {
  field: string
  header: string
  type: FieldsType
  options?: any[]
}

export interface IPlan {
  name: string
  createdAt: Date
  tariff: ITariff
}

export interface ITariff {
  buyouts: TariffProp
  deliveryStorage: TariffProp
  review: TariffProp
  likeReview: TariffProp
  likeProduct: TariffProp
  questionProduct: TariffProp
  cart: TariffProp
  autoAnswer: TariffProp
}

export interface IReviewDraft extends Entity {
  user: string
  draftName?: string
  article?: number
  text: string
  createdAt: string
}

export interface TariffProp {
  type: TariffTypeEnum
  value: number
}

export interface ITabs {
  title: string
  slot: string
  query: string
}

export interface IResTable {
  list: any[]
  count: number
}

export interface ItemData {
  data: any[]
  count: number
  search: ItemSearch
}
export interface ItemSearch {
  skip: number
  limit: number
  sort: ItemSearchSort
  filter: any
}
export interface ItemSearchSort {
  [key: string]: number
}

export interface DateFilterRanges {
  header: string
  value: number
}
