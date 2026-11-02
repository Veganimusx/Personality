import 'dart:io';
import 'package:flutter/material.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:pdf/pdf.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:image_picker/image_picker.dart';

void main() {
  runApp(const UnitapApp());
}

class UnitapApp extends StatelessWidget {
  const UnitapApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UNITAP - Órdenes de Uniformes',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blueAccent),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

// Modelos de Datos
class DatosNegocio {
  String nombre;
  String telefono;
  String direccion;
  String? logoPath;

  DatosNegocio({required this.nombre, required this.telefono, required this.direccion, this.logoPath});
}

class ProductoBase {
  String nombre;
  double precioBase;
  List<String> coloresDisponibles;
  List<String> tallasDisponibles;
  int stockGeneral;

  ProductoBase({
    required this.nombre,
    required this.precioBase,
    required this.coloresDisponibles,
    required this.tallasDisponibles,
    required this.stockGeneral,
  });
}

class UbicacionLogoExtra {
  String ubicacion; 
  String descripcion; 
  double costoExtra;
  String? imagenPath;

  UbicacionLogoExtra({required this.ubicacion, required this.descripcion, required this.costoExtra, this.imagenPath});
}

class ItemOrden {
  String productoNombre;
  String color;
  String talla;
  int cantidad;
  double precioUnitarioFinal; 
  List<UbicacionLogoExtra> logotiposExtras;

  ItemOrden({
    required this.productoNombre,
    required this.color,
    required this.talla,
    required this.cantidad,
    required this.precioUnitarioFinal,
    required this.logotiposExtras,
  });

  double get subtotal => precioUnitarioFinal * cantidad;
}

class OrdenTrabajo {
  String id;
  String cliente;
  String telefono;
  List<ItemOrden> items;
  double costoEnvio;
  bool aplicaIva; // Opción para agregar 16% de IVA
  bool requiereFactura; // Para el control de facturas pendientes
  bool facturaEmitida;
  double anticipo;
  String estatusProduccion; 
  String estatusInventario; 
  DateTime fecha;

  OrdenTrabajo({
    required this.id,
    required this.cliente,
    required this.telefono,
    required this.items,
    required this.costoEnvio,
    required this.aplicaIva,
    required this.requiereFactura,
    required this.facturaEmitida,
    required this.anticipo,
    required this.estatusProduccion,
    required this.estatusInventario,
    required this.fecha,
  });

  double get totalItems => items.fold(0.0, (sum, item) => sum + item.subtotal);
  double get subtotalGeneral => totalItems + costoEnvio;
  double get montoIva => aplicaIva ? subtotalGeneral * 0.16 : 0.0;
  double get total => subtotalGeneral + montoIva;
  double get restante => total - anticipo;
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  DatosNegocio _negocio = DatosNegocio(
    nombre: 'UNITAP - Uniformes',
    telefono: '81 0000 0000',
    direccion: 'Guadalupe, N.L.',
  );

  final List<ProductoBase> _inventario = [
    ProductoBase(
      nombre: 'Polo Piqué Dry-Fit',
      precioBase: 180.0,
      coloresDisponibles: ['Azul Marino', 'Negro', 'Blanco', 'Rojo'],
      tallasDisponibles: ['S', 'M', 'L', 'XL', 'XXL'],
      stockGeneral: 15,
    ),
    ProductoBase(
      nombre: 'Playera Cuello Redondo',
      precioBase: 120.0,
      coloresDisponibles: ['Gris', 'Negro', 'Azul Rey'],
      tallasDisponibles: ['M', 'L', 'XL'],
      stockGeneral: 5,
    ),
  ];

  final List<OrdenTrabajo> _ordenes = [];

  void _guardarOrden(OrdenTrabajo orden, {bool esEdicion = false}) {
    setState(() {
      for (var item in orden.items) {
        var prodBase = _inventario.firstWhere(
          (p) => p.nombre == item.productoNombre,
          orElse: () => _inventario.first,
        );
        if (prodBase.stockGeneral >= item.cantidad) {
          prodBase.stockGeneral -= item.cantidad;
          orden.estatusInventario = 'Surtido';
        } else {
          orden.estatusInventario = 'Pendiente de surtir';
          orden.estatusProduccion = 'Pendiente de Surtir';
        }
      }
      if (!esEdicion) {
        _ordenes.add(orden);
      }
    });
  }

  void _editarDatosNegocio(BuildContext context) {
    final nombreController = TextEditingController(text: _negocio.nombre);
    final telController = TextEditingController(text: _negocio.telefono);
    final dirController = TextEditingController(text: _negocio.direccion);
    String? tempLogo = _negocio.logoPath;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('Configurar Negocio', style: TextStyle(fontSize: 16)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(controller: nombreController, decoration: const InputDecoration(labelText: 'Nombre', isDense: true)),
                    TextField(controller: telController, decoration: const InputDecoration(labelText: 'Teléfono', isDense: true)),
                    TextField(controller: dirController, decoration: const InputDecoration(labelText: 'Dirección', isDense: true)),
                    const SizedBox(height: 8),
                    ElevatedButton.icon(
                      onPressed: () async {
                        final picker = ImagePicker();
                        final image = await picker.pickImage(source: ImageSource.gallery);
                        if (image != null) {
                          setStateDialog(() => tempLogo = image.path);
                        }
                      },
                      icon: const Icon(Icons.image, size: 16),
                      label: Text(tempLogo == null ? 'Subir Logotipo' : 'Logo Seleccionado', style: const TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _negocio = DatosNegocio(
                        nombre: nombreController.text,
                        telefono: telController.text,
                        direccion: dirController.text,
                        logoPath: tempLogo,
                      );
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('Guardar'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pantallas = [
      VistaOrdenesActivas(
        ordenes: _ordenes.where((o) => o.estatusProduccion != 'Entregado').toList(),
        inventario: _inventario,
        datosNegocio: _negocio,
        onGuardarOrden: _guardarOrden,
        onActualizar: () => setState(() {}),
      ),
      VistaPendientesSurtir(
        ordenes: _ordenes.where((o) => o.estatusInventario == 'Pendiente de surtir').toList(),
        onActualizar: () => setState(() {}),
      ),
      VistaFacturasPendientes(
        ordenes: _ordenes.where((o) => o.requiereFactura && !o.facturaEmitida).toList(),
        onActualizar: () => setState(() {}),
      ),
      VistaHistorialMes(
        ordenes: _ordenes.where((o) => o.estatusProduccion == 'Entregado').toList(),
      ),
      VistaInventario(
        inventario: _inventario, 
        onActualizar: () => setState(() {}),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(_negocio.nombre, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        toolbarHeight: 45,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, size: 20),
            onPressed: () => _editarDatosNegocio(context),
            tooltip: 'Configuración',
          )
        ],
      ),
      body: pantallas[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        height: 60,
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) => setState(() => _selectedIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.assignment, size: 20), label: 'Activas'),
          NavigationDestination(icon: Icon(Icons.warning, size: 20, color: Colors.orange), label: 'Surtir'),
          NavigationDestination(icon: Icon(Icons.receipt_long, size: 20, color: Colors.purple), label: 'Facturar'),
          NavigationDestination(icon: Icon(Icons.history, size: 20), label: 'Historial'),
          NavigationDestination(icon: Icon(Icons.inventory, size: 20), label: 'Stock'),
        ],
      ),
    );
  }
}

// --- VISTA 1: ÓRDENES ACTIVAS ---
class VistaOrdenesActivas extends StatelessWidget {
  final List<OrdenTrabajo> ordenes;
  final List<ProductoBase> inventario;
  final DatosNegocio datosNegocio;
  final Function(OrdenTrabajo, {bool esEdicion}) onGuardarOrden;
  final VoidCallback onActualizar;

  const VistaOrdenesActivas({
    super.key,
    required this.ordenes,
    required this.inventario,
    required this.datosNegocio,
    required this.onGuardarOrden,
    required this.onActualizar,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ordenes.isEmpty
          ? const Center(child: Text('No hay órdenes activas.', style: TextStyle(fontSize: 13)))
          : ListView.builder(
              itemCount: ordenes.length,
              itemBuilder: (context, index) {
                final orden = ordenes[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  elevation: 1,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(orden.cliente, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: orden.estatusProduccion == 'Pendiente de Surtir' ? Colors.orange[100] : Colors.blue[100],
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(orden.estatusProduccion, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        ...orden.items.map((item) => Text('• ${item.cantidad}x ${item.productoNameDetalle()} (\$${item.precioUnitarioFinal.toStringAsFixed(2)})', style: const TextStyle(fontSize: 12))),
                        if (orden.costoEnvio > 0) Text('• Envío: \$${orden.costoEnvio.toStringAsFixed(2)}', style: const TextStyle(fontSize: 11)),
                        if (orden.aplicaIva) const Text('• Incluye IVA (16%)', style: TextStyle(fontSize: 11, color: Colors.blueGrey)),
                        const Divider(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Total: \$${orden.total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            Text('Anticipo: \$${orden.anticipo.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12)),
                            Text('Resto: \$${orden.restante.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.red)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            OutlinedButton.icon(
                              onPressed: () {
                                if (orden.estatusProduccion == 'Pendiente de Surtir') {
                                  orden.estatusProduccion = 'En Producción';
                                  orden.estatusInventario = 'Surtido';
                                } else if (orden.estatusProduccion == 'En Producción') {
                                  orden.estatusProduccion = 'Listo';
                                } else if (orden.estatusProduccion == 'Listo') {
                                  orden.estatusProduccion = 'Entregado';
                                }
                                onActualizar();
                              },
                              icon: const Icon(Icons.update, size: 14),
                              label: Text(orden.estatusProduccion == 'Pendiente de Surtir' ? 'Surtir' : 'Avanzar', style: const TextStyle(fontSize: 11)),
                              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0), minimumSize: const Size(0, 30)),
                            ),
                            const SizedBox(width: 4),
                            IconButton(
                              constraints: const BoxConstraints(),
                              padding: const EdgeInsets.all(4),
                              icon: const Icon(Icons.edit, color: Colors.blue, size: 18),
                              onPressed: () => _mostrarFormularioOrden(context, ordenExistente: orden),
                            ),
                            IconButton(
                              constraints: const BoxConstraints(),
                              padding: const EdgeInsets.all(4),
                              icon: const Icon(Icons.chat, color: Colors.green, size: 18),
                              onPressed: () => _enviarWhatsApp(orden),
                            ),
                            IconButton(
                              constraints: const BoxConstraints(),
                              padding: const EdgeInsets.all(4),
                              icon: const Icon(Icons.picture_as_pdf, color: Colors.red, size: 18),
                              onPressed: () => _generarYCompartirPDF(orden, datosNegocio),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        mini: true,
        onPressed: () => _mostrarFormularioOrden(context),
        child: const Icon(Icons.add, size: 20),
      ),
    );
  }

  // --- FORMULARIO COMPACTO ---
  void _mostrarFormularioOrden(BuildContext context, {OrdenTrabajo? ordenExistente}) {
    final clienteController = TextEditingController(text: ordenExistente?.cliente ?? '');
    final telefonoController = TextEditingController(text: ordenExistente?.telefono ?? '');
    final envioController = TextEditingController(text: ordenExistente?.costoEnvio.toString() ?? '0');
    final anticipoController = TextEditingController(text: ordenExistente?.anticipo.toString() ?? '');
    
    bool aplicaIva = ordenExistente?.aplicaIva ?? false;
    bool requiereFactura = ordenExistente?.requiereFactura ?? false;
    List<ItemOrden> listaItems = List.from(ordenExistente?.items ?? []);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 12, right: 12, top: 12),
          child: StatefulBuilder(
            builder: (context, setStateModal) {
              return SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(ordenExistente == null ? 'Nueva Orden' : 'Editar Orden', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    TextField(controller: clienteController, decoration: const InputDecoration(labelText: 'Cliente', isDense: true)),
                    TextField(controller: telefonoController, decoration: const InputDecoration(labelText: 'Teléfono (WhatsApp)', isDense: true), keyboardType: TextInputType.phone),
                    
                    const Divider(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Artículos', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        OutlinedButton.icon(
                          onPressed: () => _mostrarDialogoAgregarItem(context, setStateModal, listaItems),
                          icon: const Icon(Icons.add, size: 12),
                          label: const Text('Añadir', style: TextStyle(fontSize: 11)),
                          style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 0), minimumSize: const Size(0, 26)),
                        ),
                      ],
                    ),

                    if (listaItems.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(4.0),
                        child: Text('Sin artículos agregados.', style: TextStyle(color: Colors.grey, fontSize: 11)),
                      ),

                    ...listaItems.asMap().entries.map((entry) {
                      int idx = entry.key;
                      var item = entry.value;
                      return ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: Text('${item.cantidad}x ${item.productoNameDetalle()}', style: const TextStyle(fontSize: 12)),
                        subtitle: Text('P. Unit: \$${item.precioUnitarioFinal.toStringAsFixed(2)} | Sub: \$${item.subtotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 11)),
                        trailing: IconButton(
                          constraints: const BoxConstraints(),
                          padding: EdgeInsets.zero,
                          icon: const Icon(Icons.delete, color: Colors.red, size: 16),
                          onPressed: () => setStateModal(() => listaItems.removeAt(idx)),
                        ),
                      );
                    }),

                    const Divider(height: 16),
                    TextField(controller: envioController, decoration: const InputDecoration(labelText: 'Costo de Envío \$', isDense: true), keyboardType: TextInputType.number),
                    TextField(controller: anticipoController, decoration: const InputDecoration(labelText: 'Anticipo \$', isDense: true), keyboardType: TextInputType.number),
                    
                    SwitchListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Agregar IVA (16%)', style: TextStyle(fontSize: 12)),
                      value: aplicaIva,
                      onChanged: (val) => setStateModal(() => aplicaIva = val),
                    ),
                    SwitchListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Requiere Factura (CFDI)', style: TextStyle(fontSize: 12)),
                      value: requiereFactura,
                      onChanged: (val) => setStateModal(() => requiereFactura = val),
                    ),

                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: () {
                        if (clienteController.text.isEmpty || listaItems.isEmpty) return;

                        double envio = double.tryParse(envioController.text) ?? 0.0;
                        double ant = double.tryParse(anticipoController.text) ?? 0.0;

                        if (ordenExistente == null) {
                          OrdenTrabajo nueva = OrdenTrabajo(
                            id: DateTime.now().millisecondsSinceEpoch.toString(),
                            cliente: clienteController.text,
                            telefono: telefonoController.text,
                            items: listaItems,
                            costoEnvio: envio,
                            aplicaIva: aplicaIva,
                            requiereFactura: requiereFactura,
                            facturaEmitida: false,
                            anticipo: ant,
                            estatusProduccion: 'En Producción',
                            estatusInventario: 'Surtido',
                            fecha: DateTime.now(),
                          );
                          onGuardarOrden(nueva);
                        } else {
                          ordenExistente.cliente = clienteController.text;
                          ordenExistente.telefono = telefonoController.text;
                          ordenExistente.items = listaItems;
                          ordenExistente.costoEnvio = envio;
                          ordenExistente.aplicaIva = aplicaIva;
                          ordenExistente.requiereFactura = requiereFactura;
                          ordenExistente.anticipo = ant;
                          onGuardarOrden(ordenExistente, esEdicion: true);
                        }

                        Navigator.pop(context);
                        onActualizar();
                      },
                      style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(38)),
                      child: Text(ordenExistente == null ? 'Guardar Orden' : 'Actualizar Orden', style: const TextStyle(fontSize: 13)),
                    ),
                    const SizedBox(height: 10),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }

  // --- DIÁLOGO DE ARTÍCULOS ---
  void _mostrarDialogoAgregarItem(BuildContext parentContext, StateSetter setStateModalPrincipal, List<ItemOrden> listaItems) {
    ProductoBase? productoSeleccionado;
    String colorSeleccionado = '';
    String tallaSeleccionada = '';
    final cantidadController = TextEditingController(text: '1');
    final precioBaseController = TextEditingController();
    List<UbicacionLogoExtra> listaLogosItem = [];

    showDialog(
      context: parentContext,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('Agregar Artículo', style: TextStyle(fontSize: 15)),
              content: SizedBox(
                width: MediaQuery.of(parentContext).size.width * 0.85,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      DropdownButtonFormField<ProductoBase>(
                        isExpanded: true,
                        hint: const Text('Modelo de Prenda', style: TextStyle(fontSize: 12)),
                        items: inventario.map((p) => DropdownMenuItem(value: p, child: Text('${p.nombre} (\$${p.precioBase})', style: const TextStyle(fontSize: 12)))).toList(),
                        onChanged: (val) {
                          setStateDialog(() {
                            productoSeleccionado = val;
                            if (val != null) {
                              if (val.coloresDisponibles.isNotEmpty) colorSeleccionado = val.coloresDisponibles.first;
                              if (val.tallasDisponibles.isNotEmpty) tallaSeleccionada = val.tallasDisponibles.first;
                              precioBaseController.text = val.precioBase.toString();
                            }
                          });
                        },
                      ),
                      if (productoSeleccionado != null) ...[
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                isExpanded: true,
                                value: colorSeleccionado.isEmpty ? null : colorSeleccionado,
                                hint: const Text('Color', style: TextStyle(fontSize: 12)),
                                items: productoSeleccionado!.coloresDisponibles.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 12)))).toList(),
                                onChanged: (val) => setStateDialog(() => colorSeleccionado = val!),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                isExpanded: true,
                                value: tallaSeleccionada.isEmpty ? null : tallaSeleccionada,
                                hint: const Text('Talla', style: TextStyle(fontSize: 12)),
                                items: productoSeleccionado!.tallasDisponibles.map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 12)))).toList(),
                                onChanged: (val) => setStateDialog(() => tallaSeleccionada = val!),
                              ),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 6),
                      TextField(controller: cantidadController, decoration: const InputDecoration(labelText: 'Cantidad', isDense: true), keyboardType: TextInputType.number),
                      TextField(controller: precioBaseController, decoration: const InputDecoration(labelText: 'Precio Base Unitario \$', isDense: true), keyboardType: TextInputType.number),
                      
                      const Divider(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Logos / Extras', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          TextButton.icon(
                            onPressed: () => _mostrarDialogoLogoExtra(parentContext, setStateDialog, listaLogosItem),
                            icon: const Icon(Icons.add, size: 12),
                            label: const Text('Logo', style: TextStyle(fontSize: 11)),
                            style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 24)),
                          )
                        ],
                      ),
                      ...listaLogosItem.asMap().entries.map((entry) {
                        int idx = entry.key;
                        var logo = entry.value;
                        return ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          title: Text('${logo.ubicacion}: ${logo.descripcion}', style: const TextStyle(fontSize: 11)),
                          subtitle: Text('Suma: +\$${logo.costoExtra.toStringAsFixed(2)}', style: const TextStyle(fontSize: 10)),
                          trailing: IconButton(
                            constraints: const BoxConstraints(),
                            padding: EdgeInsets.zero,
                            icon: const Icon(Icons.delete, color: Colors.red, size: 14),
                            onPressed: () => setStateDialog(() => listaLogosItem.removeAt(idx)),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar', style: TextStyle(fontSize: 12))),
                ElevatedButton(
                  onPressed: () {
                    if (productoSeleccionado == null) return;
                    double base = double.tryParse(precioBaseController.text) ?? 0.0;
                    int cant = int.tryParse(cantidadController.text) ?? 1;
                    
                    double extrasTotales = listaLogosItem.fold(0.0, (sum, l) => sum + l.costoExtra);
                    double precioUnitarioFinalUnificado = base + extrasTotales;

                    setStateModalPrincipal(() {
                      listaItems.add(ItemOrden(
                        productoNombre: productoSeleccionado!.nombre,
                        color: colorSeleccionado,
                        talla: tallaSeleccionada,
                        cantidad: cant,
                        precioUnitarioFinal: precioUnitarioFinalUnificado,
                        logotiposExtras: listaLogosItem,
                      ));
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('Agregar', style: TextStyle(fontSize: 12)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // --- SUB-DIÁLOGO DE LOGO EXTRA ---
  void _mostrarDialogoLogoExtra(BuildContext parentContext, StateSetter setStateDialogPadre, List<UbicacionLogoExtra> listaLogosItem) {
    String ubicacion = 'Pecho Izquierdo';
    final descController = TextEditingController();
    final costoController = TextEditingController();
    String? imgPath;

    showDialog(
      context: parentContext,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialogSub) {
            return AlertDialog(
              title: const Text('Logo / Nombre Extra', style: TextStyle(fontSize: 14)),
              content: SizedBox(
                width: MediaQuery.of(parentContext).size.width * 0.7,
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      DropdownButtonFormField<String>(
                        isExpanded: true,
                        value: ubicacion,
                        items: ['Pecho Izquierdo', 'Pecho Derecho', 'Espalda', 'Manga Izq', 'Manga Der', 'Nombre Personalizado'].map((u) => DropdownMenuItem(value: u, child: Text(u, style: const TextStyle(fontSize: 12)))).toList(),
                        onChanged: (val) => setStateDialogSub(() => ubicacion = val!),
                      ),
                      TextField(controller: descController, decoration: const InputDecoration(labelText: 'Descripción', isDense: true)),
                      TextField(controller: costoController, decoration: const InputDecoration(labelText: 'Costo extra unitario \$', isDense: true), keyboardType: TextInputType.number),
                      const SizedBox(height: 6),
                      ElevatedButton.icon(
                        onPressed: () async {
                          final picker = ImagePicker();
                          final image = await picker.pickImage(source: ImageSource.gallery);
                          if (image != null) {
                            setStateDialogSub(() => imgPath = image.path);
                          }
                        },
                        icon: const Icon(Icons.camera_alt, size: 14),
                        label: Text(imgPath == null ? 'Adjuntar Imagen' : 'Imagen Adjunta ✓', style: const TextStyle(fontSize: 11)),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar', style: TextStyle(fontSize: 12))),
                ElevatedButton(
                  onPressed: () {
                    double costo = double.tryParse(costoController.text) ?? 0.0;
                    setStateDialogPadre(() {
                      listaLogosItem.add(UbicacionLogoExtra(
                        ubicacion: ubicacion,
                        descripcion: descController.text.isEmpty ? ubicacion : descController.text,
                        costoExtra: costo,
                        imagenPath: imgPath,
                      ));
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('Añadir', style: TextStyle(fontSize: 12)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _enviarWhatsApp(OrdenTrabajo orden) async {
    String itemsTexto = orden.items.map((i) => '• ${i.cantidad}x ${i.productoNameDetalle()} - \$${i.precioUnitarioFinal.toStringAsFixed(2)} c/u').join('\n');
    final String mensaje = '''
*UNITAP - Pedido*
Cliente: *${orden.cliente}*
$itemsTexto
${orden.costoEnvio > 0 ? '• Envío: \$${orden.costoEnvio.toStringAsFixed(2)}\n' : ''}${orden.aplicaIva ? '• Subtotal: \$${orden.subtotalGeneral.toStringAsFixed(2)}\n• IVA (16%): \$${orden.montoIva.toStringAsFixed(2)}\n' : ''}• *Total: \$${orden.total.toStringAsFixed(2)}*
• Anticipo: \$${orden.anticipo.toStringAsFixed(2)}
• Restante: \$${orden.restante.toStringAsFixed(2)}
''';
    final Uri url = Uri.parse('https://wa.me/${orden.telefono.replaceAll(RegExp(r'\D'), '')}?text=${Uri.encodeComponent(mensaje)}');
    if (await canLaunchUrl(url)) await launchUrl(url, mode: LaunchMode.externalApplication);
  }

  Future<void> _generarYCompartirPDF(OrdenTrabajo orden, DatosNegocio negocio) async {
    final pdf = pw.Document();

    pw.ImageProvider? logoNegocioImage;
    if (negocio.logoPath != null && File(negocio.logoPath!).existsSync()) {
      logoNegocioImage = pw.MemoryImage(File(negocio.logoPath!).readAsBytesSync());
    }

    // HOJA 1: NOTA DE PEDIDO
    pdf.addPage(pw.Page(
      build: (context) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text(negocio.nombre, style: pw.TextStyle(fontSize: 16, fontWeight: pw.Font.bold.)),
                  pw.Text("Tel: ${negocio.telefono}", style: const pw.TextStyle(fontSize: 9)),
                  pw.Text(negocio.direccion, style: const pw.TextStyle(fontSize: 9)),
                ],
              ),
              if (logoNegocioImage != null) pw.Container(width: 40, height: 40, child: pw.Image(logoNegocioImage)),
            ],
          ),
          pw.Divider(thickness: 1.5),
          pw.Text("NOTA DE PEDIDO", style: pw.TextStyle(fontSize: 12, fontWeight: pw.Font.bold.)),
          pw.Text("Cliente: ${orden.cliente} | Fecha: ${orden.fecha.day}/${orden.fecha.month}/${orden.fecha.year}", style: const pw.TextStyle(fontSize: 10)),
          pw.SizedBox(height: 8),
          pw.Table.fromTextArray(
            headers: ['Cant.', 'Prenda', 'P. Unitario', 'Subtotal'],
            headerStyle: pw.TextStyle(fontWeight: pw.Font.bold., fontSize: 10),
            cellStyle: const pw.TextStyle(fontSize: 9),
            data: orden.items.map((i) => [
              '${i.cantidad}',
              i.productoNameDetalle(),
              '\$${i.precioUnitarioFinal.toStringAsFixed(2)}',
              '\$${i.subtotal.toStringAsFixed(2)}'
            ]).toList(),
          ),
          if (orden.costoEnvio > 0) ...[
            pw.SizedBox(height: 4),
            pw.Text("Costo de Envío: \$${orden.costoEnvio.toStringAsFixed(2)}", style: const pw.TextStyle(fontSize: 9)),
          ],
          pw.Spacer(),
          pw.Divider(),
          if (orden.aplicaIva) ...[
            pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [pw.Text("Subtotal:", style: const pw.TextStyle(fontSize: 9)), pw.Text("\$${orden.subtotalGeneral.toStringAsFixed(2)}", style: const pw.TextStyle(fontSize: 9))]),
            pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [pw.Text("IVA (16%):", style: const pw.TextStyle(fontSize: 9)), pw.Text("\$${orden.montoIva.toStringAsFixed(2)}", style: const pw.TextStyle(fontSize: 9))]),
          ],
          pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [pw.Text("Total de la Orden:", style: pw.TextStyle(fontSize: 10, fontWeight: pw.Font.bold.)), pw.Text("\$${orden.total.toStringAsFixed(2)}", style: pw.TextStyle(fontSize: 10, fontWeight: pw.Font.bold.))]),
          pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [pw.Text("Anticipo Recibido:", style: pw.TextStyle(fontSize: 9)), pw.Text("\$${orden.anticipo.toStringAsFixed(2)}", style: pw.TextStyle(fontSize: 9))]),
          pw.Row(mainAxisAlignment: pw.MainAxisAlignment.spaceBetween, children: [pw.Text("Restante a Pagar:", style: pw.TextStyle(fontSize: 10, fontWeight: pw.Font.bold., color: PdfColors.red)), pw.Text("\$${orden.restante.toStringAsFixed(2)}", style: pw.TextStyle(fontSize: 10, fontWeight: pw.Font.bold., color: PdfColors.red))]),
        ],
      ),
    ));

    // HOJA 2: GUÍA DE PRODUCCIÓN
    pdf.addPage(pw.Page(
      build: (context) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text("GUÍA DE PRODUCCIÓN", style: pw.TextStyle(fontSize: 14, fontWeight: pw.Font.bold.)),
          pw.Text("Cliente: ${orden.cliente}", style: const pw.TextStyle(fontSize: 9)),
          pw.Divider(),
          pw.SizedBox(height: 6),
          ...orden.items.expand((item) => item.logotiposExtras.map((logo) {
            pw.ImageProvider? imgLogo;
            if (logo.imagenPath != null && File(logo.imagenPath!).existsSync()) {
              imgLogo = pw.MemoryImage(File(logo.imagenPath!).readAsBytesSync());
            }
            return pw.Container(
              margin: const pw.EdgeInsets.only(bottom: 8),
              padding: const pw.EdgeInsets.all(4),
              decoration: pw.BoxDecoration(border: pw.Border.all(color: PdfColors.grey), borderRadius: const pw.BorderRadius.all(pw.Radius.circular(4))),
              child: pw.Row(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  if (imgLogo != null) ...[
                    pw.Container(width: 40, height: 40, child: pw.Image(imgLogo)),
                    pw.SizedBox(width: 8),
                  ],
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text("Prenda: ${item.productoNameDetalle()}", style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700)),
                      pw.Text("Ubicación: ${logo.ubicacion.toUpperCase()}", style: pw.TextStyle(fontWeight: pw.Font.bold., fontSize: 10, color: PdfColors.blue800)),
                      pw.Text("Detalle: ${logo.descripcion}", style: const pw.TextStyle(fontSize: 8)),
                    ],
                  ),
                ],
              ),
            );
          })),
        ],
      ),
    ));

    final output = await getTemporaryDirectory();
    final file = File("${output.path}/orden_${orden.cliente}.pdf");
    await file.writeAsBytes(await pdf.save());
    await Share.shareXFiles([XFile(file.path)], text: 'Nota de Pedido - ${orden.cliente}');
  }
}

extension ItemExt on ItemOrden {
  String productoNameDetalle() => '$productoNombre ($color, $talla)';
}

// --- VISTA 2: PIEZAS PENDIENTES DE SURTIR ---
class VistaPendientesSurtir extends StatelessWidget {
  final List<OrdenTrabajo> ordenes;
  final VoidCallback onActualizar;

  const VistaPendientesSurtir({super.key, required this.ordenes, required this.onActualizar});

  @override
  Widget build(BuildContext context) {
    return ordenes.isEmpty
        ? const Center(child: Text('No hay piezas pendientes.', style: TextStyle(fontSize: 13)))
        : ListView.builder(
            itemCount: ordenes.length,
            itemBuilder: (context, index) {
              final orden = ordenes[index];
              return Card(
                color: Colors.orange[50],
                margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                child: ListTile(
                  dense: true,
                  title: Text('Cliente: ${orden.cliente}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text('Falta stock para esta orden.', style: const TextStyle(fontSize: 11)),
                  trailing: ElevatedButton(
                    onPressed: () {
                      orden.estatusInventario = 'Surtido';
                      orden.estatusProduccion = 'En Producción';
                      onActualizar();
                    },
                    style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0), minimumSize: const Size(0, 26)),
                    child: const Text('Surtido', style: TextStyle(fontSize: 11)),
                  ),
                ),
              );
            },
          );
  }
}

// --- VISTA 3: FACTURAS PENDIENTES (CFDI) ---
class VistaFacturasPendientes extends StatelessWidget {
  final List<OrdenTrabajo> ordenes;
  final VoidCallback onActualizar;

  const VistaFacturasPendientes({super.key, required this.ordenes, required this.onActualizar});

  @override
  Widget build(BuildContext context) {
    return ordenes.isEmpty
        ? const Center(child: Text('No hay facturas pendientes de emitir.', style: TextStyle(fontSize: 13)))
        : ListView.builder(
            itemCount: ordenes.length,
            itemBuilder: (context, index) {
              final orden = ordenes[index];
              return Card(
                color: Colors.purple[50],
                margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                child: ListTile(
                  dense: true,
                  title: Text('Cliente: ${orden.cliente}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text('Total con IVA: \$${orden.total.toStringAsFixed(2)}\nRequiere Factura CFDI', style: const TextStyle(fontSize: 11)),
                  isThreeLine: true,
                  trailing: ElevatedButton(
                    onPressed: () {
                      orden.facturaEmitida = true;
                      onActualizar();
                    },
                    style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0), minimumSize: const Size(0, 26)),
                    child: const Text('Facturado', style: TextStyle(fontSize: 11)),
                  ),
                ),
              );
            },
          );
  }
}

// --- VISTA 4: HISTORIAL DE PEDIDOS FINALIZADOS ---
class VistaHistorialMes extends StatefulWidget {
  final List<OrdenTrabajo> ordenes;
  const VistaHistorialMes({super.key, required this.ordenes});

  @override
  State<VistaHistorialMes> createState() => _VistaHistorialMesState();
}

class _VistaHistorialMesState extends State<VistaHistorialMes> {
  int _mesSeleccionado = DateTime.now().month;
  int _anioSeleccionado = DateTime.now().year;

  final List<String> _meses = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  @override
  Widget build(BuildContext context) {
    final ordenesFiltradas = widget.ordenes.where((o) => o.fecha.month == _mesSeleccionado && o.fecha.year == _anioSeleccionado).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(4.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Mes: ', style: TextStyle(fontSize: 12)),
              DropdownButton<int>(
                value: _mesSeleccionado,
                items: List.generate(12, (index) => DropdownMenuItem(value: index + 1, child: Text(_meses[index], style: const TextStyle(fontSize: 12)))),
                onChanged: (val) => setState(() => _mesSeleccionado = val!),
              ),
            ],
          ),
        ),
        Expanded(
          child: ordenesFiltradas.isEmpty
              ? const Center(child: Text('Sin pedidos finalizados.', style: TextStyle(fontSize: 13)))
              : ListView.builder(
                  itemCount: ordenesFiltradas.length,
                  itemBuilder: (context, index) {
                    final o = ordenesFiltradas[index];
                    return ListTile(
                      dense: true,
                      title: Text(o.cliente, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      subtitle: Text('${o.items.length} artículos - ${o.fecha.day}/${o.fecha.month}/${o.fecha.year}', style: const TextStyle(fontSize: 11)),
                      trailing: Text('\$${o.total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

// --- VISTA 5: INVENTARIO Y STOCK ---
class VistaInventario extends StatelessWidget {
  final List<ProductoBase> inventario;
  final VoidCallback onActualizar;
  
  const VistaInventario({super.key, required this.inventario, required this.onActualizar});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: inventario.length,
      itemBuilder: (context, index) {
        final p = inventario[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: ListTile(
            dense: true,
            title: Text(p.nombre, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            subtitle: Text('Base: \$${p.precioBase.toStringAsFixed(2)} | Colores: ${p.coloresDisponibles.join(", ")}', style: const TextStyle(fontSize: 11)),
            trailing: Chip(
              label: Text('Stock: ${p.stockGeneral}', style: const TextStyle(fontSize: 10)),
              backgroundColor: p.stockGeneral < 3 ? Colors.red[100] : Colors.green[100],
              padding: EdgeInsets.zero,
            ),
          ),
        );
      },
    );
  }
}
