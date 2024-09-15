import { UserLogs } from '~/server/lib/models/UserLogs'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { skip, limit, sort, search } = getQuery(event)
    const skipParse = skip ? parseInt(skip.toString(), 10) : 0
    const limitParse = limit ? parseInt(limit.toString(), 10) : 50
    const sortParse = sort ? JSON.parse(sort.toString()) : {}

    const match = { 
        $match: {
            uuidCompany: user.uuid
    }}
  
    const listPL: any[] = [
        match,
        { $sort : sortParse },
        { $skip: skipParse },
        { $limit: limitParse },
    ]

    const countPL: any[] = [
        match,
        { $count: "count" }
    ]

    const pipeLine: any[] = [
        { $facet: {
            list: listPL ,
            count: countPL         
        }}
    ]

    const logs = await UserLogs.aggregate(pipeLine)

    return {
        status: 'ok',
        data: {
            list: logs[0].list.length > 0 ? logs[0].list : [],
            count: logs[0].count.length > 0 ? logs[0].count[0].count : 0
        }
    }
})
