export default function numberToText(num: number) {
    if (typeof num !== 'number' || isNaN(num)) {
      throw new Error('Input must be a valid number.');
    }
  
    const rubles = Math.floor(num);
    const kopecks = Math.round((num - rubles) * 100);
  
    const rublesText = rubles > 0 ? numberToWordsRu(rubles) : 'Ноль';
    const rublesDeclension = getRublesDeclension(rubles);
  
    const kopecksText = kopecks.toString().padStart(2, '0');
    const kopecksDeclension = getKopecksDeclension(kopecks);
  
    return `${rublesText} ${rublesDeclension} ${kopecksText} ${kopecksDeclension}`;
  }
  
  function numberToWordsRu(number: number) {
    const units = [
      '',
      'один',
      'два',
      'три',
      'четыре',
      'пять',
      'шесть',
      'семь',
      'восемь',
      'девять',
    ];
    const teens = [
      'десять',
      'одиннадцать',
      'двенадцать',
      'тринадцать',
      'четырнадцать',
      'пятнадцать',
      'шестнадцать',
      'семнадцать',
      'восемнадцать',
      'девятнадцать',
    ];
    const tens = [
      '',
      '',
      'двадцать',
      'тридцать',
      'сорок',
      'пятьдесят',
      'шестьдесят',
      'семьдесят',
      'восемьдесят',
      'девяносто',
    ];
    const hundreds = [
      '',
      'сто',
      'двести',
      'триста',
      'четыреста',
      'пятьсот',
      'шестьсот',
      'семьсот',
      'восемьсот',
      'девятьсот',
    ];
    const thousands = ['тысяча', 'тысячи', 'тысяч'];
  
    if (number === 0) return 'ноль';
  
    const parts = [];
    let current = number;
  
    if (current >= 1000) {
      const thousandsCount = Math.floor(current / 1000);
      current %= 1000;
  
      const thousandsText: string = numberToWordsRu(thousandsCount)
        .replace('один', 'одна')
        .replace('два', 'две');
  
      parts.push(
        `${thousandsText} ${
          thousands[
            getDeclensionIndex(thousandsCount)
          ]
        }`
      );
    }
  
    if (current >= 100) {
      const hundredsIndex = Math.floor(current / 100);
      current %= 100;
      parts.push(hundreds[hundredsIndex]);
    }
  
    if (current >= 20) {
      const tensIndex = Math.floor(current / 10);
      current %= 10;
      parts.push(tens[tensIndex]);
    }
  
    if (current >= 10) {
      parts.push(teens[current - 10]);
      current = 0;
    }
  
    if (current > 0) {
      parts.push(units[current]);
    }
  
    return parts.join(' ');
  }
  
  function getDeclensionIndex(number: number) {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;
  
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 2;
    }
    if (lastDigit === 1) {
      return 0;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 1;
    }
    return 2;
  }
  
  function getRublesDeclension(rubles: number) {
    return ['рубль', 'рубля', 'рублей'][getDeclensionIndex(rubles)];
  }
  
  function getKopecksDeclension(kopecks: number) {
    return ['копейка', 'копейки', 'копеек'][getDeclensionIndex(kopecks)];
  }


  