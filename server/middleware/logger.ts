
export default eventHandler(async (event) => {

    if(event.node.req.method !== 'GET'){
        await logger(event)
    }

})

