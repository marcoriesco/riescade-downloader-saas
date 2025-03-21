"use client";

import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlaystation,
  faXbox,
  faSteam,
  faTwitch,
  faItchIo,
  faDiscord,
  faGooglePlay,
  faApple,
  faWindows,
  faAndroid,
  faLinux,
  faJava,
} from "@fortawesome/free-brands-svg-icons";
import {
  faGamepad,
  faVrCardboard,
  faChess,
  faDice,
  faHeadset,
  faDesktop,
  faMobile,
  faChessKnight,
  faChessRook,
  faChessQueen,
  faChessPawn,
  faRobot,
  faChessBoard,
  faGhost,
  faFire,
  faPuzzlePiece,
  faTrophy,
  faUserNinja,
  faFistRaised,
  faFootballBall,
  faBasketballBall,
  faVolleyballBall,
  faTableTennis,
  faHatWizard,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

interface PlatformIconsProps {
  speed?: number;
  pauseOnHover?: boolean;
  autoScroll?: boolean;
}

export function PlatformIcons({
  speed = 30,
  pauseOnHover = true,
  autoScroll = true,
}: PlatformIconsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    if (!autoScroll) return;

    // Injeta os estilos da animação com a velocidade personalizada apenas se autoScroll estiver ativado
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideLeft {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${
          scrollRef.current?.scrollWidth || 2000
        }px); }
      }
      
      .auto-scroll {
        animation: slideLeft ${speed}s linear infinite;
      }
      
      .icon-container:hover .auto-scroll {
        ${pauseOnHover ? "animation-play-state: paused;" : ""}
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [speed, pauseOnHover, autoScroll]);

  // Array de ícones de plataformas do FontAwesome
  const icons = [
    { icon: faPlaystation, label: "PlayStation" },
    { icon: faXbox, label: "Xbox" },
    { icon: faGamepad, label: "Nintendo" },
    { icon: faSteam, label: "Steam" },
    { icon: faGamepad, label: "Gamepad" },
    { icon: faGamepad, label: "Sega" },
    { icon: faTwitch, label: "Twitch" },
    { icon: faChess, label: "Chess" },
    { icon: faDice, label: "Dice" },
    { icon: faItchIo, label: "Itch.io" },
    { icon: faVrCardboard, label: "VR" },
    { icon: faHeadset, label: "Headset" },
    { icon: faWindows, label: "Windows" },
    { icon: faDesktop, label: "Desktop" },
    { icon: faMobile, label: "Mobile" },
    { icon: faDiscord, label: "Discord" },
    { icon: faGooglePlay, label: "Google Play" },
    { icon: faApple, label: "Apple" },
    { icon: faAndroid, label: "Android" },
    { icon: faLinux, label: "Linux" },
    { icon: faChessKnight, label: "Chess Knight" },
    { icon: faChessRook, label: "Chess Rook" },
    { icon: faChessQueen, label: "Chess Queen" },
    { icon: faChessPawn, label: "Chess Pawn" },
    { icon: faRobot, label: "Robot" },
    { icon: faChessBoard, label: "Chess Board" },
    { icon: faGhost, label: "Pacman" },
    { icon: faFire, label: "Arcade" },
    { icon: faPuzzlePiece, label: "Puzzle" },
    { icon: faTrophy, label: "Trophy" },
    { icon: faUserNinja, label: "Ninja" },
    { icon: faFistRaised, label: "Fighter" },
    { icon: faFootballBall, label: "Football" },
    { icon: faBasketballBall, label: "Basketball" },
    { icon: faVolleyballBall, label: "Volleyball" },
    { icon: faTableTennis, label: "Table Tennis" },
    { icon: faJava, label: "Java" },
    { icon: faHatWizard, label: "RPG" },
  ];

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current || autoScroll) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    // Mostrar/esconder setas com base na posição de rolagem (apenas quando não está em autoScroll)
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <div className="w-full overflow-hidden py-8 icon-container bg-gray-900/30 backdrop-blur-sm border-y border-gray-800 relative">
      <div className="">
        {/* Gradient left overlay que cobre 100% da altura */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-black to-transparent h-full"></div>

        {/* Botão de seta esquerda (apenas quando autoScroll=false) */}
        {!autoScroll && showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-gray-800/50 rounded-full border border-gray-700 hover:border-[#ff0884] flex items-center justify-center text-white hover:text-[#ff0884] transition-all duration-300"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}

        {/* Container de ícones com scroll alternado */}
        <div className="w-full overflow-hidden">
          <div
            ref={scrollRef}
            className={`flex py-8 ${
              autoScroll ? "auto-scroll" : "overflow-x-auto scrollbar-hide"
            }`}
            onScroll={handleScroll}
          >
            <div className="flex-shrink-0 flex flex-nowrap icon-wrapper">
              {icons.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 flex items-center justify-center mx-5 transform transition-transform duration-300 hover:scale-125"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gray-800/50 rounded-xl border border-gray-700 hover:border-[#ff0884]/50 shadow-lg hover:shadow-[0_0_15px_rgba(255,8,132,0.2)] transition-all duration-300">
                    <FontAwesomeIcon
                      icon={item.icon}
                      className="text-[#ff0884] w-8 h-8 md:w-10 md:h-10"
                    />
                    <span className="sr-only">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botão de seta direita (apenas quando autoScroll=false) */}
        {!autoScroll && showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-gray-800/50 rounded-full border border-gray-700 hover:border-[#ff0884] flex items-center justify-center text-white hover:text-[#ff0884] transition-all duration-300"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}

        {/* Gradient right overlay que cobre 100% da altura */}
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-black to-transparent h-full"></div>
      </div>

      <style jsx global>{`
        /* Ocultar a barra de rolagem */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Animação de ida e volta (bounce) para o auto-scroll */
        .auto-scroll {
          display: flex;
          flex-wrap: nowrap;
          animation: bounceScroll ${speed}s ease-in-out infinite alternate;
          width: max-content;
        }

        .icon-wrapper {
          flex-shrink: 0;
        }

        @keyframes bounceScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% + 100vw));
          }
        }

        .icon-container:hover .auto-scroll {
          ${pauseOnHover ? "animation-play-state: paused;" : ""}
        }
      `}</style>
    </div>
  );
}
