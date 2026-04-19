import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Fotografia, OpcionImpresion } from '../../core/models/fotografia.model';
import { Cliente } from '../../core/models/cliente.model';
import { Categoria, Servicio } from '../../core/models/catalogo.model';

interface OpcionForm {
  categoriaId: string;
  subCategoriaId: string;
  servicioId: string;
  tamanio: string;
  tipoAcabado: string;
  cantidad: number;
  precioUnitario: number;
}

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './assets.html',
})
export class Assets implements OnInit {
  fotografias = signal<Fotografia[]>([]);
  clientes = signal<Cliente[]>([]);
  categorias = signal<Categoria[]>([]);
  servicios = signal<Servicio[]>([]);
  loading = signal(true);
  uploading = signal(false);
  uploadProgress = signal(0);
  selectedClienteId = signal('');
  filterEntregada = signal<'todas' | 'entregadas' | 'pendientes'>('todas');
  viewMode = signal<'grid' | 'list'>('grid');
  selectedIds = signal<Set<string>>(new Set());
  errorMsg = signal('');
  successMsg = signal('');

  // Opciones de impresión
  showOpcionModal = signal(false);
  selectedFotografia = signal<Fotografia | null>(null);
  opcionForm: OpcionForm = this.emptyOpcionForm();
  savingOpcion = signal(false);

  readonly filtered = computed(() => {
    let result = this.fotografias();
    const f = this.filterEntregada();
    if (f === 'entregadas') result = result.filter(x => x.entregada);
    if (f === 'pendientes') result = result.filter(x => !x.entregada);
    return result;
  });

  readonly totalSize = computed(() => {
    const bytes = this.fotografias().reduce((s, f) => s + f.tamanioBytes, 0);
    return (bytes / (1024 * 1024)).toFixed(1);
  });

  readonly subCategoriasDeForm = computed(() => {
    const id = this.opcionForm.categoriaId;
    return this.categorias().find(c => c.id === id)?.subCategorias ?? [];
  });

  readonly serviciosDeCategoria = computed(() => {
    const id = this.opcionForm.categoriaId;
    return id ? this.servicios().filter(s => s.categoriaId === id) : this.servicios();
  });

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getCategorias().subscribe({ next: d => this.categorias.set(d) });
    this.api.getServicios().subscribe({ next: d => this.servicios.set(d) });
    this.api.getClientes().subscribe({
      next: (data) => {
        this.clientes.set(data);
        if (data.length > 0) {
          this.selectedClienteId.set(data[0].id);
          this.loadFotos(data[0].id);
        } else {
          this.loading.set(false);
        }
      },
    });
  }

  loadFotos(clienteId: string) {
    this.loading.set(true);
    this.selectedIds.set(new Set());
    this.api.getFotografiasByCliente(clienteId).subscribe({
      next: (data) => { this.fotografias.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onClienteChange(clienteId: string) {
    this.selectedClienteId.set(clienteId);
    this.loadFotos(clienteId);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const clienteId = this.selectedClienteId();
    if (!clienteId) {
      this.errorMsg.set('Selecciona un cliente primero.');
      return;
    }

    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.errorMsg.set('');

    const files = Array.from(input.files);
    let completed = 0;

    files.forEach(file => {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('clienteId', clienteId);
      formData.append('titulo', file.name.replace(/\.[^.]+$/, ''));

      this.api.uploadFotografia(formData).subscribe({
        next: () => {
          completed++;
          this.uploadProgress.set(Math.round((completed / files.length) * 100));
          if (completed === files.length) {
            this.uploading.set(false);
            this.successMsg.set(`${files.length} foto(s) subida(s) exitosamente.`);
            setTimeout(() => this.successMsg.set(''), 3000);
            this.loadFotos(clienteId);
          }
        },
        error: () => {
          completed++;
          if (completed === files.length) {
            this.uploading.set(false);
            this.errorMsg.set('Algunas fotos no pudieron subirse.');
          }
        },
      });
    });

    input.value = '';
  }

  toggleSelect(id: string) {
    const set = new Set(this.selectedIds());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedIds.set(set);
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  selectAll() {
    this.selectedIds.set(new Set(this.filtered().map(f => f.id)));
  }

  clearSelection() {
    this.selectedIds.set(new Set());
  }

  marcarEntregadas() {
    const ids = Array.from(this.selectedIds());
    if (!ids.length) return;
    this.api.marcarEntregadas(ids).subscribe({
      next: () => {
        this.successMsg.set(`${ids.length} foto(s) marcadas como entregadas.`);
        setTimeout(() => this.successMsg.set(''), 3000);
        this.loadFotos(this.selectedClienteId());
      },
    });
  }

  deleteSelected() {
    const ids = Array.from(this.selectedIds());
    if (!ids.length || !confirm(`¿Eliminar ${ids.length} foto(s)?`)) return;
    let completed = 0;
    ids.forEach(id => {
      this.api.deleteFotografia(id).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length) this.loadFotos(this.selectedClienteId());
        },
      });
    });
  }

  // ── Opciones de impresión ─────────────────────────────────────────────────
  openOpcionModal(foto: Fotografia) {
    this.selectedFotografia.set(foto);
    this.opcionForm = this.emptyOpcionForm();
    this.showOpcionModal.set(true);
  }

  closeOpcionModal() {
    this.showOpcionModal.set(false);
    this.selectedFotografia.set(null);
  }

  onServicioOpcionChange() {
    const servicio = this.servicios().find(s => s.id === this.opcionForm.servicioId);
    if (servicio) {
      this.opcionForm.precioUnitario = servicio.precioBase;
      if (!this.opcionForm.categoriaId) this.opcionForm.categoriaId = servicio.categoriaId;
    }
  }

  saveOpcion() {
    const foto = this.selectedFotografia();
    if (!foto) return;

    this.savingOpcion.set(true);
    this.api.agregarOpcionImpresion(foto.id, this.opcionForm).subscribe({
      next: (updated) => {
        this.fotografias.update(fotos =>
          fotos.map(f => f.id === updated.id ? updated : f)
        );
        this.closeOpcionModal();
        this.savingOpcion.set(false);
        this.successMsg.set('Opción de impresión agregada.');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => { this.savingOpcion.set(false); },
    });
  }

  eliminarOpcion(foto: Fotografia, subCategoriaId: string) {
    if (!confirm('¿Eliminar esta opción de impresión?')) return;
    this.api.eliminarOpcionImpresion(foto.id, subCategoriaId).subscribe({
      next: (updated) => {
        this.fotografias.update(fotos =>
          fotos.map(f => f.id === updated.id ? updated : f)
        );
      },
    });
  }

  totalOpcionesImpresion(foto: Fotografia): number {
    return foto.opcionesImpresion.reduce((s, o) => s + o.cantidad, 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency', currency: 'DOP', maximumFractionDigits: 0
    }).format(value);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  onFilterChange(value: string) {
    this.filterEntregada.set(value as 'todas' | 'entregadas' | 'pendientes');
  }

  getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  getClienteNombre(): string {
    return this.clientes().find(c => c.id === this.selectedClienteId())?.nombre ?? '';
  }

  private emptyOpcionForm(): OpcionForm {
    return {
      categoriaId: '', subCategoriaId: '', servicioId: '',
      tamanio: '', tipoAcabado: '', cantidad: 1, precioUnitario: 0,
    };
  }
}
