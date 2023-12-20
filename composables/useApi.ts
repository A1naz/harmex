import { useNotification } from "@kyvg/vue3-notification"

const useApi = () => {
    const { notify } = useNotification()
    const headers = useRequestHeaders(['cookie']) as HeadersInit
    const basePoint = '/api'

    const getData = async <T>(endPoint: string, params?: any) => {
        try {
            const res = await $fetch<T>(`${basePoint}${endPoint}`, {
                headers,
                method: 'GET',
                params: params ?? ''
            })
            if(res) return res
            else _showMessage('Ничего не нашли')
        } catch(e: any) {
            _showMessage(e.message)
        }
    }

    const postData = async <T>(endPoint: string, body: any) => {
        try {
            const res = await $fetch<T>(`${basePoint}${endPoint}`, {
                headers,
                method: 'POST',
                body: body
            })
            if(res) return res
            else _showMessage('Ничего не нашли')
        } catch(e: any) {
            _showMessage(e.message)
            return { error: e.data.message }
        }
    }

    const putData = async <T>(endPoint: string, body: any) => {
        try {
            const res = await $fetch<T>(`${basePoint}${endPoint}`, {
                headers,
                method: 'PUT',
                body: body
            })
            if(res) return res
            else _showMessage('Ничего не нашли')
        } catch(e: any) {
            _showMessage(e.message)
        }
    }

    const deleteData = async <T>(endPoint: string, body: any) => {
        try {
            const res = await $fetch<T>(`${basePoint}${endPoint}`, {
                headers,
                method: 'DELETE',
                body: body
            })
            if(res) return res
            else _showMessage('Ничего не нашли')
        } catch(e: any) {
            _showMessage(e.message)
            return { error: 'ошибка' }
        }
    }

    const _showMessage = (mes: any) => {
        console.log(mes.message)
        notify({
            title: 'Что-то пошло не так',
            text: mes,
            type: 'error',
            duration: 3000,
          })
    }

    return {
        headers,
        getData,
        postData,
        putData,
        deleteData
    }
}

export default useApi
