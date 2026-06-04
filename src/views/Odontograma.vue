<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong><CIcon :icon="cilChartLine" class="me-2" />Odontograma Visual</strong>
          <div style="width: 300px;">
            <CFormSelect v-model="pacienteId" @change="cargarOdontograma" size="sm">
              <option value="">Seleccione un paciente...</option>
              <option v-for="p in pacientes" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </CFormSelect>
          </div>
        </CCardHeader>
        <CCardBody>
          <div v-if="!pacienteId" class="text-center py-5">
            <CIcon :icon="cilUser" size="xl" class="text-muted mb-3" />
            <h5 class="text-muted">Seleccione un paciente para ver su odontograma</h5>
          </div>
          
          <div v-else>
            <div class="row text-center mb-4">
              <div class="col-12 mb-3"><h6 class="text-primary fw-bold">ARCADA SUPERIOR</h6></div>
              <div class="col-12 d-flex justify-content-center flex-wrap">
                <div v-for="n in superior" :key="n" class="tooth-box shadow-sm" :class="statusColor(n)" @click="editTooth(n)">
                  <div class="tooth-num">{{ n }}</div>
                  <div class="tooth-status">{{ toothStatus(n) }}</div>
                </div>
              </div>
            </div>

            <hr class="my-4">

            <div class="row text-center mt-4">
              <div class="col-12 mb-3"><h6 class="text-primary fw-bold">ARCADA INFERIOR</h6></div>
              <div class="col-12 d-flex justify-content-center flex-wrap">
                <div v-for="n in inferior" :key="n" class="tooth-box shadow-sm" :class="statusColor(n)" @click="editTooth(n)">
                  <div class="tooth-num">{{ n }}</div>
                  <div class="tooth-status">{{ toothStatus(n) }}</div>
                </div>
              </div>
            </div>

            <CCard class="mt-5 border-top border-top-3 border-top-primary">
              <CCardBody>
                <h6 class="mb-3">Leyenda de Estados:</h6>
                <div class="d-flex flex-wrap gap-3">
                    <CBadge color="success" shape="pill" class="p-2 px-3">Sano</CBadge>
                    <CBadge color="danger" shape="pill" class="p-2 px-3">Caries</CBadge>
                    <CBadge color="primary" shape="pill" class="p-2 px-3">Restaurado</CBadge>
                    <CBadge color="secondary" shape="pill" class="p-2 px-3">Extraído</CBadge>
                    <CBadge color="warning" shape="pill" class="p-2 px-3">En Tratamiento</CBadge>
                </div>
              </CCardBody>
            </CCard>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Modal Editar Diente -->
    <CModal :visible="modalTooth" @close="modalTooth = false">
      <CModalHeader>
        <CModalTitle>Pieza Dental {{ selectedTooth }}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="saveTooth" class="row g-3">
          <CCol :md="12">
            <CFormLabel>Estado del Diente</CFormLabel>
            <CFormSelect v-model="toothForm.estado">
              <option value="sano">Sano</option>
              <option value="caries">Caries</option>
              <option value="restaurado">Restaurado</option>
              <option value="extraido">Extraído</option>
              <option value="tratamiento">En tratamiento</option>
            </CFormSelect>
          </CCol>
          <CCol :md="12">
            <CFormTextarea v-model="toothForm.observaciones" label="Observaciones Clínicas" rows="4" placeholder="Detalle el estado o hallazgos..."></CFormTextarea>
          </CCol>
          <div class="mt-4 text-end">
             <CButton color="secondary" class="me-2" @click="modalTooth = false">Cancelar</CButton>
             <CButton color="primary" type="submit">Guardar Hallazgos</CButton>
          </div>
        </CForm>
      </CModalBody>
    </CModal>
  </CRow>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import { cilChartLine, cilUser } from '@coreui/icons'

export default {
  setup() {
    return {
      cilChartLine, cilUser
    }
  },
  data() {
    return {
      pacientes: [],
      pacienteId: '',
      odontograma: [],
      superior: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
      inferior: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
      modalTooth: false,
      selectedTooth: null,
      toothForm: {
        estado: 'sano',
        observaciones: ''
      }
    }
  },
  mounted() {
    this.cargarPacientes()
  },
  methods: {
    cargarPacientes() {
      axios.get('/pacientes').then(res => { this.pacientes = res.data })
    },
    cargarOdontograma() {
      if (!this.pacienteId) {
        this.odontograma = []
        return
      }
      axios.get('/odontogramas').then(res => {
        this.odontograma = res.data.filter(o => o.paciente_id == this.pacienteId)
      })
    },
    toothStatus(n) {
      const t = this.odontograma.find(o => o.pieza == n)
      return t ? t.estado : 'sano'
    },
    statusColor(n) {
      const s = this.toothStatus(n)
      if (s === 'caries') return 'bg-danger text-white border-danger'
      if (s === 'restaurado') return 'bg-primary text-white border-primary'
      if (s === 'extraido') return 'bg-secondary text-white border-secondary'
      if (s === 'tratamiento') return 'bg-warning text-dark border-warning'
      return 'bg-success text-white border-success'
    },
    editTooth(n) {
      this.selectedTooth = n
      const t = this.odontograma.find(o => o.pieza == n)
      if (t) {
        this.toothForm = { ...t }
      } else {
        this.toothForm = { estado: 'sano', observaciones: '' }
      }
      this.modalTooth = true
    },
    saveTooth() {
        const data = {
            ...this.toothForm,
            paciente_id: this.pacienteId,
            pieza: this.selectedTooth
        }

        const existing = this.odontograma.find(o => o.pieza == this.selectedTooth)
        const url = existing ? `/odontogramas/${existing.id}` : '/odontogramas'
        const method = existing ? 'put' : 'post'

        axios[method](url, data).then(() => {
            this.cargarOdontograma()
            this.modalTooth = false
            Swal.fire({
              title: 'Guardado',
              text: `Pieza dental ${this.selectedTooth} actualizada correctamente`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            })
        })
    }
  }
}
</script>

<style scoped>
.tooth-box {
  width: 80px;
  height: 80px;
  border: 2px solid #dee2e6;
  margin: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.tooth-box:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 8px 15px rgba(0,0,0,0.2) !important;
}
.tooth-num {
  font-weight: 800;
  font-size: 1.4rem;
}
.tooth-status {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>

