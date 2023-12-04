const url = (latitude: string, longitude: string): string => `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`

export async function getCityByGeo(
    latitude: string, longitude: string
    ): Promise<{city: string, state: string}> {    
     try {
        await new Promise(resolve => setTimeout(resolve, 1000)) // delay request
        const data: any = await $fetch(
            url(latitude, longitude),
            { method: "GET" }
        )
        const city = data.address.city 
            ? data.address.city
            : data.address.town
                ? data.address.town
                : data.address.village
        const state = data.address.state
                ? data.address.state
                : data.address.city_district
                    ? data.address.city_district
                    : data.address.suburb
        return { city, state }
    } catch (error) {
        console.log("error: ", error)
        return { city: "не определен", state: "не определен" }
    } 
}
