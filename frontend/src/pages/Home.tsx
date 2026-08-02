import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fotoCasal from '../assets/ZVE00227.jpg';
import Nome from '../assets/nom.svg?react';
import Maos from '../assets/ZVE00339.jpg'

export function Home() {
  // Configuração do Contador (Ajuste para a data real)
  const targetDate = new Date('2026-10-17T16:00:00').getTime();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // SVG para simular a borda de papel rasgado (Torn Paper Effect)
  const TornPaperEdge = ({ className = "" }) => (
    <div className={`w-full overflow-hidden leading-none ${className}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-[200%] md:w-full h-[20px] md:h-[30px]">
        <path d="M0,0 V46.29 c47.79,22.2,103.59,32.15,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#f8f5f0"></path>
        <path d="M0,0 V15.81 C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#f8f5f0"></path>
        <path d="M0,0 V5.63 C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#f8f5f0"></path>
      </svg>
    </div>
  );

  return (
    <div className="bg-paper min-h-screen text-textMain font-serif font-medium selection:bg-olive selection:text-white">
      
      {/* 1. HERO SECTION (Foto com Gradiente Escuro na base) */}
      <section className="relative w-full h-[75vh] flex flex-col justify-end items-center text-white text-center">
        {/* Imagem de Fundo - Substitua a URL */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url(${fotoCasal})` }}
        />
        {/* Gradiente para garantir leitura do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

        <div className="relative z-20 pb-16 flex flex-col items-center">
          <p className="tracking-[0.2em] text-xs uppercase mb-2 opacity-90">Vamos nos casar</p>

          <Nome className="w-64 h-9 md:w-96 md:h-16 text-white" />
          
          <p className="tracking-[0.2em] text-sm mt-4">17.10.2026</p>
          
          {/* Folhinhas decorativas (Divider) */}
          <div className="mt-4 flex items-center gap-2 opacity-70">
            <span className="h-[1px] w-8 bg-white" />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13V8a2 2 0 0 1 2-2h5a7 7 0 0 1 7 7v5a2 2 0 0 1-2 2h-5Z"/><path d="M11 20v-9"/></svg>
            <span className="h-[1px] w-8 bg-white" />
          </div>
        </div>

        {/* Recorte do papel posicionado exatamente no fim da imagem */}
        <div className="absolute bottom-0 left-0 w-full z-30 transform rotate-180">
          <TornPaperEdge />
        </div>
      </section>

      {/* 2. CONTADOR REGRESSIVO */}
      <section className="py-12 px-6 max-w-md mx-auto text-center">
        <div className="flex justify-between items-center border-b border-[#e2dec6] pb-8 mb-8">
          <div className="flex flex-col items-center">
            <span className="text-4xl">{timeLeft.days}</span>
            <span className="text-[10px] tracking-widest uppercase text-gray-500 mt-1">Dias</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl">{timeLeft.hours}</span>
            <span className="text-[10px] tracking-widest uppercase text-gray-500 mt-1">Horas</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl">{timeLeft.minutes}</span>
            <span className="text-[10px] tracking-widest uppercase text-gray-500 mt-1">Minutos</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl">{timeLeft.seconds}</span>
            <span className="text-[10px] tracking-widest uppercase text-gray-500 mt-1">Segundos</span>
          </div>
        </div>

        {/* 3. NOSSA HISTÓRIA */}
        <div className="text-center mt-12 mb-16">
           {/* Ícone Minimalista */}
           <svg className="w-10 h-10 mx-auto mb-4 stroke-olive" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          <h2 className="text-2xl italic mb-4">Nossa História</h2>
          <p className="text-sm leading-relaxed text-gray-600 px-4">
            Há 8 anos, nossos caminhos se cruzaram e nossa história de amor começou.
            Éramos adolescentes, cheios de sonhos, aprendizados e muitas descobertas pela frente. Crescemos juntos, enfrentamos desafios, comemoramos conquistas e aprendemos que o amor vai muito além dos sentimentos dos primeiros dias.
            Descobrimos que amar é escolher um ao outro todos os dias. É ter paciência, parceria, respeito e a vontade de fazer dar certo, mesmo quando a vida apresenta obstáculos.
            Foi esse amor que nos trouxe até aqui.
            Agora, chegou o momento de dar o passo mais importante da nossa caminhada: unir nossas vidas e iniciar oficialmente a nossa família.
            Nada faria esse dia mais especial do que celebrar esse momento ao lado das pessoas que amamos.
            Esperamos vocês para compartilhar nossa alegria, criar novas lembranças e comemorar o início deste novo capítulo da nossa história.
          </p>
        </div>
        
        {/* Pequeno separador com ícone floral */}
        <div className="flex items-center justify-center gap-4 mb-16 text-[#c4bca2]">
          <span className="h-[1px] w-12 bg-[#e2dec6]" />
          <span>⋈</span>
          <span className="h-[1px] w-12 bg-[#e2dec6]" />
        </div>

        <div className="w-screen ml-[calc(50%-50vw)] relative flex mb-16 mt-8">
          
          <div className="absolute top-0 left-0 w-full z-10">
            <TornPaperEdge />
          </div>

          <img src={Maos} alt="Maos" className="w-full block object-cover" />

          <div className="absolute bottom-0 left-0 w-full z-10 transform rotate-180">
            <TornPaperEdge />
          </div>
          
        </div>

        {/* 4. LISTA DE PRESENTES */}
        <div className="mb-16">
          <svg className="w-12 h-12 mx-auto mb-4 stroke-textMain" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="14" rx="2" />
            <path d="M12 5a3 3 0 1 0-3 3" />
            <path d="M15 8a3 3 0 1 0-3-3" />
            <path d="M12 5v3" />
            <line x1="12" y1="8" x2="12" y2="22" />
          </svg>
          <h3 className="text-2xl italic mb-2">Lista de Presentes</h3>
          <p className="text-xs tracking-widest uppercase text-gray-500 mb-6">Ajude-nos a construir nosso lar</p>
          <Link 
            to="/presentes" 
            className="inline-block bg-olive text-white tracking-widest text-xs uppercase py-3 px-8 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-sm"
          >
            Ver Presentes
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 mb-16 text-[#c4bca2]">
          <span className="h-[1px] w-12 bg-[#e2dec6]" />
          <span>⋈</span>
          <span className="h-[1px] w-12 bg-[#e2dec6]" />
        </div>

        {/* 5. CONFIRMAÇÃO DE PRESENÇA (RSVP) */}
        <div className="mb-8">
          <svg className="w-12 h-12 mx-auto mb-4 stroke-textMain" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h3 className="text-2xl italic mb-2">Presença</h3>
          <p className="text-xs tracking-widest uppercase text-gray-500 mb-6">Por favor, confirme até 17.10.2026</p>
          <Link 
            to="/rsvp" 
            className="inline-block bg-olive text-white tracking-widest text-xs uppercase py-3 px-8 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-sm"
          >
            Confirmar Presença
          </Link>
        </div>
      </section>

    </div>
  );
}