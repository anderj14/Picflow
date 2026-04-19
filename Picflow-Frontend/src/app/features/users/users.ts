import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Usuario, RolUsuario } from '../../core/models/usuario.model';

interface RegisterForm {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol: RolUsuario;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  usuarios     = signal<Usuario[]>([]);
  loading      = signal(true);
  searchQuery  = signal('');
  showModal    = signal(false);
  showRolModal = signal(false);
  saving       = signal(false);
  errorMsg     = signal('');

  editingUsuario = signal<Usuario | null>(null);
  selectedRol    = signal<RolUsuario>('Recepcionista');

  readonly roles: RolUsuario[] = ['Administrador', 'Fotografo', 'Recepcionista'];

  form: RegisterForm = this.emptyForm();

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.usuarios();
    return this.usuarios().filter(u =>
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    );
  });

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getUsuarios().subscribe({
      next: (data) => { this.usuarios.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false),
    });
  }

  openCreate() {
    this.form = this.emptyForm();
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  save() {
    if (!this.form.nombre.trim() || !this.form.email.trim() || !this.form.password.trim()) {
      this.errorMsg.set('Nombre, correo y contraseña son obligatorios.');
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.errorMsg.set('Las contraseñas no coinciden.');
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');

    this.api.registerUsuario({
      nombre:   this.form.nombre,
      email:    this.form.email,
      password: this.form.password,
      rol:      this.form.rol,
    }).subscribe({
      next: () => { this.closeModal(); this.load(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al registrar usuario.');
        this.saving.set(false);
      },
    });
  }

  openEditRol(usuario: Usuario) {
    this.editingUsuario.set(usuario);
    this.selectedRol.set(usuario.rol);
    this.errorMsg.set('');
    this.showRolModal.set(true);
  }

  closeRolModal() {
    this.showRolModal.set(false);
    this.editingUsuario.set(null);
  }

  saveRol() {
    const usuario = this.editingUsuario();
    if (!usuario) return;

    this.saving.set(true);
    this.errorMsg.set('');

    this.api.updateRolUsuario(usuario.id, this.selectedRol()).subscribe({
      next: () => { this.closeRolModal(); this.load(); this.saving.set(false); },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al actualizar rol.');
        this.saving.set(false);
      },
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

  rolColor(rol: RolUsuario): string {
    switch (rol) {
      case 'Administrador': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
      case 'Fotografo':     return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Recepcionista': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
  }

  private emptyForm(): RegisterForm {
    return { nombre: '', email: '', password: '', confirmPassword: '', rol: 'Recepcionista' };
  }
}
