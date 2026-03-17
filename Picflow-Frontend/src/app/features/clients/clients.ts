import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Cliente, CreateClienteRequest } from '../../core/models/cliente.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './clients.html',
})
export class Clients implements OnInit {
  clientes      = signal<Cliente[]>([]);
  loading       = signal(true);
  searchQuery   = signal('');
  showModal     = signal(false);
  saving        = signal(false);
  editingId     = signal<string | null>(null);
  errorMsg      = signal('');

  // Pagination
  currentPage   = signal(1);
  pageSize      = 8;

  form: CreateClienteRequest = this.emptyForm();

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.clientes();
    return this.clientes().filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.telefono.includes(q) ||
      c.cedula.includes(q)
    );
  });

  readonly paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.filtered().length / this.pageSize)
  );

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.loading.set(true);
    this.api.getClientes().subscribe({
      next: (data) => { this.clientes.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false),
    });
  }

  openCreate() {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  openEdit(cliente: Cliente) {
    this.form = {
      nombre:    cliente.nombre,
      telefono:  cliente.telefono,
      email:     cliente.email,
      cedula:    cliente.cedula,
      direccion: cliente.direccion,
      notas:     cliente.notas,
    };
    this.editingId.set(cliente.id);
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  save() {
    if (!this.form.nombre.trim() || !this.form.email.trim()) {
      this.errorMsg.set('Nombre y correo son obligatorios.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');

    const id = this.editingId();
    const request$ = id
      ? this.api.updateCliente(id, this.form)
      : this.api.createCliente(this.form);

    request$.subscribe({
      next: () => { this.closeModal(); this.loadClientes(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al guardar.');
        this.saving.set(false);
      },
    });
  }

  delete(id: string) {
    if (!confirm('¿Eliminar este cliente?')) return;
    this.api.deleteCliente(id).subscribe({
      next: () => this.loadClientes(),
      error: ()  => alert('No se pudo eliminar el cliente.'),
    });
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  private emptyForm(): CreateClienteRequest {
    return { nombre: '', telefono: '', email: '', cedula: '', direccion: '', notas: '' };
  }
}