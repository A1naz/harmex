import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

export default function getQR() {
  const secret: any = speakeasy.generateSecret({
    name: 'TOPVTOP',
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
      // Ваш код, который использует значение code
      console.log(code)
      // Вы можете использовать code здесь, или вернуть его из функции, если необходимо
      return code
    } catch (error) {
      // Обработка ошибки
      console.error(error)
      return undefined // или другое значение по умолчанию
    }
  }

  // Где-то в вашем коде вызывайте getCodeAndDoSomething()
  getCodeAndDoSomething().then((result) => {
    // Вы можете использовать result здесь, если необходимо
    console.log(result)
  })
  

  return { code, secret }
}
