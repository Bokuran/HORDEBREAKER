# Проверки и регрессии

Node.js 22 — версия CI. Runtime не требует npm. Для браузерных тестов нужен Playwright и установленный Google Chrome (`channel: 'chrome'`); зависимости тестов не коммитить.

```powershell
node --version
# Синтаксис (PowerShell, корень проекта)
Get-ChildItem js,config,tests -Recurse -File | Where-Object { $_.Extension -in '.js','.mjs' } | ForEach-Object { node --check $_.FullName; if ($LASTEXITCODE -ne 0) { throw "Syntax: $($_.FullName)" } }
node tests/sanity.mjs
# Однократно, если Playwright отсутствует
npm install --no-save --package-lock=false playwright@1.51.1
```

| Задача | Целевые команды (node tests/...) |
|---|---|
| Основная логика, конфиг, сохранения, лут, ресурсы | sanity.mjs |
| XP, классы, heavy, UID, миграция, автоэкипировка | balance-equipment.mjs |
| Баланс босса, контрольные сборки и seed | balance-simulation.mjs (Chrome) |
| UI, карта, магазин, графика, desktop/mobile | browser.mjs (Chrome) |
| Строй, контакт ближников и FPS | formation.mjs, monster-contact.mjs (Chrome) |
| Поход, повтор, волны, переходы, reduced motion | journey.mjs (Chrome) |
| Базовые атаки, навыки, FX, очистка, reduced motion | effects.mjs (Chrome) |

## Лестница проверки
Воспроизвести → целевая регрессия → минимальный фикс → целевая проверка → sanity перед готовностью → релевантные Chrome-тесты → ручная проверка → CI после разрешённого push. CI выполняет sanity и browser; Pages отдельно проверяет syntax/sanity, затем публикацию. Остальные сценарии запускай по области задачи.

## Ручные критические сценарии
- Чистый старт, старое/повреждённое сохранение, отказ localStorage, повторный импорт в тестовом профиле; не трогать данные основного браузера.
- Отряд 1 и 4, резерв, дальники на широкой сцене, босс, ×1 и ×3, повтор/переход волны, фактический HP.
- Полная сумка, смена и снятие вещей, классовый лут, future gear, автопродажа off/spare, золото ровно один раз.
- 390/1900 px, select/option, клавиатура, досье, обменник, отсутствие 404 и JS-ошибок, прозрачность иконок.

Если CI красный: читай первый failing assertion и источник; не отключай проверку. Исторический пример — неиспользуемые barbarian_placeholder.svg и druid_placeholder.svg; если снова появятся, сначала подтвердить, что их не использует конфиг. Отчёт: команда, PASS/FAIL/NOT RUN, причина и следующий шаг.
