import { menuData } from "~/data/menu/menuData"
import { MenuAcesses } from "@/data/types"
import { MenuSection, SectionItem } from "@/data/menu/types"

interface MenuRes {
    menu: MenuSection[], 
    pathes: string[]
}

class MenuBuilder  {
    public static fullAccess = (): MenuRes => {
        const menu: MenuSection[] = []
        
        menuData.forEach((value) => menu.push({ 
            subTitle: value.subTitle, 
            items: value.items 
        }))
        const pathes: string[] = this.pathConstructor(menu)
        return { menu, pathes }
    }
    public static filteredAccess = (acesses: MenuAcesses[]): MenuRes => {
        const menu: MenuSection[] = []
        for(const accessSection of acesses){
            const menuSection = menuData.get(accessSection.id)
            if(menuSection){
                let section: MenuSection = {
                    subTitle: menuSection.subTitle,
                    items: [] 
                }
                if (accessSection.items.length == 0){
                    section.items = menuSection.items 
                } else {
                    section.items = menuSection.items.filter((itm: SectionItem) => accessSection.items.includes( itm.id )) 
                }
                menu.push(section)
            }
        }
        const pathes: string[] = this.pathConstructor(menu)
        return { menu, pathes }
    }
    private static pathConstructor = (arr: MenuSection[]): string[] => {
        const pathes: string[] = []
        arr.forEach( el => el.items.forEach( itm => pathes.push(itm.path)) )
        return pathes
    }
}

export default MenuBuilder
