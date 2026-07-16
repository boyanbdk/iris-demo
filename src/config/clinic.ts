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

export interface Doctor {
  name: string;
  role: string;
  specialty: string;
  bio: string;
  image: string;
  imageAlt: string;
  lead?: boolean;
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  layout: 'wide' | 'portrait';
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

  media: {
    hero: {
      posterSrc: '/photos/iris/hero-poster.webp',
      videoSrc: '',
      videoType: 'video/mp4',
    },
    serviceBackdrop: '/photos/iris/clinic-reception.webp',
  },

  doctors: [
    {
      name: 'д-р Елена Маринова',
      role: 'Водещ лекар',
      specialty: 'Естетична и възстановителна стоматология',
      bio: 'Съчетава внимателното изслушване с ясен план за естествен и устойчив резултат.',
      image: '/photos/iris/doctor-elena.webp',
      imageAlt: 'Измислен портрет на д-р Елена Маринова в демонстрационната клиника',
      lead: true,
    },
    {
      name: 'д-р Никола Георгиев',
      role: 'Лекар по дентална медицина',
      specialty: 'Имплантология и орална хирургия',
      bio: 'Обяснява всяка стъпка спокойно и поставя предвидимостта пред прибързаните решения.',
      image: '/photos/iris/doctor-nikola.webp',
      imageAlt: 'Измислен портрет на д-р Никола Георгиев в демонстрационната клиника',
    },
    {
      name: 'д-р Мила Петрова',
      role: 'Лекар по дентална медицина',
      specialty: 'Детска стоматология',
      bio: 'Помага на децата да опознаят кабинета постепенно, с търпение и чувство за сигурност.',
      image: '/photos/iris/doctor-mila.webp',
      imageAlt: 'Измислен портрет на д-р Мила Петрова в демонстрационната клиника',
    },
    {
      name: 'д-р Виктор Илиев',
      role: 'Лекар по дентална медицина',
      specialty: 'Профилактика и ортодонтска грижа',
      bio: 'Работи за навици и решения, които пациентите могат уверено да следват всеки ден.',
      image: '/photos/iris/doctor-viktor.webp',
      imageAlt: 'Измислен портрет на д-р Виктор Илиев в демонстрационната клиника',
    },
  ] satisfies Doctor[],

  gallery: [
    {
      src: '/photos/iris/clinic-reception.webp',
      alt: 'Измислена светла рецепция на демонстрационната клиника Ирис',
      caption: 'Светло посрещане и спокойна зона за изчакване.',
      layout: 'wide',
    },
    {
      src: '/photos/iris/clinic-treatment-room.webp',
      alt: 'Измислен модерен кабинет в демонстрационната клиника Ирис',
      caption: 'Подредена среда, която помага на пациента да се чувства сигурно.',
      layout: 'portrait',
    },
    {
      src: '/photos/iris/clinic-consultation.webp',
      alt: 'Измислена консултация между лекар и пациент в клиника Ирис',
      caption: 'Разговорът и ясното обяснение идват преди всяка следваща стъпка.',
      layout: 'portrait',
    },
  ] satisfies GalleryItem[],

  map: {
    latitude: 42.6718,
    longitude: 23.3094,
    label: 'Примерна локация · район Южен парк, София',
    embedUrl:
      'https://www.openstreetmap.org/export/embed.html?bbox=23.2944%2C42.6628%2C23.3244%2C42.6808&layer=mapnik&marker=42.6718%2C23.3094',
    externalUrl: 'https://www.openstreetmap.org/?mlat=42.6718&mlon=23.3094#map=16/42.6718/23.3094',
  },

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
