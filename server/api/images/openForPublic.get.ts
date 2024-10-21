import { GetObjectCommand, PutObjectAclCommand, S3Client } from '@aws-sdk/client-s3'

const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const { path }: any = getQuery(event)

  const bucket = 'ozonmpportal'
  const s3 = new S3Client({
    region: 'ru-central1',
    credentials: {
      accessKeyId: config.VK_ACCESS_KEY,
      secretAccessKey: config.VK_SECRET_KEY,
    },
    endpoint: 'https://hb.vkcs.cloud',
  })

  try {
    // Получаем объект из S3
    const getObjectParams = {
      Bucket: bucket,
      Key: path,
    }
    const getObjectCommand = new GetObjectCommand(getObjectParams)
    await s3.send(getObjectCommand)

    // Устанавливаем права доступа (ACL) для объекта
    const aclParams = {
      Bucket: bucket,
      Key: path,
      ACL: 'public-read',
    }

    const putAclCommand = new PutObjectAclCommand(aclParams)
    await s3.send(putAclCommand)

    return {
      status: 'ok',
    }
  }
  catch (err: any) {
    console.error('Ошибка при работе с S3:', err)
    return {
      status: 'error',
      message: err.message,
    }
  }
})
