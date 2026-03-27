<div align="center">

  # 🥾 Sistema de Inventario y Catálogo — Botitas

  **Gestión de Stock y Exhibición Digital para Calzado de Cuero**

  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)](https://ejs.co/)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
  [![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
  [![Tesis](https://img.shields.io/badge/Proyecto-Titulaci%C3%B3n-blueviolet?style=for-the-badge)](https://github.com/sebasloO016/calzadobotitas)

  [🐛 Reportar Incidencia](https://github.com/sebasloO016/calzadobotitas/issues)

</div>

---

## 🎓 Contexto Académico

Este proyecto fue desarrollado como **trabajo de titulación** para la obtención del título de **Ingeniero en Sistemas**. Representa una solución funcional y real aplicada a un negocio de calzado de cuero, cubriendo desde la gestión de inventario hasta el control de ventas y generación de reportes.

> ⚠️ Esta es la versión académica del sistema. Una versión mejorada y optimizada para producción está actualmente en desarrollo.

---

## 📖 Descripción del Proyecto

**Botitas** es un sistema web de gestión integral diseñado específicamente para negocios de calzado de cuero. Permite un control riguroso sobre las variantes de **modelo, talla y color**, integrando módulos de inventario, ventas, proveedores, clientes y reportes en una sola plataforma.

Utiliza **EJS (Embedded JavaScript Templates)** para el renderizado de vistas dinámicas directamente desde el servidor, garantizando velocidad de carga y una experiencia fluida para el administrador del negocio.

---

## ✨ Funcionalidades Clave

| Módulo | Descripción |
|---|---|
| 📦 **Inventario** | Control de stock por modelo, talla y color. Ubicación física del producto. |
| 👟 **Catálogo de Productos** | Alta, edición y eliminación de productos con variantes. |
| 🛒 **Ventas** | Registro de nuevas ventas, historial y detalle por transacción. |
| 🏭 **Proveedores** | Gestión completa de proveedores y compras. |
| 👥 **Clientes** | Registro y consulta de cartera de clientes. |
| 👤 **Usuarios** | Control de acceso con roles (Administrador / Empleado). |
| 📊 **Reportes** | Dashboard con métricas clave del negocio. |

---

## 🛠️ Stack Tecnológico

- **Backend:** Node.js + Express.js
- **Motor de Plantillas:** EJS (Server-Side Rendering)
- **Estilos:** CSS3 personalizado y responsivo
- **Base de Datos:** MySQL (modelo relacional optimizado)
- **Middleware:** Body-parser, Cookie-parser para sesiones de administración

---

## 🚀 Instalación Local

### Prerrequisitos

- Node.js instalado
- MySQL Server activo

### 1. Clonar el repositorio

```bash
git clone https://github.com/sebasloO016/calzadobotitas.git
cd calzadobotitas
npm install
```

### 2. Configurar la base de datos

Importa el script SQL incluido en el proyecto:

```sql
CREATE DATABASE botitas_db;
USE botitas_db;
-- Luego ejecuta: db/scripts_sql.sql
```

### 3. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASS=tu_password_mysql
DB_NAME=botitas_db
```

### 4. Ejecutar

```bash
npm start
```

> La aplicación estará disponible en `http://localhost:3000`

---

## 📂 Estructura del Proyecto

```
calzadobotitas/
├── public/
│   ├── index.html
│   ├── register.html
│   ├── admin-dashboard.ejs
│   ├── employee-dashboard.ejs
│   ├── inventario/
│   ├── crearProducto/
│   ├── proveedores/
│   ├── ventas/
│   ├── clientes/
│   ├── usuarios/
│   ├── reportes/
│   └── imagenes/
├── src/
│   ├── index.js
│   ├── routes/           # Rutas por módulo
│   ├── controllers/      # Lógica de negocio por módulo
│   ├── models/           # Modelos de base de datos
│   └── db/
│       └── db.js         # Conexión a MySQL
├── db/
│   └── scripts_sql.sql   # Scripts de creación de tablas
└── package.json
```

---

## 🗺️ Mejoras Planeadas (v2.0)

- [ ] 🔔 Alertas automáticas de stock mínimo
- [ ] 📤 Exportación de reportes en PDF/Excel
- [ ] 📱 Diseño mobile-first mejorado
- [ ] 🔐 Autenticación con JWT
- [ ] ☁️ Despliegue en producción

---

## 👨‍💻 Autor

**Edison Sebastian Gavilanes Lopez**
Ingeniero en Sistemas — Proyecto de Titulación
[GitHub](https://github.com/sebasloO016)

---

<p align="center">Desarrollado con ❤️ como solución real para un negocio local de calzado ecuatoriano.</p>
```
