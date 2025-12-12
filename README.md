# 🛒 E-Commerce Full Stack - Ionic Angular + Node.js

Aplicación móvil completa de comercio electrónico desarrollada con **Ionic 8**, **Angular 20** y **Node.js**.

## 📱 Características Principales

### ✨ Funcionalidades del Cliente
- ✅ **Autenticación Completa**: Registro, Login, Recuperación de contraseña
- ✅ **Catálogo de Productos**: Búsqueda, filtros por categoría y precio
- ✅ **Carrito de Compras**: Gestión de productos con variedades
- ✅ **Sistema de Pagos**: Integración con PayPal
- ✅ **Gestión de Direcciones**: CRUD completo de direcciones de envío
- ✅ **Historial de Pedidos**: Visualización de órdenes pasadas
- ✅ **Sistema de Reseñas**: Calificación y comentarios de productos
- ✅ **Descuentos y Cupones**: Sistema de promociones
- ✅ **Flash Sales**: Ventas relámpago con cuenta regresiva
- ✅ **Perfil de Usuario**: Edición de datos personales

### 🎨 Diseño
- 📱 **Responsive Design**: Adaptado a todos los dispositivos
- 🎨 **UI Moderna**: Inspirada en Amazon/Temu
- 🌈 **Paleta de Colores Profesional**
- ⚡ **Animaciones Suaves**

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **Ionic 8** - Framework híbrido
- **Angular 20** - Framework de desarrollo
- **TypeScript** - Lenguaje de programación
- **Swiper** - Carruseles y sliders
- **PayPal SDK** - Integración de pagos
- **Moment.js** - Manejo de fechas
- **RxJS** - Programación reactiva

### Backend
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación con tokens
- **Bcrypt** - Encriptación de contraseñas
- **Multer** - Manejo de archivos
- **Nodemailer** - Envío de correos

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18+ ([Descargar](https://nodejs.org/))
- **npm** o **yarn**
- **MongoDB** v6+ ([Descargar](https://www.mongodb.com/try/download/community))
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Angular CLI**: `npm install -g @angular/cli`

---

## 🔧 Instalación y Configuración

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/ecommerce-fullstack.git
cd ecommerce-fullstack
```

### 2️⃣ Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:

```env
URL_BACKEND=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
PORT=3000
```

Iniciar MongoDB:

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

Iniciar el servidor backend:

```bash
npm run dev
```

El backend estará corriendo en `http://localhost:3000`

### 3️⃣ Configurar el Frontend

```bash
cd ecommerce
npm install
```

Configurar [`ecommerce/src/environments/environment.ts`](ecommerce/src/environments/environment.ts ):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  paypalClientId: 'TU_PAYPAL_CLIENT_ID_SANDBOX',
  socketUrl: 'http://localhost:3000'
};
```

Iniciar la aplicación:

```bash
ionic serve
```

La aplicación estará corriendo en `http://localhost:8100`

---

## 💳 Configurar PayPal Sandbox

1. Ve a [PayPal Developer](https://developer.paypal.com)
2. Inicia sesión o crea una cuenta
3. Ve a **Dashboard** → **My Apps & Credentials**
4. Crea una nueva **App** en modo Sandbox
5. Copia el **Client ID**
6. Pégalo en `environment.ts`

---

## 📱 Ejecutar en Dispositivos Móviles

### Android

```bash
ionic capacitor add android
ionic capacitor sync
ionic capacitor run android
```

### iOS (Solo en Mac)

```bash
ionic capacitor add ios
ionic capacitor sync
ionic capacitor open ios
```

---

## 🗂️ Estructura del Proyecto

```
FullStackEcommerce/
├── backend/
│   ├── controllers/          # Controladores de la API
│   ├── models/                # Modelos de MongoDB
│   ├── router/                # Rutas de la API
│   ├── services/              # Servicios (token, email)
│   ├── middlewares/           # Middlewares (auth)
│   ├── resources/             # Recursos de transformación
│   ├── uploads/               # Archivos subidos
│   ├── .env                   # Variables de entorno
│   └── index.js               # Punto de entrada
│
└── ecommerce/
    ├── src/
    │   ├── app/
    │   │   ├── core/          # Servicios, guards, interceptores, modelos
    │   │   ├── shared/        # Componentes compartidos
    │   │   ├── pages/         # Páginas de la aplicación
    │   │   └── tabs/          # Tab navigation
    │   ├── assets/            # Recursos estáticos
    │   ├── environments/      # Configuración de entornos
    │   └── theme/             # Estilos globales
    └── capacitor.config.ts    # Configuración de Capacitor
```

---

## 🔐 Crear Usuario Administrador

Usar Postman o cualquier cliente HTTP:

```http
POST http://localhost:3000/api/users/register_admin
Content-Type: application/json

{
  "name": "Admin",
  "surname": "Principal",
  "email": "admin@admin.com",
  "password": "admin123456"
}
```

---

## 📚 API Endpoints Principales

### Autenticación
- `POST /api/users/register` - Registrar cliente
- `POST /api/users/login` - Iniciar sesión cliente
- `POST /api/users/login_admin` - Iniciar sesión admin

### Productos
- `GET /api/home/list` - Listar productos del home
- `GET /api/home/landing-product/:slug` - Detalle de producto
- `POST /api/home/search_product` - Buscar productos
- `POST /api/home/filter_products` - Filtrar productos

### Carrito
- `GET /api/cart/list` - Obtener carrito
- `POST /api/cart/register` - Agregar al carrito
- `PUT /api/cart/update` - Actualizar carrito
- `DELETE /api/cart/delete/:id` - Eliminar del carrito

### Órdenes
- `POST /api/sale/register` - Crear orden
- `POST /api/home/profile_client` - Mis órdenes
- `GET /api/sale/show/:id` - Detalle de orden

### Direcciones
- `GET /api/address_client/list` - Listar direcciones
- `POST /api/address_client/register` - Crear dirección
- `PUT /api/address_client/update` - Actualizar dirección
- `DELETE /api/address_client/delete/:id` - Eliminar dirección

---

## 🎯 Scripts Disponibles

### Backend
```bash
npm run dev    # Modo desarrollo con nodemon
npm start      # Modo producción
```

### Frontend
```bash
ionic serve              # Ejecutar en navegador
ionic build              # Build de producción
ionic capacitor run android    # Ejecutar en Android
ionic capacitor run ios        # Ejecutar en iOS
```

---

## 🐛 Solución de Problemas Comunes

### MongoDB no se conecta
```bash
# Verificar que MongoDB esté corriendo
mongosh
# o
mongo
```

### Error de CORS
Asegúrate de que en `backend/index.js` esté configurado CORS correctamente.

### PayPal no carga
Verifica que el Client ID sea correcto y que esté en modo Sandbox.

---

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

---

## 👨‍💻 Autor

**Jordy Jimbo**
- GitHub: https://github.com/JimboJ10
- Email: jordyjimbo32@gmail.com

---

## 🙏 Agradecimientos

- Ionic Team
- Angular Team
- MongoDB Team
- PayPal Developers

---