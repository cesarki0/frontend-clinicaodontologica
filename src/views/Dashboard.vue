<template>
  <div>
    <CRow>
      <CCol :xs="12" :sm="6" :lg="3">
        <CWidgetStatsA
          class="mb-4"
          color="primary"
          :value="cards[0].value.toString()"
          title="Pacientes"
        >
          <template #action>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
                <CIcon :icon="cilOptions" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem @click="$router.push('/pacientes')">Ver Pacientes</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </template>
        </CWidgetStatsA>
      </CCol>
      <CCol :xs="12" :sm="6" :lg="3">
        <CWidgetStatsA
          class="mb-4"
          color="info"
          :value="cards[1].value.toString()"
          title="Citas Hoy"
        >
          <template #action>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
                <CIcon :icon="cilOptions" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem @click="$router.push('/citas')">Ver Citas</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </template>
        </CWidgetStatsA>
      </CCol>
      <CCol :xs="12" :sm="6" :lg="3">
        <CWidgetStatsA
          class="mb-4"
          color="warning"
          :value="cards[2].value.toString()"
          title="Tratamientos"
        >
          <template #action>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
                <CIcon :icon="cilOptions" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem @click="$router.push('/tratamientos')">Ver Tratamientos</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </template>
        </CWidgetStatsA>
      </CCol>
      <CCol :xs="12" :sm="6" :lg="3">
        <CWidgetStatsA
          class="mb-4"
          color="danger"
          :value="'Bs. ' + cards[3].value.toLocaleString()"
          title="Ingresos Totales"
        >
          <template #action>
            <CDropdown placement="bottom-end">
              <CDropdownToggle color="transparent" class="p-0 text-white" :caret="false">
                <CIcon :icon="cilOptions" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem @click="$router.push('/pagos')">Ver Pagos</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </template>
        </CWidgetStatsA>
      </CCol>
    </CRow>

    <CRow>
      <CCol :md="6">
        <CCard class="mb-4">
          <CCardHeader>Ingresos vs Saldos</CCardHeader>
          <CCardBody>
            <div class="c-chart-wrapper" style="height:300px;">
              <canvas id="chartIngresos"></canvas>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol :md="6">
        <CCard class="mb-4">
          <CCardHeader>Citas por Día</CCardHeader>
          <CCardBody>
            <div class="c-chart-wrapper" style="height:300px;">
              <canvas id="chartCitas"></canvas>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import axios from 'axios'
import Chart from 'chart.js/auto'
import { cilOptions } from '@coreui/icons'

export default {
  setup() {
    return {
      cilOptions,
    }
  },
  data() {
    return {
      cards: [
        { title: 'Pacientes', value: 0 },
        { title: 'Citas Hoy', value: 0 },
        { title: 'Tratamientos', value: 0 },
        { title: 'Ingresos Totales', value: 0 }
      ]
    }
  },
  mounted() {
    this.cargarDashboard()
  },
  methods: {
    async cargarDashboard() {
      try {
        const res = await axios.get('/dashboard')
        this.cards[0].value = res.data.pacientes
        this.cards[1].value = res.data.citasHoy
        this.cards[2].value = res.data.tratamientos
        this.cards[3].value = res.data.ingresos

        this.renderCharts(res.data)
      } catch (error) {
        console.error('Error cargando dashboard:', error)
      }
    },
    renderCharts(data) {
      new Chart(document.getElementById('chartIngresos'), {
        type: 'doughnut',
        data: {
          labels: ['Ingresos', 'Saldos'],
          datasets: [{ 
            data: [data.ingresos, data.saldos], 
            backgroundColor: ['#4caf50','#f44336'],
            hoverOffset: 4
          }]
        },
        options: {
          maintainAspectRatio: false,
        }
      })

      const labels = data.citasPorDia.map(c => c.dia)
      const chartData = data.citasPorDia.map(c => c.total)
    
      new Chart(document.getElementById('chartCitas'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Citas',
            data: chartData,
            backgroundColor: 'rgba(52, 152, 219, 0.8)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1
          }]
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      })
    }
  }
}
</script>

