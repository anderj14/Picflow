import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SlotDisponibilidad, ReservaPublicaRequest, ReservaConfirmadaResponse } from '../../core/models/booking.model';

type Step = 'calendar' | 'slots' | 'form' | 'success';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './booking.html',
})
export class Booking implements OnInit {
  step = signal<Step>('calendar');
  loadingSlots = signal(false);
  submitting   = signal(false);
  errorMsg     = signal('');

  // Calendar
  currentDate    = signal(new Date());
  selectedDate   = signal<Date | null>(null);

  // Slots
  slots     = signal<SlotDisponibilidad[]>([]);
  selectedSlot = signal<SlotDisponibilidad | null>(null);

  // Form
  form: ReservaPublicaRequest = this.emptyForm();

  // Success
  confirmacion = signal<ReservaConfirmadaResponse | null>(null);

  readonly currentMonthLabel = computed(() =>
    this.currentDate().toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })
  );

  readonly calendarDays = computed(() => {
    const date  = this.currentDate();
    const year  = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days  = new Date(year, month + 1, 0).getDate();
    const prev  = new Date(year, month, 0).getDate();
    const cells: { day: number; currentMonth: boolean; date: Date; isPast: boolean }[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);

    for (let i = first - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prev - i);
      cells.push({ day: prev - i, currentMonth: false, date: d, isPast: d < today });
    }
    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      cells.push({ day: d, currentMonth: true, date, isPast: date < today });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      cells.push({ day: d, currentMonth: false, date, isPast: date < today });
    }
    return cells;
  });

  readonly isCurrentMonthOrFuture = computed(() => {
    const now = new Date();
    const cur = this.currentDate();
    return cur.getFullYear() > now.getFullYear() ||
      (cur.getFullYear() === now.getFullYear() && cur.getMonth() >= now.getMonth());
  });

  readonly servicios = [
    'Sesión de estudio',
    'Fotografía de bodas',
    'Fotografía corporativa',
    'Fotografía familiar',
    'Fotografía de eventos',
    'Fotografía de producto',
    'Otro',
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {}

  prevMonth() {
    const now = new Date();
    const cur = this.currentDate();
    if (cur.getFullYear() === now.getFullYear() && cur.getMonth() <= now.getMonth()) return;
    const d = new Date(cur);
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
  }

  nextMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
  }

  selectDate(date: Date, isPast: boolean) {
    if (isPast) return;
    this.selectedDate.set(date);
    this.step.set('slots');
    this.loadingSlots.set(true);
    this.slots.set([]);
    this.selectedSlot.set(null);
    this.errorMsg.set('');

    // Format fecha as ISO without time
    const fechaStr = date.toISOString().split('T')[0] + 'T00:00:00';
    this.api.getDisponibilidad(fechaStr).subscribe({
      next: (data) => { this.slots.set(data); this.loadingSlots.set(false); },
      error: () => { this.errorMsg.set('No se pudieron cargar los horarios.'); this.loadingSlots.set(false); },
    });
  }

  selectSlot(slot: SlotDisponibilidad) {
    if (!slot.disponible) return;
    this.selectedSlot.set(slot);
    this.form.fechaHora = slot.fechaHora;
    this.step.set('form');
    this.errorMsg.set('');
  }

  backToCalendar() {
    this.step.set('calendar');
    this.selectedDate.set(null);
  }

  backToSlots() {
    this.step.set('slots');
    this.errorMsg.set('');
  }

  submit() {
    if (!this.form.nombre.trim() || !this.form.email.trim() || !this.form.telefono.trim() || !this.form.servicio) {
      this.errorMsg.set('Nombre, correo, teléfono y servicio son obligatorios.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
      this.errorMsg.set('Ingresa un correo electrónico válido.');
      return;
    }

    this.submitting.set(true);
    this.errorMsg.set('');

    this.api.reservarCita(this.form).subscribe({
      next: (res) => {
        this.confirmacion.set(res);
        this.step.set('success');
        this.submitting.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Ocurrió un error al enviar tu solicitud. Intenta nuevamente.');
        this.submitting.set(false);
      },
    });
  }

  isSelectedDate(date: Date): boolean {
    const sel = this.selectedDate();
    return !!sel && date.toDateString() === sel.toDateString();
  }

  isToday(date: Date): boolean {
    return date.toDateString() === new Date().toDateString();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-DO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-DO', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  readonly stepsDef = [
    { key: 'calendar' as Step, label: 'Fecha' },
    { key: 'slots'    as Step, label: 'Horario' },
    { key: 'form'     as Step, label: 'Datos' },
    { key: 'success'  as Step, label: 'Confirmación' },
  ];

  private readonly stepOrder: Step[] = ['calendar', 'slots', 'form', 'success'];

  getStepClass(key: Step): string {
    if (this.isStepDone(key))  return 'bg-primary text-white';
    if (this.isActiveStep(key)) return 'bg-primary text-white ring-4 ring-primary/20';
    return 'bg-slate-100 text-slate-400';
  }

  isActiveStep(key: Step): boolean {
    return this.step() === key;
  }

  isStepDone(key: Step): boolean {
    const currentIdx = this.stepOrder.indexOf(this.step());
    const keyIdx     = this.stepOrder.indexOf(key);
    return keyIdx < currentIdx;
  }

  getDayClass(cell: { day: number; currentMonth: boolean; date: Date; isPast: boolean }): string {
    if (!cell.currentMonth || cell.isPast)
      return 'text-slate-200 cursor-default';
    if (this.isSelectedDate(cell.date))
      return 'bg-primary text-white shadow-md';
    if (this.isToday(cell.date))
      return 'ring-2 ring-primary text-primary font-bold hover:bg-primary/10';
    return 'text-slate-700 hover:bg-slate-100 cursor-pointer';
  }

  getSlotClass(slot: SlotDisponibilidad): string {
    if (!slot.disponible)
      return 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50';
    if (this.selectedSlot()?.hora === slot.hora)
      return 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30';
    return 'border-slate-200 text-slate-700 hover:border-primary hover:bg-primary/5 hover:text-primary cursor-pointer';
  }

  private emptyForm(): ReservaPublicaRequest {
    return {
      nombre: '', email: '', telefono: '', cedula: '',
      servicio: '', fechaHora: '', duracionMinutos: 60,
      notas: '', ubicacion: '',
    };
  }
}
