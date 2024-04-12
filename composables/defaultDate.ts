﻿function addLeadingZero(num: number) {
  return num < 10 ? '0' + num : num
}

// Функция для форматирования даты и времени
export function defaultDate(newDate: Date | string) {
  const date = new Date(newDate)
  const day = date.getUTCDate()
  const monthIndex = date.getUTCMonth()
  const year = date.getUTCFullYear()
  const hours = addLeadingZero(date.getUTCHours())
  const minutes = addLeadingZero(date.getUTCMinutes())

  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ]

  const monthName = months[monthIndex]

  return `${day} ${monthName} ${year} ${hours}:${minutes}`
}

export function DefaultDateWithoutMonthName(newDate: Date | string) {
  const date = new Date(newDate)
  const day = addLeadingZero(date.getUTCDate())
  const month = addLeadingZero(date.getUTCMonth() + 1)
  const year = date.getUTCFullYear()
  const hours = addLeadingZero(date.getUTCHours())
  const minutes = addLeadingZero(date.getUTCMinutes())

  return `${day}.${month}.${year} ${hours}:${minutes}`
}

export function defaultDateShort(newDate: Date | string) {
  const date = new Date(newDate)
  const day = addLeadingZero(date.getUTCDate())
  const month = addLeadingZero(date.getUTCMonth() + 1)
  const year = date.getUTCFullYear()
  return `${day}.${month}.${year}`
}

export function moscowDate(newDate: Date | string): string {
  const date = new Date(newDate)
  date.setHours(date.getHours() + 3)

  return date.toISOString()
}
