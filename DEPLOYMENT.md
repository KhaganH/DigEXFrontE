# DigexFront Deployment Rehberi

Bu rehber, DigexFront uygulamasını GitHub'dan DigitalOcean'a deploy etmek için gereken tüm adımları içerir.

## Ön Gereksinimler

- GitHub hesabı ve repository
- DigitalOcean hesabı
- Backend servisinin DigitalOcean'da çalışıyor olması

## 1. GitHub Repository Hazırlığı

### 1.1 Repository Ayarları

```bash
# Repository'yi GitHub'a push edin
git add .
git commit -m "feat: add CI/CD and Docker deployment configuration"
git push origin main
```

### 1.2 GitHub Secrets Ayarlama

GitHub repository'nizde **Settings > Secrets and variables > Actions** bölümüne gidin ve şu secret'ları ekleyin:

- `DO_ACCESS_TOKEN`: DigitalOcean API token'ınız
- `DO_APP_NAME`: DigitalOcean'da oluşturacağınız app adı (örn: `digex-frontend`)

## 2. DigitalOcean Hazırlığı

### 2.1 DigitalOcean Access Token Alma

1. [DigitalOcean Control Panel](https://cloud.digitalocean.com/) > API > Tokens
2. **Generate New Token** butonuna tıklayın
3. Token'a bir isim verin ve **Write** yetkisi verin
4. Oluşturulan token'ı GitHub Secrets'a `DO_ACCESS_TOKEN` olarak ekleyin

### 2.2 Backend Servisi Bilgileri

Backend servisinizin DigitalOcean'daki URL'ini not alın. Örnek:
- `digex-backend.ondigitalocean.app`

## 3. Deployment

### 3.1 Manuel Deployment (İlk Kurulum)

1. [DigitalOcean Apps](https://cloud.digitalocean.com/apps) sayfasına gidin
2. **Create App** butonuna tıklayın
3. **GitHub** seçeneğini seçin
4. Repository'nizi seçin (`KhaganH/DigEXFrontE`)
5. **Import from .do/app.yaml** seçeneğini seçin
6. Environment variables'ları kontrol edin:
   - `BACKEND_HOST`: Backend servisinizin hostname'i
   - `BACKEND_PORT`: `443` (HTTPS için)
   - `FRONTEND_URL`: Frontend'inizin URL'i

### 3.2 App.yaml Dosyasını Düzenleme

`.do/app.yaml` dosyasında şu değişiklikleri yapın:

```yaml
github:
  repo: KhaganH/DigEXFrontE
```

Environment variables'ları backend servisinize göre güncelleyin:

```yaml
envs:
  - key: BACKEND_HOST
    value: YOUR_BACKEND_HOST.ondigitalocean.app
  - key: BACKEND_PORT
    value: "1111"
  - key: FRONTEND_URL
    value: https://YOUR_FRONTEND_HOST.ondigitalocean.app
```

### 3.3 Otomatik Deployment (CI/CD)

Kod değişikliklerini `main` branch'e push ettiğinizde:

1. GitHub Actions otomatik çalışacak
2. Testler çalışacak
3. Docker image build edilecek
4. GitHub Container Registry'ye push edilecek
5. DigitalOcean'a deploy edilecek

## 4. SSL ve Domain Ayarları

### 4.1 SSL Sertifikası

DigitalOcean otomatik olarak SSL sertifikası sağlar. Manuel olarak bir şey yapmanıza gerek yok.

### 4.2 Custom Domain (Opsiyonel)

Kendi domain'inizi kullanmak istiyorsanız:

1. DigitalOcean Apps panelinde **Settings > Domains** bölümüne gidin
2. **Add Domain** butonuna tıklayın
3. Domain'inizi girin ve DNS ayarlarını güncelleyin

## 5. Monitoring ve Logs

### 5.1 Application Logs

DigitalOcean Apps panelinde **Runtime Logs** sekmesinden logları görebilirsiniz.

### 5.2 Metrics

**Insights** sekmesinden CPU, RAM ve network kullanımını izleyebilirsiniz.

## 6. Troubleshooting

### 6.1 Build Hatası

- GitHub Actions loglarını kontrol edin
- `package.json` ve dependencies'leri kontrol edin
- Docker build locally test edin:

```bash
docker build -t digex-frontend .
docker run -p 8080:80 digex-frontend
```

### 6.2 Deployment Hatası

- DigitalOcean Apps loglarını kontrol edin
- Environment variables'ları kontrol edin
- Backend servisinin çalışır durumda olduğunu kontrol edin

### 6.3 CORS Hatası

Backend servisinizde frontend URL'ini CORS allowed origins'a eklediğinizden emin olun.

## 7. Environment Variables Referansı

| Variable | Açıklama | Örnek Değer |
|----------|----------|-------------|
| `BACKEND_HOST` | Backend servis hostname | `digex-backend.ondigitalocean.app` |
| `BACKEND_PORT` | Backend servis port | `1111` |
| `FRONTEND_URL` | Frontend URL (CORS için) | `https://digex-frontend.ondigitalocean.app` |
| `NODE_ENV` | Node.js environment | `production` |

## 8. Maliyet Optimizasyonu

- **basic-xxs** instance size kullanıyoruz ($5/month)
- Auto-scaling kapalı (sabit 1 instance)
- Gerekirse **basic-xs** ($10/month) veya daha büyük instance'lara geçebilirsiniz

## 9. Güvenlik

- Rate limiting aktif
- Security headers eklendi
- CORS ayarları production için konfigüre edildi
- Environment variables secrets olarak saklanıyor

## 10. Backup ve Recovery

DigitalOcean Apps otomatik olarak:
- Code backup'ı GitHub'da tutuluyor
- Docker images GitHub Container Registry'de tutuluyor
- Herhangi bir sorun durumunda önceki versiyona geri dönebilirsiniz

---

## Hızlı Başlangıç Checklist

- [ ] GitHub repository oluşturuldu
- [ ] GitHub Secrets eklendi (`DO_ACCESS_TOKEN`, `DO_APP_NAME`)
- [ ] `.do/app.yaml`'da GitHub repo bilgisi güncellendi
- [ ] Backend servis URL'i environment variables'da güncellendi
- [ ] DigitalOcean'da app oluşturuldu
- [ ] İlk deployment tamamlandı
- [ ] SSL sertifikası aktif
- [ ] Backend ile iletişim test edildi

Bu adımları tamamladıktan sonra frontend'iniz otomatik olarak deploy olacaktır! 🚀 