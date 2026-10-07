"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

const reviews: Review[] = [
  {
    name: "Marcos Silva",
    rating: 5,
    text: "Incrível! Consegui acessar vários jogos de consoles antigos que não encontrava em nenhum outro lugar. A interface é muito intuitiva e os downloads pelo aplicativo são rápidos.",
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

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  const breakpoints = {
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    640: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: slidesPerView,
      spaceBetween: 30,
    },
  };

  if (!domLoaded) {
    return (
      <div className="w-full h-64 bg-surface/30 animate-pulse rounded-lg overflow-hidden"></div>
    );
  }

  return (
    <div className="slider-container relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        // Swiper's default arrows use a data: icon font that the site CSP blocks.
        navigation={{ prevEl: ".reviews-prev", nextEl: ".reviews-next" }}
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
            <div className="border border-border bg-background/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-colors h-64 flex flex-col group">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 border border-primary/30 bg-surface flex items-center justify-center font-display font-bold text-primary text-lg">
                  {review.name[0]}
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-foreground uppercase">{review.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{review.date}</div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`size-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-grow line-clamp-4">
                &quot;{review.text}&quot;
              </p>
              <div className="mt-4 font-mono text-[9px] text-muted-foreground/50 uppercase tracking-widest flex items-center">
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
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        aria-label="Depoimento anterior"
        className="reviews-prev absolute left-1 top-32 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-xl border border-primary/40 bg-background/90 text-primary backdrop-blur-sm transition-colors hover:border-primary hover:bg-primary hover:text-white lg:-left-12"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Próximo depoimento"
        className="reviews-next absolute right-1 top-32 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-xl border border-primary/40 bg-background/90 text-primary backdrop-blur-sm transition-colors hover:border-primary hover:bg-primary hover:text-white lg:-right-12"
      >
        <ChevronRight className="size-5" />
      </button>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: hsl(var(--muted-foreground));
          opacity: 0.7;
        }

        .swiper-pagination-bullet-active {
          background: hsl(var(--primary)) !important;
          opacity: 1;
        }

        .swiper-container {
          padding-bottom: 40px;
        }
      `}</style>
    </div>
  );
}
