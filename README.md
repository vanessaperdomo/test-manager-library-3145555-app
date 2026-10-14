# Manager Library â€” React SPA Frontend
**SENA ADSO Ficha 3145555 Â· Spec-Driven Development**

Cliente web interactivo desarrollado con **React 18** y empaquetado con **Vite**, diseÃ±ado con un sistema de diseÃ±o propio basado en **CSS Vanilla y Glassmorphism**.

## Caracteristicas y Modulos
- Autenticacion RBAC (CA-01): Sesiones Bearer con token JWT almacenado en localStorage con expiracion forzada de 8 horas.
- Catalogo de Libros (CA-04): Busqueda en tiempo real por texto o autor, filtro por categorias en ingles, subida de portadas (multipart/form-data) y bajas logicas.
- Prestamos Transaccionales (CA-06): Asignacion de 1 a 3 libros por socio con bloqueo automatico en caso de moras activas.
- Devoluciones por Linea (CA-07): Reincorporacion inmediata de ejemplares al stock disponible del catalogo.
- Directorio de Socios (CA-05): Control de cupo maximo (hasta 3 libros prestados simultaneamente) y documento unico.
- Control de Vencidos (CA-09): Monitoreo de moras ordenadas por dias de retraso descendente.
- Reporte Estadistico (CA-10): Graficos agregados de libros mas solicitados por rango de fechas sin exponer datos personales (ADR-004).

## Comandos de Desarrollo
```bash
npm install     # Instalar dependencias
npm run dev     # Iniciar servidor de desarrollo en http://localhost:5173
npm run build   # Compilar bundle de produccion en dist/
npm run preview # Previsualizar bundle de produccion
```
