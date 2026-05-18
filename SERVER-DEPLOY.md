# Краткая инструкция по запуску на сервере

Рабочая схема для текущего проекта:
- домен: `botmaks.ru`
- проект на сервере: `/home/andrey/opt/disp-app`
- фронт отдается из: `/var/www/botmaks`
- backend: `FastAPI + uvicorn + systemd`
- reverse proxy: `nginx`

## 1. Что должно лежать на сервере

```text
/home/andrey/opt/disp-app/
  frontend/
    index.html
    search.html
    styles.css
    app.js
    config.js
  server/
    app.py
    requirements.txt
    users.json
    data/
      *.xlsx
    systemd/
      disp-api.service
  deploy/
    nginx/
      disp-app.conf
```

Отдельно веб-папка nginx:

```text
/var/www/botmaks/
  index.html
  search.html
  styles.css
  app.js
  config.js
```

## 2. Установить пакеты

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nginx
```

## 3. Подготовить backend

```bash
cd /home/andrey/opt/disp-app/server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 4. Обязательные переменные окружения

В `disp-api.service` должны быть заданы:

```ini
Environment="DISP_USERS_FILE=/home/andrey/opt/disp-app/server/users.json"
Environment="DISP_SESSION_SECRET=ДЛИННЫЙ_СЛУЧАЙНЫЙ_СЕКРЕТ"
Environment="DISP_SESSION_SECURE=true"
Environment="DISP_ALLOWED_ORIGINS=https://botmaks.ru,https://www.botmaks.ru"
Environment="DISP_DATA_DIR=/home/andrey/opt/disp-app/server/data"
```

### Файл пользователей

Логины и пароли лежат в отдельном файле:

```text
/home/andrey/opt/disp-app/server/users.json
```

Формат файла:

```json
{
  "users": [
    {
      "username": "operator",
      "password": "CHANGE_ME"
    },
    {
      "username": "manager",
      "password": "STRONG_PASSWORD"
    }
  ]
}
```

Чтобы добавить пользователя, достаточно дописать новую запись в массив `users`.
Чтобы отключить пользователя, удалите его из файла.

Backend перечитывает файл автоматически, поэтому отдельной правки кода не нужно. После изменения файла обычно достаточно перезапустить сервис:

```bash
sudo systemctl restart disp-api
```



## 5. Проверить API вручную

```bash
cd /home/andrey/opt/disp-app/server
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000
```

В другом окне:

```bash
curl http://127.0.0.1:8000/api/session
curl -i http://127.0.0.1:8000/api/session/check
```

Ожидаемо без входа:
- `/api/session` -> `{"authenticated": false}`
- `/api/session/check` -> `401 Unauthorized`

Если все хорошо, остановить `uvicorn` через `Ctrl+C`.

## 6. Подключить systemd

Скопировать сервис:

```bash
sudo cp /home/andrey/opt/disp-app/server/systemd/disp-api.service /etc/systemd/system/disp-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now disp-api
sudo systemctl status disp-api --no-pager
```

Проверка:

```bash
curl http://127.0.0.1:8000/api/session
```

## 7. Подготовить фронт для nginx

```bash
sudo mkdir -p /var/www/botmaks
sudo cp -r /home/andrey/opt/disp-app/frontend/* /var/www/botmaks/
sudo chown -R www-data:www-data /var/www/botmaks
```

## 8. Подключить nginx

Скопировать конфиг:

```bash
sudo cp /home/andrey/opt/disp-app/deploy/nginx/disp-app.conf /etc/nginx/sites-available/disp-app.conf
sudo ln -sf /etc/nginx/sites-available/disp-app.conf /etc/nginx/sites-enabled/disp-app.conf
sudo sed -i '1s/^\xEF\xBB\xBF//' /etc/nginx/sites-available/disp-app.conf
sudo nginx -t
sudo systemctl reload nginx
```


## 9. Обновление фронта после правок

После изменений в `frontend/`:

```bash
sudo cp -r /home/andrey/opt/disp-app/frontend/* /var/www/botmaks/
sudo chown -R www-data:www-data /var/www/botmaks
sudo systemctl reload nginx
```

Если браузер показывает старую версию, сделать жесткое обновление: `Ctrl + F5`.

## 10. Обновление backend после правок

После изменений в `server/app.py` или зависимостях:

```bash
cd /home/andrey/opt/disp-app/server
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart disp-api
sudo systemctl status disp-api --no-pager
```

## 11. Где лежат Excel-файлы

Файлы таблиц должны быть здесь:

```bash
/home/andrey/opt/disp-app/server/data/
```

Поддерживаются `.xlsx` файлы.

Ожидаемые колонки в Excel:
- `enp`
- `fam`
- `im`
- `ot`
- `DR`
- `lpu`
- `DATE_Z_1`
- `DATE_Z_2`
- `DISP`

## 12. Если что-то не работает

Проверки:

```bash
sudo systemctl status disp-api --no-pager
journalctl -u disp-api -n 100 --no-pager
sudo nginx -t
sudo tail -n 50 /var/log/nginx/error.log
curl http://127.0.0.1:8000/api/session
curl -i http://127.0.0.1:8000/api/session/check
ls -l /home/andrey/opt/disp-app/server/data
```

## 13. А что же менять при смене путей, домена

### Если меняется путь к проекту на сервере


1. `systemd` сервис backend  
Файл:
```bash
/etc/systemd/system/disp-api.service
```

Менять строки:
```ini
WorkingDirectory=...
Environment="DISP_DATA_DIR=..."
ExecStart=...
```

### Если меняется папка с Excel-файлами
Текущая папка:

```bash
/home/andrey/opt/disp-app/server/data
```

Если она переехала, меняйте только:

```ini
Environment="DISP_DATA_DIR=НОВЫЙ_ПУТЬ"
```

в файле:

```bash
/etc/systemd/system/disp-api.service
```

### Если меняется файл пользователей
Текущий файл:

```bash
/home/andrey/opt/disp-app/server/users.json
```

Если он переехал, меняйте:

```ini
Environment="DISP_USERS_FILE=НОВЫЙ_ПУТЬ_К_USERS.JSON"
```

в файле:

```bash
/etc/systemd/system/disp-api.service
```

### Если меняется папка фронта, которую отдает nginx
Текущая папка:

```bash
/var/www/botmaks
```

Если хотите отдавать сайт из другой директории, меняйте в nginx:

Файл:
```bash
/etc/nginx/sites-available/disp-app.conf
```

Строку:
```nginx
root /var/www/botmaks;
```

### Если меняется домен
Например, вместо:

```text
botmaks.ru
```

будет другой домен.

Тогда менять нужно:

1. `nginx` конфиг  
Файл:
```bash
/etc/nginx/sites-available/disp-app.conf
```

Строку:
```nginx
server_name botmaks.ru www.botmaks.ru;
```

2. `DISP_ALLOWED_ORIGINS` в `disp-api.service`  
Файл:
```bash
/etc/systemd/system/disp-api.service
```

Строку:
```ini
Environment="DISP_ALLOWED_ORIGINS=https://botmaks.ru,https://www.botmaks.ru"
```

### Коротко: куда смотреть в первую очередь
Если меняется:

- путь к backend -> `/etc/systemd/system/disp-api.service`
- путь к Excel -> `/etc/systemd/system/disp-api.service`
- путь к users.json -> `/etc/systemd/system/disp-api.service`
- путь к frontend -> `/etc/nginx/sites-available/disp-app.conf`
- домен -> `disp-api.service` и `disp-app.conf`
- порт backend -> `disp-api.service` и `disp-app.conf`
