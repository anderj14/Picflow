import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

type RolUsuario = 'Administrador' | 'Fotografo' | 'Recepcionista';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  creadoEn: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  usuarios = signal<Usuario[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  errorMsg = signal('');
  searchQuery = signal('');
  filterRol = signal<RolUsuario | 'Todos'>('Todos');

  readonly roles: RolUsuario[] = ['Administrador', 'Fotografo', 'Recepcionista'];
  readonly rolFiltros: (RolUsuario | 'Todos')[] = ['Todos', 'Administrador', 'Fotografo', 'Recepcionista'];

  form = this.emptyForm();

  readonly filtered = computed(() => {
    let list = this.usuarios();
    const q = this.searchQuery().toLowerCase();
    const rol = this.filterRol();
    if (rol !== 'Todos') list = list.filter(u => u.rol === rol);
    if (q) list = list.filter(u =>
      u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
    return list;
  });

  readonly stats = computed(() => {
    const all = this.usuarios();
    return {
      total: all.length,
      activos: all.filter(u => u.activo).length,
      admins: all.filter(u => u.rol === 'Administrador').length,
      fotografos: all.filter(u => u.rol === 'Fotografo').length,
      recepcionistas: all.filter(u => u.rol === 'Recepcionista').length,
    };
  });

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getUsuarios().subscribe({
      next: (data) => { this.usuarios.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.form = this.emptyForm();
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  save() {
    if (!this.form.nombre || !this.form.email || !this.form.password) {
      this.errorMsg.set('Nombre, email y contraseña son obligatorios.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set('');
    this.api.registrarUsuario(this.form).subscribe({
      next: () => { this.closeModal(); this.load(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al registrar usuario.');
        this.saving.set(false);
      },
    });
  }

  changeRol(usuario: Usuario, rol: RolUsuario) {
    if (usuario.rol === rol) return;
    this.api.updateRolUsuario(usuario.id, rol).subscribe({
      next: (updated) => {
        this.usuarios.update(list =>
          list.map(u => u.id === usuario.id ? { ...u, rol: updated.rol } : u)
        );
      },
      error: () => alert('Error al cambiar el rol.'),
    });
  }

  toggleActivo(usuario: Usuario) {
    this.api.toggleActivoUsuario(usuario.id).subscribe({
      next: (updated) => {
        this.usuarios.update(list =>
          list.map(u => u.id === usuario.id ? { ...u, activo: updated.activo } : u)
        );
      },
      error: () => alert('Error al cambiar el estado.'),
    });
  }

  getRolClass(rol: RolUsuario): string {
    const map: Record<RolUsuario, string> = {
      Administrador: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Fotografo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Recepcionista: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    };
    return map[rol] ?? 'bg-slate-100 text-slate-600';
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  private emptyForm() {
    return { nombre: '', email: '', password: '', rol: 'Recepcionista' as RolUsuario };
  }
}
