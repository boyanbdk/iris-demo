/**
 * Single source of truth for the fictional demo clinic.
 * Every identity, metric, address and review below is an invented example.
 */

export interface Service {
  title: string;
  desc: string;
  /** simple inline-svg key rendered by ServiceIcon.astro */
  icon: 'tooth' | 'implant' | 'sparkle' | 'crown' | 'child' | 'emergency';
}

export interface Review {
  quote: string;
  author: string;
  source: string;
}

export const clinic = {
  name: 'Дентална клиника Ирис',
  legalName: 'Дентална клиника Ирис · измислена демонстрация',
  doctor: 'д-р Елена Маринова',
  tagline: 'Спокойна стоматология с ясна грижа за цялото семейство',
  intro:
    'Пример за модерен сайт на дентална клиника: ясни услуги, спокоен тон и лесна следваща стъпка за пациента.',

  rating: '4.9',
  reviewCount: 52,
  yearsExperience: 12,
  ratingUrl: '',

  phone: '',
  phoneHref: '',
  email: '',
  address: {
    street: 'бул. Примерен 1',
    district: 'централна градска част',
    city: '1000 София',
    mapsUrl: '',
  },
  hours: [
    { day: 'Понеделник – Петък', time: '09:00 – 19:00' },
    { day: 'Събота', time: '09:00 – 14:00' },
    { day: 'Неделя', time: 'Почивен ден' },
  ],

  services: [
    {
      title: 'Профилактика и преглед',
      desc: 'Периодични прегледи, професионално почистване и ясен план за последваща грижа.',
      icon: 'tooth',
    },
    {
      title: 'Възстановителна стоматология',
      desc: 'Лечение и възстановяване на засегнати зъби с внимание към функцията, комфорта и естествения вид.',
      icon: 'crown',
    },
    {
      title: 'Естетична стоматология',
      desc: 'Избелване, фасети и естетични възстановявания след индивидуална оценка и обсъждане.',
      icon: 'sparkle',
    },
    {
      title: 'Консултация за импланти',
      desc: 'Преглед, образна диагностика и обсъждане на подходящите възможности при липсващи зъби.',
      icon: 'implant',
    },
    {
      title: 'Детска стоматология',
      desc: 'Търпелив подход и постепенно запознаване с кабинета за по-спокойни първи посещения.',
      icon: 'child',
    },
    {
      title: 'Неотложна консултация',
      desc: 'Оценка при болка или счупен зъб и насочване към подходяща следваща стъпка.',
      icon: 'emergency',
    },
  ] satisfies Service[],

  reviews: [
    {
      quote: 'Всичко беше обяснено спокойно и разбираемо още преди началото на прегледа.',
      author: 'Примерен отзив',
      source: 'Измислена демонстрация',
    },
    {
      quote: 'Сайтът ми помогна бързо да намеря информация и да разбера как да поискам час.',
      author: 'Примерен отзив',
      source: 'Измислена демонстрация',
    },
    {
      quote: 'Екипът подхожда внимателно и оставя достатъчно време за въпроси.',
      author: 'Примерен отзив',
      source: 'Измислена демонстрация',
    },
  ] satisfies Review[],

  seo: {
    title: 'Дентална клиника Ирис — демонстрационен сайт на АвтоСилас',
    description:
      'Измислен демонстрационен сайт, който показва как АвтоСилас представя дентална клиника онлайн.',
  },
} as const;

export type Clinic = typeof clinic;
