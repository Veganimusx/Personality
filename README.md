# UNITAP - Gestión de Uniformes y Órdenes de Trabajo (Flutter Material 3)

Aplicación Flutter completa para la administración y control de uniformes, inventario, anticipos, desglose de IVA (16%), seguimiento de facturación CFDI y generación de recibos PDF con envío a WhatsApp.

## Estructura del Proyecto
- `lib/main.dart`: Código Flutter 100% funcional con Material 3.
- `pubspec.yaml`: Dependencias de PDF, printing, share_plus, image_picker y Supabase.
- `android/`: Configuración nativa con ID `com.unitap.app` y permisos.
- `.github/workflows/build_apk.yml`: Compilación automática del APK release en GitHub Actions.

## Cómo compilar el APK Release
```bash
flutter pub get
flutter build apk --release
```
El APK compilado estará en `build/app/outputs/flutter-apk/app-release.apk`.
