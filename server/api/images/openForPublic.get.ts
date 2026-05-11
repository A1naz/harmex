import { GetObjectCommand, PutObjectAclCommand, S3Client } from '@aws-sdk/client-s3'
import { assertSafeS3Key } from '~/server/utils/security'

const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { path }: any = getQuery(event)
  const key = assertSafeS3Key(path)

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
      Key: key,
    }
    const getObjectCommand = new GetObjectCommand(getObjectParams)
    await s3.send(getObjectCommand)

    // Устанавливаем права доступа (ACL) для объекта
    const aclParams = {
      Bucket: bucket,
      Key: key,
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
      message: 'Не удалось открыть доступ к файлу',
    }
  }
})
