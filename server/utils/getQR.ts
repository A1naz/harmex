import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

export default function getQR() {
  const secret: any = speakeasy.generateSecret({
    name: 'MARKETMONSTR',
  })

  const getQR = () => {
    return new Promise((resolve, reject) => {
      qrcode.toDataURL(secret.otpauth_url, (err: any, data: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  let code: any

  async function getCodeAndDoSomething() {
    try {
      code = await getQR()

      return code
    } catch (error) {

      console.error(error)
      return undefined 
    }
  }

  getCodeAndDoSomething().then((result) => {
  })
  

  return { code, secret }
}
