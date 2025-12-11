export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { url } = getQuery(event);
  
  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "URL is required",
    });
  }

  try {
    // Декодируем URL - может быть закодирован дважды (%252F -> %2F -> /)
    let decodedUrl = url;
    
    // Декодируем пока есть закодированные символы
    while (decodedUrl !== decodeURIComponent(decodedUrl)) {
      decodedUrl = decodeURIComponent(decodedUrl);
    }
    
    console.log('Original URL:', url);
    console.log('Decoded URL:', decodedUrl);
    
    // Определяем маркетплейс по URL для специфичных заголовков
    const isOzon = decodedUrl.includes('ozone.ru') || decodedUrl.includes('cdn.ozone.ru') || decodedUrl.includes('cdn1.ozone.ru');
    const isYandex = decodedUrl.includes('yandex.net') || decodedUrl.includes('avatars.mds.yandex.net') || decodedUrl.includes('avatars.mds.yandex.ru');
    const isWildberries = decodedUrl.includes('wildberries.ru') || decodedUrl.includes('wbstatic.net') || decodedUrl.includes('basket-');
    const isAvito = decodedUrl.includes('avito.ru') || decodedUrl.includes('avito.st');
    const isGoldApple = decodedUrl.includes('goldapple.ru');
    const isFlowwow = decodedUrl.includes('flowwow.com');
    const isSutochno = decodedUrl.includes('sutochno.ru');
    
    // Базовые заголовки
    const baseHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };
    
    // Добавляем специфичные заголовки для маркетплейсов
    if (isOzon) {
      Object.assign(baseHeaders, {
        'Referer': 'https://www.ozon.ru/',
        'Origin': 'https://www.ozon.ru',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-site',
      });
    } else if (isYandex) {
      Object.assign(baseHeaders, {
        'Referer': 'https://market.yandex.ru/',
        'Origin': 'https://market.yandex.ru',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      });
    } else if (isWildberries) {
      Object.assign(baseHeaders, {
        'Referer': 'https://www.wildberries.ru/',
        'Origin': 'https://www.wildberries.ru',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-site',
      });
    } else if (isAvito) {
      Object.assign(baseHeaders, {
        'Referer': 'https://www.avito.ru/',
        'Origin': 'https://www.avito.ru',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      });
    } else if (isGoldApple) {
      Object.assign(baseHeaders, {
        'Referer': 'https://goldapple.ru/',
        'Origin': 'https://goldapple.ru',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-site',
      });
    } else if (isFlowwow) {
      Object.assign(baseHeaders, {
        'Referer': 'https://flowwow.com/',
        'Origin': 'https://flowwow.com',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      });
    } else if (isSutochno) {
      Object.assign(baseHeaders, {
        'Referer': 'https://www.sutochno.ru/',
        'Origin': 'https://www.sutochno.ru',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      });
    }
    
    // Пробуем несколько вариантов скачивания
    let response;
    
    // Вариант 1: С специфичными заголовками
    try {
      response = await fetch(decodedUrl, {
        headers: baseHeaders
      });
      
      if (!response.ok) {
        throw new Error('Try next method');
      }
    } catch (err) {
      // Вариант 2: Используем оригинальный URL (может быть он должен остаться закодированным)
      console.log('Trying with original encoded URL...');
      try {
        response = await fetch(url, {
          headers: baseHeaders
        });
      } catch (err2) {
        // Вариант 3: Минимальные заголовки
        console.log('Trying with minimal headers...');
        response = await fetch(decodedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
        });
      }
    }
    
    if (!response.ok) {
      console.error('Response status:', response.status);
      console.error('Response statusText:', response.statusText);
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('Downloaded image size:', buffer.length, 'bytes');

    // Возвращаем изображение как blob
    setHeader(event, "Content-Type", response.headers.get("content-type") || "image/png");
    
    return buffer;
  } catch (error) {
    console.error("Error downloading photo:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to download photo",
    });
  }
});

