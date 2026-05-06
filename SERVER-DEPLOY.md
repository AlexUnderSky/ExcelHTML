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
    styles.css
    app.js
    config.js
  server/
    app.py
    requirements.txt
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

## 4. Проверить API вручную

```bash
cd /home/andrey/opt/disp-app/server
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000
```

В другом окне:

```bash
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8000/api/tables
```

Если все хорошо, остановить `uvicorn` через `Ctrl+C`.

## 5. Подключить systemd

Скопировать сервис:

```bash
sudo cp /home/andrey/opt/disp-app/server/systemd/disp-api.service /etc/systemd/system/disp-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now disp-api
sudo systemctl status disp-api --no-pager
```

Проверка:

```bash
curl http://127.0.0.1:8000/api/health
```

## 6. Подготовить фронт для nginx

```bash
sudo mkdir -p /var/www/botmaks
sudo cp -r /home/andrey/opt/disp-app/frontend/* /var/www/botmaks/
sudo chown -R www-data:www-data /var/www/botmaks
```

## 7. Подключить nginx

Скопировать конфиг:

```bash
sudo cp /home/andrey/opt/disp-app/deploy/nginx/disp-app.conf /etc/nginx/sites-available/disp-app.conf
sudo ln -sf /etc/nginx/sites-available/disp-app.conf /etc/nginx/sites-enabled/disp-app.conf
sudo nginx -t
sudo systemctl reload nginx
```

Проверка:

```bash
curl -I http://127.0.0.1
curl -I -H "Host: botmaks.ru" http://127.0.0.1
```

## 8. Обновление фронта после правок

После изменений в `frontend/`:

```bash
sudo cp -r /home/andrey/opt/disp-app/frontend/* /var/www/botmaks/
sudo chown -R www-data:www-data /var/www/botmaks
sudo systemctl reload nginx
```

Если браузер показывает старую версию, сделать жесткое обновление: `Ctrl + F5`.

## 9. Обновление backend после правок

После изменений в `server/app.py` или зависимостях:

```bash
cd /home/andrey/opt/disp-app/server
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart disp-api
sudo systemctl status disp-api --no-pager
```

## 10. Где лежат Excel-файлы

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

## 11. Если что-то не работает

Проверки:

```bash
sudo systemctl status disp-api --no-pager
journalctl -u disp-api -n 100 --no-pager
sudo nginx -t
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8000/api/tables
ls -l /home/andrey/opt/disp-app/server/data
```

После обновления backend и nginx:

```bash
sudo cp /home/andrey/opt/disp-app/deploy/nginx/disp-app.conf /etc/nginx/sites-available/disp-app.conf
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart disp-api
```
