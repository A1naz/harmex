const config = useRuntimeConfig()
const organizationKey = config.ORGANIZATION_KEY

export default eventHandler(async (event) => {
  const { inn }: any = getQuery(event)

  const data: any = await $fetch(
    `https://api-fns.ru/api/multinfo?key=${organizationKey}&req=${inn}`,
  )

  return {
    data,
  }
})
