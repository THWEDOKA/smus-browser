import { RefreshCw, Home, AlertTriangle, WifiOff, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
  errorType: 'connection' | 'dns' | 'blocked' | 'timeout' | 'unknown';
  url: string;
  onRetry: () => void;
  onGoHome: () => void;
}

const errorMessages = {
  connection: {
    title: 'Нет подключения к интернету',
    subtitle: 'SMUS не удалось установить соединение с этим сайтом.',
    icon: WifiOff,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  dns: {
    title: 'Сайт не найден',
    subtitle: 'DNS-адрес сайта не может быть определён. Возможно, сайт был удалён или вы ввели неправильный адрес.',
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  blocked: {
    title: 'Доступ заблокирован',
    subtitle: 'Этот сайт был заблокирован или недоступен в вашей сети.',
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  timeout: {
    title: 'Время ожидания истекло',
    subtitle: 'Слишком долгий ответ от сервера. Попробуйте обновить страницу.',
    icon: RefreshCw,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  unknown: {
    title: 'Ошибка загрузки страницы',
    subtitle: 'При загрузке страницы произошла неизвестная ошибка.',
    icon: AlertTriangle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  },
};

function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full opacity-20 animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            backgroundColor: '#ffffff',
          }}
        />
      ))}
    </div>
  );
}

function AnimatedIcon({ icon: Icon, color }: { icon: typeof WifiOff; color: string }) {
  return (
    <div className="relative">
      <div className={`w-32 h-32 rounded-full ${color.replace('text-', 'bg-')}/20 flex items-center justify-center animate-pulse-glow`}>
        <Icon className={`w-16 h-16 ${color}`} />
      </div>
      <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-current opacity-20 animate-ripple" style={{ color: 'inherit' }} />
      <div className="absolute inset-2 w-28 h-28 rounded-full border border-current opacity-10 animate-ripple delay-75" style={{ color: 'inherit' }} />
    </div>
  );
}

export default function ErrorPage({ errorType, url, onRetry, onGoHome, onSearch }: ErrorPageProps) {
  const error = errorMessages[errorType];
  const Icon = error.icon;

  return (
    <div
      className="relative w-full h-full bg-[#32463d] flex flex-col items-center justify-center p-8 overflow-hidden z-[9999]"
      style={{ pointerEvents: 'auto' }}
    >
      <ParticleBackground />

      <div
        className="relative z-[10000] flex flex-col items-center max-w-lg text-center animate-fade-in-up"
        style={{ pointerEvents: 'auto' }}
      >
        <AnimatedIcon icon={Icon} color={error.color} />

        <h1 className="mt-8 text-4xl font-bold text-white mb-2 animate-slide-in-bottom" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {error.title}
        </h1>

        <p className="text-white/80 text-lg mb-8 font-light animate-slide-in-bottom delay-100">
          {error.subtitle}
        </p>

        <div className={`p-4 rounded-xl ${error.bgColor} border ${error.borderColor} mb-8 w-full max-w-md animate-slide-in-bottom delay-200`}>
          <p className="text-white/60 text-sm break-all font-mono">{url}</p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center animate-slide-in-bottom delay-300">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/30 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
            Попробовать снова
          </button>

          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/30 transition-all hover:scale-105 active:scale-95"
          >
            <Home className="w-5 h-5" />
            На главную
          </button>
        </div>

        <div className="mt-12 w-full max-w-md animate-slide-in-bottom delay-500">
          <p className="text-white/50 text-sm mb-3">Или введите новый адрес в адресной строке выше и нажмите Enter</p>
        </div>

        <div className="mt-8 flex items-center gap-2 text-white/40 text-sm animate-fade-in delay-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Или проверьте адрес и нажмите Enter в адресной строке</span>
        </div>
      </div>

      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
          }
          50% {
            box-shadow: 0 0 30px currentColor, 0 0 60px currentColor;
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-bottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-float-particle {
          animation: float-particle 10s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-ripple {
          animation: ripple 2s ease-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .delay-75 {
          animation-delay: 0.75s;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}
