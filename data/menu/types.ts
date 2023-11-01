export interface MenuSection {
    subTitle: string,
    items: SectionItem[]
}

export interface SectionItem{ 
    id: number, 
    title: string, 
    icon: string, 
    path: string 
}
