import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Categoria, Servicio, SubCategoria, TipoSubCategoria } from '../../core/models/catalogo.model';

type CatalogTab = 'categorias' | 'servicios';

interface ServicioForm {
  nombre: string;
  descripcion: string;
  categoriaId: string;
  subCategoriaId: string;
  precioBase: number;
  codigoBarras: string;
}

interface SubCategoriaForm {
  nombre: string;
  tipo: TipoSubCategoria;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './catalog.html',
})
export class Catalog implements OnInit {
  activeTab = signal<CatalogTab>('categorias');

  categorias = signal<Categoria[]>([]);
  servicios = signal<Servicio[]>([]);
  loading = signal(true);
  saving = signal(false);
  errorMsg = signal('');

  // Modals
  showCategoriaModal = signal(false);
  showServicioModal = signal(false);
  showSubCategoriaModal = signal(false);
  selectedCategoria = signal<Categoria | null>(null);

  searchQuery = signal('');

  // Category form
  categoriaForm = this.emptyCategoriaForm();
  subCategorias: SubCategoriaForm[] = [{ nombre: '', tipo: 'Tamanio' }];

  // SubCategory form (add to existing)
  subCategoriaForm: SubCategoriaForm = { nombre: '', tipo: 'Tamanio' };

  // Service form
  servicioForm: ServicioForm = this.emptyServicioForm();
  editingServicioId = signal<string | null>(null);

  readonly tipoOptions: TipoSubCategoria[] = ['Tamanio', 'TipoAcabado'];

  readonly filteredCategorias = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return q
      ? this.categorias().filter(c => c.nombre.toLowerCase().includes(q))
      : this.categorias();
  });

  readonly filteredServicios = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return q
      ? this.servicios().filter(s =>
          s.nombre.toLowerCase().includes(q) ||
          s.nombreCategoria.toLowerCase().includes(q) ||
          s.codigoBarras.toLowerCase().includes(q)
        )
      : this.servicios();
  });

  readonly subCategoriasDeCategoria = computed(() => {
    const id = this.servicioForm.categoriaId;
    return this.categorias().find(c => c.id === id)?.subCategorias ?? [];
  });

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.api.getCategorias().subscribe({ next: d => this.categorias.set(d) });
    this.api.getServicios().subscribe({
      next: d => { this.servicios.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // ── Categorias ────────────────────────────────────────────────────────────
  openCreateCategoria() {
    this.categoriaForm = this.emptyCategoriaForm();
    this.subCategorias = [{ nombre: '', tipo: 'Tamanio' }];
    this.errorMsg.set('');
    this.showCategoriaModal.set(true);
  }

  closeCategoriaModal() {
    this.showCategoriaModal.set(false);
  }

  addSubCategoriaRow() {
    this.subCategorias.push({ nombre: '', tipo: 'Tamanio' });
  }

  removeSubCategoriaRow(index: number) {
    if (this.subCategorias.length > 1) this.subCategorias.splice(index, 1);
  }

  saveCategoria() {
    if (!this.categoriaForm.nombre.trim()) {
      this.errorMsg.set('El nombre de la categoría es requerido.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set('');

    this.api.createCategoria({
      nombre: this.categoriaForm.nombre.trim(),
      descripcion: this.categoriaForm.descripcion.trim(),
      subCategorias: this.subCategorias.filter(s => s.nombre.trim()),
    }).subscribe({
      next: () => { this.closeCategoriaModal(); this.loadAll(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al crear la categoría.');
        this.saving.set(false);
      },
    });
  }

  openAddSubCategoria(categoria: Categoria) {
    this.selectedCategoria.set(categoria);
    this.subCategoriaForm = { nombre: '', tipo: 'Tamanio' };
    this.errorMsg.set('');
    this.showSubCategoriaModal.set(true);
  }

  closeSubCategoriaModal() {
    this.showSubCategoriaModal.set(false);
    this.selectedCategoria.set(null);
  }

  saveSubCategoria() {
    const cat = this.selectedCategoria();
    if (!cat || !this.subCategoriaForm.nombre.trim()) {
      this.errorMsg.set('El nombre es requerido.');
      return;
    }
    this.saving.set(true);
    this.api.agregarSubCategoria(cat.id, this.subCategoriaForm).subscribe({
      next: () => { this.closeSubCategoriaModal(); this.loadAll(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al agregar sub-categoría.');
        this.saving.set(false);
      },
    });
  }

  deleteCategoria(id: string) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    this.api.deleteCategoria(id).subscribe({ next: () => this.loadAll() });
  }

  // ── Servicios ─────────────────────────────────────────────────────────────
  openCreateServicio() {
    this.servicioForm = this.emptyServicioForm();
    this.editingServicioId.set(null);
    this.errorMsg.set('');
    this.showServicioModal.set(true);
  }

  openEditServicio(s: Servicio) {
    this.servicioForm = {
      nombre: s.nombre,
      descripcion: s.descripcion,
      categoriaId: s.categoriaId,
      subCategoriaId: s.subCategoriaId,
      precioBase: s.precioBase,
      codigoBarras: s.codigoBarras,
    };
    this.editingServicioId.set(s.id);
    this.errorMsg.set('');
    this.showServicioModal.set(true);
  }

  closeServicioModal() {
    this.showServicioModal.set(false);
    this.editingServicioId.set(null);
  }

  saveServicio() {
    if (!this.servicioForm.nombre.trim() || !this.servicioForm.categoriaId) {
      this.errorMsg.set('Nombre y categoría son requeridos.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set('');

    const editId = this.editingServicioId();
    const data = {
      nombre: this.servicioForm.nombre.trim(),
      descripcion: this.servicioForm.descripcion.trim(),
      categoriaId: this.servicioForm.categoriaId,
      subCategoriaId: this.servicioForm.subCategoriaId,
      precioBase: this.servicioForm.precioBase,
      codigoBarras: this.servicioForm.codigoBarras.trim(),
    };

    const obs$ = editId
      ? this.api.updateServicio(editId, data)
      : this.api.createServicio(data);

    obs$.subscribe({
      next: () => { this.closeServicioModal(); this.loadAll(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al guardar el servicio.');
        this.saving.set(false);
      },
    });
  }

  deleteServicio(id: string) {
    if (!confirm('¿Eliminar este servicio?')) return;
    this.api.deleteServicio(id).subscribe({ next: () => this.loadAll() });
  }

  // ── Utils ─────────────────────────────────────────────────────────────────
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency', currency: 'DOP', maximumFractionDigits: 0
    }).format(value);
  }

  getTipoLabel(tipo: TipoSubCategoria): string {
    return tipo === 'Tamanio' ? 'Tamaño' : 'Tipo Acabado';
  }

  private emptyCategoriaForm() {
    return { nombre: '', descripcion: '' };
  }

  private emptyServicioForm(): ServicioForm {
    return { nombre: '', descripcion: '', categoriaId: '', subCategoriaId: '', precioBase: 0, codigoBarras: '' };
  }
}
