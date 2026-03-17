import {
  Component, OnInit, signal, computed,
  AfterViewInit, ElementRef, ViewChild
} from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Factura } from '../../core/models/factura.model';
import { Cita } from '../../core/models/cita.model';


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [],
  templateUrl: './reports.html',
})
export class Reports implements OnInit, AfterViewInit {
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  readonly Object = Object;


  facturas = signal<Factura[]>([]);
  citas = signal<Cita[]>([]);
  loading = signal(true);

  private revenueChartInstance: any;
  private statusChartInstance: any;

  readonly stats = computed(() => {
    const f = this.facturas();
    const c = this.citas();
    const totalRevenue = f.filter(x => x.estado === 'Pagada').reduce((s, x) => s + x.total, 0);
    const totalPendiente = f.filter(x => x.estado !== 'Pagada').reduce((s, x) => s + x.saldoPendiente, 0);
    const avgBooking = f.length ? totalRevenue / f.filter(x => x.estado === 'Pagada').length : 0;
    return {
      totalRevenue, totalPendiente, avgBooking,
      totalCitas: c.length,
      completadas: c.filter(x => x.estado === 'Completada').length,
      pendientes: c.filter(x => x.estado === 'Pendiente').length,
      canceladas: c.filter(x => x.estado === 'Cancelada').length,
    };
  });

  readonly monthlyRevenue = computed(() => {
    const months: Record<string, number> = {};
    this.facturas()
      .filter(f => f.estado === 'Pagada')
      .forEach(f => {
        const key = new Date(f.fecha).toLocaleDateString('es-DO',
          { month: 'short', year: '2-digit' });
        months[key] = (months[key] ?? 0) + f.total;
      });
    return months;
  });

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getFacturas().subscribe({
      next: (data) => {
        this.facturas.set(data);
        this.loading.set(false);
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => this.loading.set(false),
    });

    this.api.getCitas().subscribe({
      next: (data) => {
        this.citas.set(data);
        setTimeout(() => this.renderCharts(), 100);
      },
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderCharts(), 200);
  }

  async renderCharts() {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    // Revenue chart
    if (this.revenueChartRef?.nativeElement) {
      this.revenueChartInstance?.destroy();
      const labels = Object.keys(this.monthlyRevenue());
      const values = Object.values(this.monthlyRevenue());

      this.revenueChartInstance = new Chart(this.revenueChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Ingresos',
            data: values,
            backgroundColor: 'rgba(24, 106, 220, 0.15)',
            borderColor: '#186adc',
            borderWidth: 2,
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                callback: (v: any) =>
                  new Intl.NumberFormat('es-DO', {
                    style: 'currency', currency: 'DOP',
                    maximumFractionDigits: 0
                  }).format(v)
              },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    // Donut status chart
    if (this.statusChartRef?.nativeElement) {
      this.statusChartInstance?.destroy();
      const s = this.stats();

      this.statusChartInstance = new Chart(this.statusChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Completadas', 'Pendientes', 'Canceladas'],
          datasets: [{
            data: [s.completadas, s.pendientes, s.canceladas],
            backgroundColor: ['#186adc', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 16, usePointStyle: true, pointStyleWidth: 8 },
            },
          },
        },
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency', currency: 'DOP', maximumFractionDigits: 0
    }).format(value);
  }
}