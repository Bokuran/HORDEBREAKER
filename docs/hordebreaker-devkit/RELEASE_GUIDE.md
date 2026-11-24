# Безопасный релиз (VS Code + GitHub Pages)

Локальный `E:\Projects\HORDEBREAKER` — основной рабочий проект. Репозиторий `https://github.com/Bokuran/HORDEBREAKER`; сайт `https://bokuran.github.io/HORDEBREAKER/`. Перед работой `git status --short`, `git remote -v`, `git branch --show-current`. Не стирай историю и не форсируй push. Если есть чужие изменения — сначала разберись, не откатывай их.

1. Отдельная ветка при большом изменении, например `git switch -c fix/ranged-targeting` (после проверки дерева). Малые задачи можно вести по согласованной стратегии. `git diff --stat`, `git diff`, проверить ассеты, сохранения, тесты и актуальные URL версий.
2. Обнови CHANGELOG.md только по реальным изменениям. Укажи известные ограничения и миграцию. Для JS/CSS/изображений, если нужно, увеличь соответствующие версии кеша в index/рендерере, не обязательно все сразу.
3. После разрешения на commit — `git add <конкретные пути>`, `git diff --cached`, `git commit -m "..."`. Пользователь явно разрешает push отдельно. `git push` только для проверенной ветки с upstream; впервые `git push -u origin <ветка>`.
4. CI `.github/workflows/ci.yml`: syntax, sanity, Chrome. Pages `.github/workflows/static.yml`: test → deploy. Pages Source = GitHub Actions; файл уже существует, не создавать дубль. Если репозиторий пересоздан, настройку Pages надо восстановить.
5. Проверить `Actions` для нужного commit SHA, статус CI и публикации отдельно; зелёный CI не доказывает Pages. После публикации Ctrl+F5 и ручной smoke test сайта. Не заявляй успех без проверки.

Откат опубликованной правки — согласованный `git revert <SHA>` с тестами и новым релизом; не force push и не `reset --hard`. Для сохранений — экспорт и тестируемая миграция; откат кода не гарантирует отката данных. Если push отклонён, `git fetch origin` и выяснить расхождение; не переписывать историю.
