import { menuDataList, menuSectionList } from "~/data/menu/menuData"
import { OptionsMulti } from "@/data/types"
import { MenuDataList, MenuSection } from "@/data/menu/types"

interface MenuBuided {
    menu: MenuSection[], 
    allowedPathes: OptionsMulti[]
}

class MenuBuilder {

    public static filteredAccess = (acesses?: string[]): MenuBuided => {
        const menu: MenuSection[] = []
        let allowedPathes: OptionsMulti[] = []

        if(!acesses || acesses[0] == 'fullAccess'){
            menuSectionList.forEach( section => menu.push({
                subTitle: section.subTitle,
                section: section.subTitle,
                items: menuDataList.filter( mnu => mnu.section == section.section)
            }))
            allowedPathes = menuDataList.map(data => {
                return {
                    value: data.path,
                    name: data.title
                }
            })
            return { menu, allowedPathes}
        }
        else{
            acesses.forEach( acc => {
                const menuItem = menuDataList.find( menu => menu.path == acc)
                if(menuItem){
                    allowedPathes.push({
                        value: menuItem.path,
                        name: menuItem.title
                    })
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

        return { menu, allowedPathes}
        }
    }

    public static pathOptions = (arr: MenuDataList[] = menuDataList): OptionsMulti[] => {
        const pathes: OptionsMulti[] = []
        arr.forEach( (el: any) => pathes.push({
                value: el.path,
                name: el.title
            })
        )
        return pathes
    }
}

export default MenuBuilder
