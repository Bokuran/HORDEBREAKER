# Карта проекта HORDEBREAKER

Снимок GitHub: `Bokuran/HORDEBREAKER`, `main`, `5e7e1028243245f6cf6b8325c1ab8bebe7f9bc0f`, 24.11.2026. Локальная ветка может отличаться. README, BALANCE_V40 и assets/README содержат исторические сведения; текущий код и BALANCE_V55 имеют приоритет. Не переписывать их ради комплекта.

| Файл | Ответственность |
|---|---|
| `index.html`, `js/boot.js` | Статическая точка входа, порядок скриптов, версии URL, инициализация namespace |
| `config/balance.js` | Числа прогрессии, врагов, экономики, XP, лимитов, Атласа, реликвий |
| `config/heroes.js` | 8 классов, роли, дальность, характеристики, спрайты |
| `config/items.js` | 20 стандартных типов предметов, слоты, 6 редкостей, классы, heavy, art |
| `config/monsters.js`, `config/levels.js` | 80 кампанийных врагов, 40 боссов, 20 зон, первичные и резервные изображения, гербы |
| `config/expansion.js` | Дополнительная конфигурация; проверить содержимое перед расширением |
| `js/core.js` | Состояние T.S, загрузка/сохранение, экономика, T.items, T.derived, T.waves, миграция, загрузка спрайтов |
| `js/autoequip.js` | Автоматический подбор снаряжения и оценка кандидатов |
| `js/battle-base.js` | T.battleState, bx, координаты, цели, общая обработка урона/лечения, фон |
| `js/battle.js` | Волна, update/render, движение, атаки, снаряды, появление/смерть врагов, награды |
| `js/battle-skills.js` | Классовые и боссовые навыки и эффекты статусов |
| `js/battle-fx.js`, `js/battle-draw.js` | Canvas-эффекты и отрисовка героев/врагов/сцены |
| `js/ui.js`, `css/style.css` | Карточки, вкладки, карта, инвентарь, лагерь, модалки, адаптивность |
| `js/audio.js`, `js/audio-ui.js` | Web Audio, музыка, OGG, настройки и резервный звук |
| `js/savetools.js` | Экспорт/импорт, ручные слоты, резервные копии, восстановление |
| `js/main.js` | T.load → battle.init → ui.init → wave; RAF, visibility, resize, автосохранение, offline |
| `tests/*.mjs` | Node и Playwright, см. TESTING.md |
| `.github/workflows/ci.yml`, `static.yml` | CI и публикация Pages; не создавать дубликаты |

## Потоки и границы
Конфиг → core/derived → battle/update → события → UI/FX → save. `window.TBH` объединяет модули без import runtime; порядок в index.html важен. `T.S` — долговечное состояние, `T.battleState` — состояние текущего боя. `js/main.js` вызывает update с игровым dt, render и UI tick примерно каждые 0,15 с; видимость вкладки регулирует работу и офлайн-награду. Не считай это разрешением менять архитектуру.

## Навигация
Баг дальника: battle + base → skills при необходимости; лут: core + autoequip; визуальное: UI или draw/fx; числовой баланс: config/balance → реальные формулы; миграция: core/savetools. Читай только связанные участки. Поиск `rg` или Select-String, не сканируй бинарники.
