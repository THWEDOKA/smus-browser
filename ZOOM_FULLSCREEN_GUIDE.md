# Zoom & Fullscreen Guide

## Zoom функциональность (Ctrl + Колесико)

### Как использовать
- **Увеличить масштаб**: Зажми `Ctrl` (или `Cmd` на Mac) + прокрути колесико **вверх**
- **Уменьшить масштаб**: Зажми `Ctrl` (или `Cmd` на Mac) + прокрути колесико **вниз**

### Особенности
- Диапазон масштабирования: **0.3x** (30%) до **3.0x** (300%)
- Каждый скролл изменяет масштаб на **10%**
- Масштаб сохраняется **для каждого сайта отдельно**
- Работает на **любых сайтах** (включая YouTube, Google, и т.д.)
- Нет ограничений от Content Security Policy (CSP)

### Как это работает
1. Пользователь нажимает Ctrl + скроллит колесико
2. Electron `before-input-event` ловит это действие
3. Вычисляется новый уровень zoom
4. `setZoomFactor()` применяет новый масштаб к BrowserView
5. Отправляется IPC событие `tab-zoom-changed` в React

### Технические детали
- **Файл**: `electron/main.ts` (lines 272-299)
- **Event**: `before-input-event` на webContents
- **Проверка**: Если `input.control` или `input.meta` И `input.type === 'mouseWheel'`
- **DeltaY**:
  - `> 0` = вверх = zoom in
  - `< 0` = вниз = zoom out

---

## Fullscreen функциональность

### Автоматическое скрывание панели
Когда вы входите в полноэкранный режим (например YouTube плеер):
- **Топ-панель** (с вкладками) исчезает
- **Адресная строка** скрывается
- **Переходы** плавные (анимация 300ms)

При выходе из fullscreen:
- **Все элементы** вернутся обратно

### Поддерживаемые типы fullscreen
- HTML5 Video Fullscreen (YouTube, Vimeo, etc.)
- HTML5 Element Fullscreen API
- Любые приложения/видеоплеры использующие эти API

### Как это работает
1. Видеоплеер инициирует HTML5 fullscreen
2. Electron ловит `enter-html-full-screen` событие
3. Отправляет IPC событие `enter-fullscreen` в React
4. React обновляет state и скрывает UI
5. При выходе - `leave-html-full-screen` срабатывает
6. React показывает UI снова

### Технические детали

**Backend** (`electron/main.ts`):
```typescript
view.webContents.on('enter-html-full-screen', () => {
  mainWindow?.webContents.send('enter-fullscreen', { tabId });
});

view.webContents.on('leave-html-full-screen', () => {
  mainWindow?.webContents.send('leave-fullscreen', { tabId });
});
```

**Frontend** (`src/App.tsx`):
```typescript
const [fullscreenTabId, setFullscreenTabId] = useState<number | null>(null);

window.electron.onEnterFullscreen((data) => {
  setFullscreenTabId(data.tabId);
});

window.electron.onLeaveFullscreen((data) => {
  setFullscreenTabId(null);
});
```

**UI Hiding**:
- Title Bar: `className={fullscreenTabId ? 'opacity-0 pointer-events-none h-0' : 'opacity-100'}`
- Address Bar: То же самое

---

## Примеры использования

### Пример 1: Просмотр YouTube видео в fullscreen
1. Откройте YouTube в браузере
2. Найдите видео
3. Нажмите на кнопку fullscreen в плеере
4. Топ-панель автоматически исчезнет
5. Нажмите ESC или нажмите кнопку exit fullscreen чтобы вернуться

### Пример 2: Zoom на странице
1. Откройте любой сайт (например Google)
2. Держите Ctrl и скроллите колесико вверх - текст увеличивается
3. Держите Ctrl и скроллите колесико вниз - текст уменьшается
4. Zoom сохраняется для этого сайта
5. При открытии нового сайта - zoom будет 100% (по умолчанию)

---

## Клавиатурные команды

| Команда | Действие |
|---------|----------|
| `Ctrl + Scroll Up` | Увеличить масштаб |
| `Ctrl + Scroll Down` | Уменьшить масштаб |
| `Cmd + Scroll Up` (Mac) | Увеличить масштаб |
| `Cmd + Scroll Down` (Mac) | Уменьшить масштаб |
| `F` (в плеере) | Fullscreen |
| `ESC` | Выход из fullscreen |

---

## Troubleshooting

### Zoom не работает
- Убедитесь что используете **Ctrl** (Windows/Linux) или **Cmd** (Mac)
- Убедитесь что скроллите **колесико мыши**, не трекпадом
- Попробуйте обновить страницу (F5)

### Fullscreen не скрывает панель
- Убедитесь что используете **HTML5 fullscreen** (нажимая кнопку в плеере)
- Проверьте консоль (F12) на ошибки
- Попробуйте другой плеер (YouTube, Vimeo, HTML5 video)

### Zoom слишком агрессивный
- Каждый скролл = 10%, это намеренно
- Если нужно точнее - скроллите медленнее/осторожнее
- Или используйте стандартный браузерный zoom (может добавиться позже)

---

## Будущие улучшения

Возможные добавления:
- [ ] Кнопки zoom в UI (+ и - кнопки)
- [ ] Сброс zoom на Ctrl+0
- [ ] Сохранение zoom уровня между сеансами
- [ ] Клавиши с цифрами для точного zoom (Ctrl+1, Ctrl+2, и т.д.)
- [ ] Индикатор текущего zoom уровня (например "110%")
