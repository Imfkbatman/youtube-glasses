Ray-Ban Meta Display YouTube Web App

Запуск:
1. Залей папку на HTTPS-хостинг: GitHub Pages, Netlify или Vercel.
2. В Meta AI app открой Web Apps -> Connect a Web App.
3. App name: YouTube Glass
4. URL: ссылка на index.html или корень сайта.
5. Открой приложение на очках.

Что добавлено:
- поиск по ссылке, video ID и YouTube Data API;
- главная страница с live-трендами YouTube через встроенный API key;
- режим Shorts с вертикальным плеером;
- запрос fullscreen после пользовательского жеста;
- избранное и история просмотров в localStorage;
- управление D-Pad, клавиатурой и свайпами;
- подготовка Google OAuth через Google OAuth Client ID;
- голосовой поиск через Web Speech API, если WebView его поддерживает.

Настройка YouTube Data API:
API key уже встроен в app.js для удобного запуска на очках.
Если нужно заменить ключ, открой настройки приложения и вставь новый ключ в поле YouTube API key.

Настройка Google входа:
1. Создай OAuth Client ID для Web application в Google Cloud Console.
2. Добавь HTTPS-домен приложения в Authorized JavaScript origins.
3. Вставь Client ID в настройках приложения.

Ограничения:
- Google OAuth и живой YouTube API требуют проекта Google Cloud.
- Голосовой ввод зависит от WebView на очках. Если Web Speech API недоступен, можно сфокусировать поле поиска и использовать системную диктовку Meta AI.
- Приложение не устанавливает YouTube APK и не обходит ограничения YouTube.
