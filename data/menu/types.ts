export interface MenuSection {
    subTitle: string,
    section: string,
    items: MenuDataList[]
}

export interface MenuDataList{ 
    section: string,
    title: string, 
    icon: string, 
    path: string 
}

export interface MenuSectionList {
    section: string, 
    subTitle: string
}