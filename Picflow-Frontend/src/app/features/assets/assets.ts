import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Fotografia } from '../../core/models/fotografia.model';
import { Cliente } from '../../core/models/cliente.model';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './assets.html',
})
export class Assets implements OnInit {
  fotografias = signal<Fotografia[]>([]);
  clientes = signal<Cliente[]>([]);
  loading = signal(true);
  uploading = signal(false);
  uploadProgress = signal(0);
  selectedClienteId = signal('');
  filterEntregada = signal<'todas' | 'entregadas' | 'pendientes'>('todas');
  viewMode = signal<'grid' | 'list'>('grid');
  selectedIds = signal<Set<string>>(new Set());
  errorMsg = signal('');
  successMsg = signal('');

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

  constructor(private api: ApiService) { }

  ngOnInit() {
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
    const all = new Set(this.filtered().map(f => f.id));
    this.selectedIds.set(all);
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
          if (completed === ids.length) {
            this.loadFotos(this.selectedClienteId());
          }
        },
      });
    });
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
}