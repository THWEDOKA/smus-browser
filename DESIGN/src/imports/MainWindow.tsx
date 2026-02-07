import svgPaths from "./svg-334w2an2at";

function Background() {
  return (
    <div className="absolute h-[1399px] left-[-283px] top-[50px] w-[2551px]" data-name="Background">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2551 1399">
        <g id="Background">
          <rect fill="url(#paint0_linear_3_116)" height="1030" id="Rectangle 1" width="1920" x="283" />
          <circle cx="1830" cy="1017" fill="url(#paint1_linear_3_116)" id="Ellipse 1" r="325" />
          <circle cx="740" cy="1074" fill="url(#paint2_linear_3_116)" id="Ellipse 3" r="325" />
          <circle cx="325" cy="386" fill="url(#paint3_linear_3_116)" id="Ellipse 2" r="325" />
          <circle cx="2226" cy="367" fill="url(#paint4_linear_3_116)" id="Ellipse 4" r="325" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_3_116" x1="1243" x2="1243" y1="0" y2="1030">
            <stop offset="0.856815" stopColor="#7C7C7C" />
            <stop offset="0.861949" stopColor="#E2E2E2" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_3_116" x1="2028" x2="1182" y1="645" y2="1293">
            <stop stopColor="#32463D" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_3_116" x1="938" x2="92" y1="702" y2="1350">
            <stop stopColor="#32463D" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_3_116" x1="763.5" x2="-1260" y1="689.5" y2="-101.5">
            <stop stopColor="#32463D" />
            <stop offset="0.588883" stopColor="#D8DCDA" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_3_116" x1="2424" x2="1578" y1="-5.00003" y2="643">
            <stop stopColor="#32463D" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="absolute contents left-[715px] text-white top-[318px]" data-name="Logo">
      <p className="absolute font-['Jersey_20:Regular',sans-serif] leading-[normal] left-[824px] not-italic text-[128px] top-[318px]">SMUS</p>
      <p className="absolute font-['Montserrat:Thin',sans-serif] font-thin leading-[normal] left-[731px] text-[24px] top-[431px]">Браузер с открытым исходным кодом</p>
      <p className="absolute font-['Montserrat:Thin',sans-serif] font-thin leading-[0] left-[816px] text-[24px] top-[486px]">
        <span className="leading-[normal]">{`Создатель `}</span>
        <span className="font-['Montserrat:Black',sans-serif] font-black leading-[normal]">THWEDOKA</span>
      </p>
      <p className="absolute font-['Montserrat:Thin',sans-serif] font-thin leading-[normal] left-[715px] text-[24px] top-[457px]">Самый крутой, удобный и защищенный!</p>
    </div>
  );
}

function Search() {
  return (
    <div className="absolute contents left-[715px] top-[540px]" data-name="Search">
      <div className="absolute bg-[#d9d9d9] border border-black border-solid h-[70px] left-[715px] rounded-[68px] top-[540px] w-[490px]" data-name="Rounded rectangle" />
      <p className="absolute font-['Montserrat:ExtraLight',sans-serif] font-extralight leading-[normal] left-[731px] text-[20px] text-black top-[563px]">Введите ваш запрос...</p>
      <p className="absolute font-['Montserrat:Medium',sans-serif] font-medium leading-[normal] left-[788px] text-[15px] text-white top-[635px]">Все данные защищены и никуда не уходят!</p>
    </div>
  );
}

function LogoAndSearch() {
  return (
    <div className="absolute contents left-[715px] top-[318px]" data-name="logoAndSearch">
      <Logo />
      <Search />
    </div>
  );
}

function CarbonNextFilled({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[25px]"} data-name="carbon:next-filled">
      <div className="absolute inset-[6.25%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.875 21.875">
          <path d={svgPaths.p32bb2800} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-1/4" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function CarbonNextFilled1() {
  return (
    <div className="absolute left-[48px] size-[25px] top-[13px]" data-name="carbon:next-filled">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="carbon:next-filled">
          <path d={svgPaths.p38842880} fill="var(--fill-0, black)" id="Vector" />
          <g id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function MdiReload({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[79px] size-[24px] top-[13px]"} data-name="mdi:reload">
      <div className="absolute inset-[12.5%_4.17%_12.5%_8.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 18">
          <path d={svgPaths.p1d70e200} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function PageManage() {
  return (
    <div className="absolute contents left-[11px] top-[9px]" data-name="PageManage">
      <div className="absolute bg-[#7c7c7c] h-[32px] left-[11px] rounded-[30px] top-[9px] w-[100px]" />
      <div className="absolute flex items-center justify-center left-[17px] size-[25px] top-[13px]">
        <div className="-scale-y-100 flex-none rotate-180">
          <CarbonNextFilled />
        </div>
      </div>
      <CarbonNextFilled1 />
      <MdiReload />
    </div>
  );
}

function CarbonCloseFilled({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[1885px] size-[25px] top-[13px]"} data-name="carbon:close-filled">
      <div className="absolute inset-[6.25%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.875 21.875">
          <path d={svgPaths.p37777b80} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function PixelarticonsHome({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[132px] size-[24px] top-[13px]"} data-name="pixelarticons:home">
      <div className="absolute inset-[16.67%_20.83%_20.83%_16.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
          <path d={svgPaths.p187e1f90} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function SiCloseFill({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[267px] size-[15px] top-[18px]"} data-name="si:close-fill">
      <div className="absolute inset-[28.1%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.56911 6.56911">
          <path d={svgPaths.p32664900} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function TabMain() {
  return (
    <div className="absolute contents left-[127px] top-[10px]" data-name="tab main">
      <div className="absolute bg-[#d9d9d9] h-[30px] left-[127px] rounded-[30px] top-[10px] w-[170px]" />
      <p className="absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[156px] text-[12px] text-black top-[17px]">Главная страница</p>
      <PixelarticonsHome />
      <SiCloseFill />
    </div>
  );
}

function LucidePlus({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[304px] size-[24px] top-[13px]"} data-name="lucide:plus">
      <div className="absolute inset-[20.83%]" data-name="Vector">
        <div className="absolute inset-[-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d="M1 8H15M8 1V15" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function WidgetTabsFavorite() {
  return (
    <div className="absolute contents left-[692px] top-[657px]" data-name="widgetTabsFavorite">
      <div className="absolute bg-white h-[208px] left-[692px] rounded-[30px] top-[657px] w-[535px]" />
      <p className="absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[897px] text-[12px] text-black top-[844px]">Избранные вкладки</p>
    </div>
  );
}

function TabFavorite5() {
  return (
    <div className="absolute contents left-[718px] top-[680px]" data-name="tabFavorite6">
      <div className="absolute bg-[#d9d9d9] left-[718px] rounded-[20px] size-[70px] top-[680px]" />
      <p className="absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[735px] text-[12px] text-black top-[707px]">Пусто</p>
    </div>
  );
}

function TabFavorite4() {
  return (
    <div className="absolute contents left-[799px] top-[680px]" data-name="tabFavorite5">
      <div className="absolute bg-[#d9d9d9] left-[799px] rounded-[20px] size-[70px] top-[680px]" />
      <p className="absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[816px] text-[12px] text-black top-[707px]">Пусто</p>
    </div>
  );
}

function TabFavorite3() {
  return (
    <div className="absolute contents left-[880px] top-[680px]" data-name="tabFavorite4">
      <div className="absolute bg-[#d9d9d9] left-[880px] rounded-[20px] size-[70px] top-[680px]" />
      <p className="absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[897px] text-[12px] text-black top-[707px]">Пусто</p>
    </div>
  );
}

function TabFavorite2() {
  return (
    <div className="absolute contents left-[961px] top-[680px]" data-name="tabFavorite3">
      <div className="absolute bg-[#d9d9d9] left-[961px] rounded-[20px] size-[70px] top-[680px]" />
      <p className="absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[978px] text-[12px] text-black top-[707px]">Пусто</p>
    </div>
  );
}

function TabFavorite1() {
  return (
    <div className="absolute contents left-[1042px] top-[680px]" data-name="tabFavorite2">
      <div className="absolute bg-[#d9d9d9] left-[1042px] rounded-[20px] size-[70px] top-[680px]" />
      <p className="absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[1059px] text-[12px] text-black top-[707px]">Пусто</p>
    </div>
  );
}

function TabFavorite() {
  return (
    <div className="absolute contents left-[1123px] top-[680px]" data-name="tabFavorite1">
      <div className="absolute bg-[#d9d9d9] left-[1123px] rounded-[20px] size-[70px] top-[680px]" />
      <p className="absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[1140px] text-[12px] text-black top-[707px]">Пусто</p>
    </div>
  );
}

function TabsFavorite() {
  return (
    <div className="absolute contents left-[692px] top-[657px]" data-name="TabsFavorite">
      <WidgetTabsFavorite />
      <TabFavorite5 />
      <TabFavorite4 />
      <TabFavorite3 />
      <TabFavorite2 />
      <TabFavorite1 />
      <TabFavorite />
    </div>
  );
}

function MaterialSymbolsSettingsRounded({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[1854px] size-[25px] top-[13px]"} data-name="material-symbols:settings-rounded">
      <div className="absolute inset-[8.33%_12.33%_8.33%_8.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.8333 20.8333">
          <path d={svgPaths.p143f2a00} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

export default function MainWindow() {
  return (
    <div className="bg-[#32463d] overflow-clip relative rounded-[30px] size-full" data-name="Main window">
      <Background />
      <LogoAndSearch />
      <PageManage />
      <CarbonCloseFilled />
      <TabMain />
      <LucidePlus />
      <TabsFavorite />
      <MaterialSymbolsSettingsRounded />
      <div className="absolute flex h-[50px] items-center justify-center left-[119px] top-0 w-0" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "154" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[50px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 1">
                <line id="Line 1" stroke="var(--stroke-0, black)" x2="50" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[50px] items-center justify-center left-[1843px] top-0 w-0" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "154" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[50px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 1">
                <line id="Line 1" stroke="var(--stroke-0, black)" x2="50" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}