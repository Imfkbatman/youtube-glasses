YouTube Viewer for Ray-Ban Meta Display

Это версия на основе проекта LiquidAzir/youtube-viewer. Старое приложение заменено полностью: теперь в корне лежит проект с экранной клавиатурой, D-pad навигацией, поиском YouTube, историей просмотров и iframe-плеером.

Сайт:
https://imfkbatman.github.io/youtube-glasses/

Ссылка для очков с API key:
https://imfkbatman.github.io/youtube-glasses/?key=ТВОЙ_API_KEY

Что внутри:
- index.html - разметка приложения;
- app.js - логика поиска, клавиатуры, истории, голоса и плеера;
- styles.css - интерфейс 600x600 для Ray-Ban Display;
- config.js - опциональный общий API key, сейчас оставлен пустым;
- manifest.webmanifest и favicon.png - данные web app;
- scripts/make-pair-qr.py - генератор QR-ссылки с ключом.

Важно про ключ:
Не вставляй настоящий API key в app.js или config.js перед заливкой на GitHub. Это публичные файлы, GitHub снова откроет Secret Scanning alert.

Лучший вариант для очков:
Открыть сайт один раз по ссылке с ?key=... . Приложение сохранит ключ в localStorage и дальше будет искать без ручного ввода.

Если хочешь встроить общий ключ для всех:
Можно прописать его в config.js, но только после ограничения ключа в Google Cloud:
- API restrictions: только YouTube Data API v3;
- Application restrictions: Websites;
- Website restriction: https://imfkbatman.github.io/youtube-glasses/*

Голос:
Голосовой поиск работает только если WebView очков поддерживает Web Speech API. Если очки его не дают, используем экранную клавиатуру или URL-параметр ?q=запрос.
