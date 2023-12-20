import { UserLogs } from '~/server/lib/models/UserLogs'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { skip, limit, search, sort } = getQuery(event)

    const listPL: any[] = [
        {
            $match: {
                uuidCompany: user.uuid
            }
        }
    ]

    const countPL: any[] = [
        {
            $match: {
                uuidCompany: user.uuid
            }
        },
        { $count: "count" }
    ]

    const pipeLine: any[] = [
        {
            $facet: {
                list: listPL ,
                count: countPL         
            }
        }
    ]

    const logs = await UserLogs.aggregate(pipeLine)



    //   const logs = await UserLogs.find({ uuidCompany: user.uuid }).sort({ _id: -1 })


    return {
        status: 'ok',
        data: {
            list: logs[0].list,
            count: logs[0].count[0].count
        }
    }
})
