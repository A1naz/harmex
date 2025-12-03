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
    
    // Пробуем несколько вариантов скачивания
    let response;
    
    // Вариант 1: С заголовками User-Agent
    try {
      response = await fetch(decodedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        }
      });
      
      if (!response.ok) {
        throw new Error('Try next method');
      }
    } catch (err) {
      // Вариант 2: Используем оригинальный URL (может быть он должен остаться закодированным)
      console.log('Trying with original encoded URL...');
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        }
      });
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

