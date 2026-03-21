# Managex

**Managex** es una aplicación de gestión empresarial con estilo "Tycoon" (Magnate).

Su objetivo principal es convertir las tareas aburridas de la gestión de un pequeño negocio (inventario, ventas, reportes) en un "juego" adictivo.

## 🚀 Concepto Principal

### 1. Gamificación (Estilo Tycoon)

El sistema te motiva mediante recompensas por tu trabajo real:

- **XP y Niveles:** Ganas experiencia (XP) por cada venta y producto añadido. Tu "Imperio" sube de nivel (ej. Nivel 1 -> Nivel 2) mientras trabajas.
- **Misiones Diarias:** Objetivos como "Alcanzar $100 en ingresos" para ganar bonificaciones.
- **Rango:** La app te llama "Tycoon" (Magnate) para hacerte sentir como el CEO de una gran corporación.

### 2. Productividad

No es solo un juego, es una herramienta real:

- **Control de Inventario:** Gestiona stock, categorías y precios fácilmente.
- **Registro de Ventas:** Procesa transacciones rápidamente.
- **Reportes Financieros:** Gráficos de tendencias de ventas e historial de transacciones.

### 3. Exportación de Datos

Permite descargar tu información localmente en cualquier momento:

- **Descarga de Reportes:** En la sección "Análisis de Datos", haz clic en el ícono de compartir para guardar tu inventario como un archivo `inventario.json` en tu dispositivo físico, útil para auditorías o copias de seguridad.

### 4. Diseño Premium

Utiliza un diseño futurista con "Glassmorphism" (efecto cristal), modo oscuro, y acentos neón para que la experiencia sea visualmente satisfactoria.

---

## 🛠️ Instalación y Uso

### Requisitos

- Node.js
- Expo Go (en tu móvil)

### Comandos

Para iniciar la aplicación:

```bash
npx expo start --clear
```

Si encuentras problemas con las dependencias:

```bash
npm install --legacy-peer-deps
```

---

## 📦 Descarga y Compilación (Builds)

La aplicación está preconfigurada para generar archivos instalables utilizando **Expo Application Services (EAS)** sin necesidad de entornos locales complejos.

### 🤖 Construir para Android (.apk)
Genera el instalador directo (APK) que puedes compartir y enviar a cualquier dispositivo Android:

```bash
npx eas-cli build -p android --profile preview
```

### 🍏 Construir para iOS (Simulador)
Genera un archivo `.tar.gz` que puede ser arrastrado sobre un Simulador de iOS en tu Mac, sin requerir cuenta de pago de Apple Developer:

```bash
npx eas-cli build -p ios --profile preview
```
*(Nota: Para instalar en iPhones reales, requerirás una licencia de Apple Developer, registrar PUDID y eliminar el flag `"simulator": true` de tu `eas.json`).*
