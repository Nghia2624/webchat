# WEBCHAT - UNG DUNG CHAT TRUC TUYEN

Ung dung chat truc tuyen WebChat duoc toi uu hoa voi kien truc module va hieu suat cao.

## Thong tin toi uu hoa

WebChat vua duoc toi uu hoa de:

- Loai bo ma nguon va files trung lap
- Cai thien cau truc du an
- Tang toc do khoi dong va hoat dong
- Lam ro cac duong dan WebSocket va API

## Cai dat

### Yeu cau he thong
- Node.js (v14+)
- NPM (v6+)

### Cai dat
1. Clone du an ve may
```
git clone <url-du-an>
cd webchat
```

2. Cai dat tat ca cac goi phu thuoc
```
npm run install:deps
```

## Chay ung dung

### Cach 1: Su dung script tu dong (Khuyen nghi)
```
npm run app
```
Hoac:
```
./run-app.ps1
```

Script se:
- Kiem tra va dong cac tien trinh dang chay tren cong 5174 va 8081
- Thiet lap moi truong
- Khoi dong backend va frontend
- Tu dong mo trinh duyet

### Cach 2: Khoi dong bang NPM scripts
```
npm start
```

## Cau truc du an toi uu

```
webchat/
├── backend/         # API server Go
├── frontend/        # React frontend
├── run-app.ps1      # Script khoi dong toi uu
├── package.json     # Cau hinh toi uu
└── README.md        # Tai lieu
```

## Xu ly loi thuong gap

### WebSocket khong ket noi
- Kiem tra URL trong .env.local: VITE_WS_URL=ws://localhost:8081/ws
- Kiem tra backend dang chay tren cong 8081
- Dam bao khong co firewall chan ket noi

### API khong hoat dong
- Kiem tra URL trong .env.local: VITE_API_URL=http://localhost:8081/api
- Kiem tra file vite.config.js da cau hinh proxy cho API va WS dung:
```
proxy: {
  '/api': {
    target: 'http://localhost:8081',
    changeOrigin: true,
    secure: false,
    ws: true
  },
  '/ws': {
    target: 'ws://localhost:8081',
    ws: true,
    changeOrigin: true
  }
}
```

## Lien he ho tro

Neu gap van de, vui long tao issue trong repository. 