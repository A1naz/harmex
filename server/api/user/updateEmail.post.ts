import validator from 'validator';
import { User } from '@/server/lib/models/User';
import MailService from '~~/server/lib/mailService.js';
import user from '~~/server/utils/auth'; 

export default eventHandler(async (event) => {
  const currentUser = await user.user(event); 
  // console.log('currentUser', currentUser);

  if (!currentUser) {
    return sendRedirect(event, '/auth', 302);
  }

  const body = await readBody(event);
  const { email } = body;

  // console.log('validator', validator.isEmail(email));

  if (!validator.isEmail(email)) {
    throw createError({
      statusCode: 400,
      message: 'Введите корректный email',
    });
  }

  const foundedUser = await User.findOne({ uuid: currentUser.uuid });
  // console.log('foundedUser', foundedUser);
  if (!foundedUser) {
    return sendRedirect(event, '/auth', 302);
  }


  const foundByEmail = await User.findOne({ email: body.email });
  // console.log('foundByEmail', foundByEmail);
  if (foundByEmail && foundByEmail.uuid !== currentUser.uuid) {
    throw createError({
      statusCode: 400,
      message: 'Email уже занят',
    });
  }

  let emailUpdated = false;
  if (email !== foundedUser.email) {
    foundedUser.newEmail = email;
    const url = useRuntimeConfig().PUBLIC_SITE_URL;
    console.log('Отправка сообщения..')
    await MailService.sendNewEmailActivationMail(
      email,
      `${url}/api/auth/activate?uuid=${foundedUser.uuid}`
    );
    console.log('Сообщение отправлено');
    emailUpdated = true;
  }

  await foundedUser.save();
  return {
    status: 'ok',
    emailUpdated: emailUpdated,
  };
});
