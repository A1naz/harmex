export default function getBuyoutLink(mp: string, uuid: string) {
return `NUXTLINK||/${mp}/buyouts?uuid=${uuid}||Выкуп #${uuid}`
}