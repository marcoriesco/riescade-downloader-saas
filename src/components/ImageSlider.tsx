"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";

// Importações de estilos do Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

type GameImage = {
  title: string;
  console: string;
  image: string;
};

interface ImageSliderProps {
  images: GameImage[];
  slidesPerView?: number;
  effect?: "slide" | "fade" | "cube" | "coverflow" | "flip";
  autoplay?: boolean;
  loop?: boolean;
}

export function ImageSlider({
  images,
  slidesPerView = 3,
  effect = "slide",
  autoplay = true,
  loop = true,
}: ImageSliderProps) {
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
      <div className="w-full h-72 bg-gray-800/30 animate-pulse rounded-lg overflow-hidden"></div>
    );
  }

  return (
    <div className="slider-container relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={30}
        effect={effect}
        navigation
        pagination={{ clickable: true }}
        autoplay={
          autoplay ? { delay: 3000, disableOnInteraction: false } : false
        }
        loop={loop}
        breakpoints={breakpoints}
        className="mySwiper"
      >
        {images.map((item, index) => (
          <SwiperSlide key={index} className="pb-12">
            <div className="relative bg-gray-800/20 rounded-lg overflow-hidden border border-gray-700 hover:border-[#ff0884]/50 transition-all duration-300 group h-72">
              <div className="h-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500"
                  width={500}
                  height={300}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-bold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-[#ff0884]">{item.console}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Estilos customizados */}
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
