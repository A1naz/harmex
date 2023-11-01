import { menuData } from "~/data/menu/menuData"
import { MenuAcesses } from "@/data/types"
import { MenuSection, SectionItem } from "@/data/menu/types"

class MenuBuilder  {
    public static full = (): MenuSection[] => {
        const arr: MenuSection[] = []
        menuData.forEach((value) => arr.push({ 
            subTitle: value.subTitle, 
            items: value.items 
        }))
        return arr
    }
    public static filter = (acesses: MenuAcesses[]): MenuSection[] => {
        const arr: MenuSection[] = []
        for(const acItem of acesses){
            const menuItem = menuData.get(acItem.id)
            if(menuItem){
                arr.push({
                    subTitle: menuItem.subTitle,
                    items: menuItem.items.filter( (itm: SectionItem ) => acItem.items.includes( itm.id )) 
                })
            }
        }
        return arr
    }
}

export default MenuBuilder
