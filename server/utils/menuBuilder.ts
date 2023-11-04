import { menuDataList, menuSectionList } from "~/data/menu/menuData"
import { OptionsMulti } from "@/data/types"
import { MenuDataList, MenuSection } from "@/data/menu/types"
import { access } from "node:fs"



class MenuBuilder {

    public static fullAccess = (): MenuSection[] => {
        const menu: MenuSection[] = []
        menuSectionList.forEach( section => menu.push({
            subTitle: section.subTitle,
            section: section.subTitle,
            items: menuDataList.filter( mnu => mnu.section == section.section)
        }))
        return menu
    }

    public static filteredAccess = (acesses: string[]): MenuSection[] => {
        const menu: MenuSection[] = []

        acesses.forEach( acc => {
            const menuItem = menuDataList.find( menu => menu.path == acc)
            if(menuItem){
                const sectionIndex: number = menu.findIndex( mnu => mnu.section == menuItem.section )
                if(sectionIndex !== -1){
                    menu[sectionIndex].items.push(menuItem)
                } else {
                    const section = menuSectionList.find(sect => sect.section == menuItem.section)
                    if(section){
                        const newSection: MenuSection = {
                            subTitle: section.subTitle,
                            section: section.section,
                            items: [{...menuItem}]
                        }
                        menu.push(newSection)
                    } else {
                        console.warn(`Did not find ${menuItem.section} in menuSectionList`)
                    }
                }
            } else {
                console.warn(`Did not find ${acc} in menuDataList`)
            }
        })
        return menu
    }

    public static pathOptions = (arr: MenuDataList[]): OptionsMulti[] => {
        const pathes: OptionsMulti[] = []
        arr.forEach( (el: any) => el.items.forEach( (itm: any) => pathes.push({
                value: itm.path,
                name: itm.title
            })
        ))
        return pathes
    }
}

export default MenuBuilder
