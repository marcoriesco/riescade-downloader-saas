"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Star } from "lucide-react";

// Importações de estilos do Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Roboto_Condensed } from "next/font/google";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400"],
});

// Tipo para as avaliações
type Review = {
  name: string;
  rating: number;
  text: string;
  date: string;
};

interface GoogleReviewsProps {
  slidesPerView?: number;
  autoplay?: boolean;
  loop?: boolean;
}

// Array de avaliações
const reviews: Review[] = [
  {
    name: "Marcos Silva",
    rating: 5,
    text: "Incrível! Consegui acessar vários jogos de consoles antigos que não encontrava em nenhum outro lugar. A interface é muito intuitiva e o acesso ao Google Drive é rápido.",
    date: "2 meses atrás",
  },
  {
    name: "Ana Cardoso",
    rating: 5,
    text: "Vale cada centavo! Meus filhos adoraram jogar os mesmos jogos que eu jogava quando era criança. Recomendo a todos os amantes de games retro.",
    date: "3 meses atrás",
  },
  {
    name: "Rafael Mendes",
    rating: 4,
    text: "Excelente plataforma! Só não dou 5 estrelas porque tive um pequeno problema com o acesso inicial, mas o suporte foi super atencioso e resolveu rapidamente.",
    date: "1 mês atrás",
  },
  {
    name: "Juliana Costa",
    rating: 5,
    text: "A melhor forma de reviver os clássicos! A quantidade de plataformas disponíveis é impressionante. Estou muito satisfeita com o serviço.",
    date: "2 semanas atrás",
  },
  {
    name: "Pedro Almeida",
    rating: 5,
    text: "Sensacional! Finalmente um serviço que reúne tantas plataformas em um só lugar. A organização é perfeita e facilita muito encontrar os jogos que quero.",
    date: "1 mês atrás",
  },
];

export function GoogleReviews({
  slidesPerView = 3,
  autoplay = true,
  loop = true,
}: GoogleReviewsProps) {
  const [domLoaded, setDomLoaded] = useState(false);

  // Resolver problema de hidratação com SSR e Swiper
  useEffect(() => {
    setDomLoaded(true);
  }, []);

  // Configurar breakpoints responsivos
  const breakpoints = {
    // quando a janela for >= 320px
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    // quando a janela for >= 640px
    640: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    // quando a janela for >= 1024px
    1024: {
      slidesPerView: slidesPerView,
      spaceBetween: 30,
    },
  };

  if (!domLoaded) {
    return (
      <div className="w-full h-64 bg-gray-800/30 animate-pulse rounded-lg overflow-hidden"></div>
    );
  }

  // Renderizar estrelas baseado na avaliação
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
          }`}
        />
      ));
  };

  return (
    <div className="slider-container relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        navigation
        pagination={{ clickable: true }}
        autoplay={
          autoplay ? { delay: 5000, disableOnInteraction: false } : false
        }
        loop={loop}
        breakpoints={breakpoints}
        className="mySwiper"
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index} className="pb-12">
            <div className="relative bg-gray-800/20 rounded-lg overflow-hidden border border-gray-700 hover:border-[#ff0884]/50 transition-all duration-300 group h-64 p-6">
              <div className="flex items-center mb-4">
                <div className="bg-[#ff0884]/20 text-[#ff0884] rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-medium">{review.name}</h3>
                  <div className="flex mt-1">{renderStars(review.rating)}</div>
                </div>
                <div className="ml-auto text-xs text-gray-400">
                  {review.date}
                </div>
              </div>

              <p
                className={`${robotoCondensed.className} text-gray-300 line-clamp-4`}
              >
                &ldquo;{review.text}&rdquo;
              </p>

              <div className="absolute bottom-4 right-4">
                <div className="text-xs text-gray-400 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                    className="h-3 w-3 mr-1 text-[#4285F4] fill-current"
                  >
                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                  </svg>
                  Avaliação do Google
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #ff0884 !important;
          background: rgba(0, 0, 0, 0.3);
          width: 40px !important;
          height: 40px !important;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 18px !important;
          font-weight: bold;
        }

        .swiper-pagination-bullet {
          background: #666;
          opacity: 0.7;
        }

        .swiper-pagination-bullet-active {
          background: #ff0884 !important;
          opacity: 1;
        }

        .swiper-container {
          padding-bottom: 40px;
        }
      `}</style>
    </div>
  );
}
