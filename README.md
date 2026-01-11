# PEDOMAN TUBES PAW JOSJIS
```bash
git clone ....
```
lalu buka project di vscode, dan jalankan composer install
```bash
composer install
```
Perintah di bawah untuk mengopy file .env.example menjadi .env
```bash
cp .env.example .env
```
Generate Key
```bash
php artisan key:generate
```
lalu jalankan perintah di bawah
```bash
npm install
```
Buka file `.env`
```php
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=halo_apotek_db
DB_USERNAME=root
DB_PASSWORD=
```
jalankan `Laragon` atau `XAMPP` dan jalankan 
```bash
php artisan migrate:seed
```
running project
```bash
php artisan serve
```
dan 

```bash
npm run dev
```
## TUTOR GITHUB ????
```
git init
git remote -v
git branch
git status
git add .
git commit -m "teks sembarang"
git push origin namabranch
git checkout namabranch
git pull namabranch
```
#### TUTOR GIT PUSH
```
check branch dulu (git branch)
check remote (git remote -v)
git add .
git commit -m "diisi sembarang"
git push origin main (contoh push ke branch main)
```
#### TUTOR GIT PULL
```
git remote -v (check remote nya dulu)
git pull origin main (contoh narik project dari branch main)
```
