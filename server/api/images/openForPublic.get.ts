import AWS from 'aws-sdk'
import * as fs from 'fs'
const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const { path }: any = getQuery(event)

  const bucket = 'ozonmpportal'
  AWS.config.update({
    accessKeyId: config.VK_ACCESS_KEY,
    secretAccessKey: config.VK_SECRET_KEY,
    endpoint: 'https://hb.vkcs.cloud',
  })

  const params: AWS.S3.GetObjectRequest = {
    Bucket: 'ozonmpportal',
    Key: path,
  }

  const s3 = new AWS.S3()

  s3.getObject(params, (err, data) => {
    if (err) {
      console.error('Ошибка при чтении объекта из S3:', err)
      return
    }

    // Подготовка ACL для установки прав доступа
    const aclParams: AWS.S3.PutObjectAclRequest = {
      Bucket: bucket,
      Key: path,
      ACL: 'public-read', 
    }

  
    s3.putObjectAcl(aclParams, (aclErr, aclData) => {
      if (aclErr) {
        console.error('Ошибка при установке ACL для объекта:', aclErr)
        return
      }
    })
  })

  return {
    status: 'ok',
  }
})
