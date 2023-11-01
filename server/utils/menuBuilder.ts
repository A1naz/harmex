import { menuData } from "~/data/menu/menuData"
import { MenuAcesses } from "@/data/types"
import { MenuSection, SectionItem } from "@/data/menu/types"

class MenuBuilder  {
    public static fullAccess = (): MenuSection[] => {
        const arr: MenuSection[] = []
        menuData.forEach((value) => arr.push({ 
            subTitle: value.subTitle, 
            items: value.items 
        }))
        return arr
    }
    public static filteredAccess = (acesses: MenuAcesses[]): MenuSection[] => {
        const arr: MenuSection[] = []
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
                arr.push(section)
            }
        }
        return arr
    }
}

export default MenuBuilder
