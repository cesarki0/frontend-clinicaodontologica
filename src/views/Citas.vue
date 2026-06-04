<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong><CIcon :icon="cilCalendar" class="me-2" />Gestión de Citas</strong>
          <CButton color="primary" size="sm" @click="nuevaCita">
            <CIcon :icon="cilPlus" class="me-1" /> Nueva Cita
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable align="middle" responsive hover borderless>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Fecha y Hora</CTableHeaderCell>
                <CTableHeaderCell>Paciente</CTableHeaderCell>
                <CTableHeaderCell>Motivo</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="cita in citas" :key="cita.id">
                <CTableDataCell>
                  <div class="fw-semibold text-primary">{{ formatFecha(cita.fecha_hora) }}</div>
                </CTableDataCell>
                <CTableDataCell>{{ cita.paciente ? cita.paciente.nombre : 'N/A' }}</CTableDataCell>
                <CTableDataCell>{{ cita.motivo }}</CTableDataCell>
                <CTableDataCell>
                  <CBadge :color="badgeEstado(cita.estado)" shape="pill">{{ cita.estado }}</CBadge>
                </CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButtonGroup>
                    <CButton color="info" size="sm" @click="editarCita(cita)" title="Editar">
                      <CIcon :icon="cilPencil" />
                    </CButton>
                    <CButton color="danger" size="sm" @click="eliminarCita(cita.id)" title="Eliminar">
                      <CIcon :icon="cilTrash" />
                    </CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Modal Nueva/Editar Cita -->
    <CModal :visible="modalCita" @close="modalCita = false">
      <CModalHeader>
        <CModalTitle>{{ formCita.id ? 'Editar' : 'Programar' }} Cita</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="guardarCita" class="row g-3">
          <CCol :md="12">
            <CFormLabel>Paciente</CFormLabel>
            <CFormSelect v-model="formCita.paciente_id" required>
              <option value="">Seleccione un paciente...</option>
              <option v-for="p in pacientes" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </CFormSelect>
          </CCol>
          <CCol :md="12">
            <CFormInput type="datetime-local" v-model="formCita.fecha_hora" label="Fecha y Hora" required />
          </CCol>
          <CCol :md="12">
            <CFormInput v-model="formCita.motivo" label="Motivo / Descripción" placeholder="Ej: Limpieza dental" />
          </CCol>
          <CCol :md="12">
            <CFormSelect v-model="formCita.estado" label="Estado de la Cita">
              <option value="pendiente">Pendiente</option>
              <option value="atendida">Atendida</option>
              <option value="cancelada">Cancelada</option>
            </CFormSelect>
          </CCol>
          <div class="mt-4 text-end">
            <CButton color="secondary" class="me-2" @click="modalCita = false">Cancelar</CButton>
            <CButton color="primary" type="submit">Guardar Cita</CButton>
          </div>
        </CForm>
      </CModalBody>
    </CModal>
  </CRow>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import { cilCalendar, cilPlus, cilPencil, cilTrash } from '@coreui/icons'

export default {
  setup() {
    return {
      cilCalendar, cilPlus, cilPencil, cilTrash
    }
  },
  data() {
    return {
      citas: [],
      pacientes: [],
      modalCita: false,
      formCita: {
        id: null,
        paciente_id: '',
        fecha_hora: '',
        motivo: '',
        estado: 'pendiente'
      }
    }
  },
  mounted() {
    this.cargarCitas()
    this.cargarPacientes()
  },
  methods: {
    cargarCitas() {
      axios.get('/citas')
        .then(res => { this.citas = res.data })
    },
    cargarPacientes() {
      axios.get('/pacientes')
        .then(res => { this.pacientes = res.data })
    },
    nuevaCita() {
      this.formCita = { id: null, paciente_id: '', fecha_hora: '', motivo: '', estado: 'pendiente' }
      this.modalCita = true
    },
    editarCita(cita) {
      this.formCita = { ...cita, fecha_hora: cita.fecha_hora.replace(' ', 'T') }
      this.modalCita = true
    },
    guardarCita() {
      const url = this.formCita.id 
        ? `/citas/${this.formCita.id}`
        : '/citas'
      const method = this.formCita.id ? 'put' : 'post'

      axios[method](url, this.formCita)
        .then(() => {
          this.cargarCitas()
          this.modalCita = false
          Swal.fire({
            title: '¡Éxito!',
            text: 'Cita guardada correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          })
        })
    },
    eliminarCita(id) {
      Swal.fire({
        title: '¿Eliminar cita?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          axios.delete(`/citas/${id}`).then(() => {
            this.cargarCitas()
            Swal.fire('Eliminado', 'La cita ha sido eliminada', 'success')
          })
        }
      })
    },
    badgeEstado(estado) {
      if (estado === 'pendiente') return 'warning'
      if (estado === 'atendida') return 'success'
      return 'danger'
    },
    formatFecha(fecha) {
      if (!fecha) return 'N/A'
      const date = new Date(fecha)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

