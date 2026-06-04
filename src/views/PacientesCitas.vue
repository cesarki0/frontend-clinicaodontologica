<template>
  <div class="row w-100">
    <div class="col-12">
      <CCard class="shadow-sm">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong>Gestión de Citas</strong>
          <CButton color="primary" size="sm" @click="nuevaCita">Nueva Cita</CButton>
        </CCardHeader>
        <CCardBody>
          <CTable align="middle" responsive hover>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Fecha y Hora</CTableHeaderCell>
                <CTableHeaderCell>Paciente</CTableHeaderCell>
                <CTableHeaderCell>Motivo</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="cita in citas" :key="cita.id">
                <CTableDataCell>{{ formatFecha(cita.fecha_hora) }}</CTableDataCell>
                <CTableDataCell>{{ cita.paciente ? cita.paciente.nombre : 'N/A' }}</CTableDataCell>
                <CTableDataCell>{{ cita.motivo }}</CTableDataCell>
                <CTableDataCell>
                  <CBadge :color="badgeEstado(cita.estado)">{{ cita.estado }}</CBadge>
                </CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" size="sm" @click="editarCita(cita)">Editar</CButton>
                  <CButton color="danger" size="sm" class="ms-2" @click="eliminarCita(cita.id)">Eliminar</CButton>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>

    <!-- Modal Nueva/Editar Cita -->
    <CModal :visible="modalCita" @close="modalCita = false">
      <CModalHeader>
        <CModalTitle>{{ formCita.id ? 'Editar' : 'Programar' }} Cita</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="guardarCita">
          <div class="mb-3">
            <CFormLabel>Paciente</CFormLabel>
            <!-- Mostrar nombre, pero guardar id -->
              <CFormInput :value="paciente?.nombre" readonly />
              <input type="hidden" v-model="formCita.paciente_id" />
            
          </div>
          <div class="mb-3">
            <CFormInput type="datetime-local" v-model="formCita.fecha_hora" label="Fecha y Hora" required />
          </div>
          <div class="mb-3">
            <CFormInput v-model="formCita.motivo" label="Motivo" />
          </div>
          <div class="mb-3">
            <CFormSelect v-model="formCita.estado" label="Estado">
              <option value="pendiente">Pendiente</option>
              <option value="atendida">Atendida</option>
              <option value="cancelada">Cancelada</option>
            </CFormSelect>
          </div>
          <div class="text-end">
            <CButton color="secondary" class="me-2" @click="modalCita = false">Cancelar</CButton>
            <CButton color="primary" type="submit">Guardar</CButton>
          </div>
        </CForm>
      </CModalBody>
    </CModal>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
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
      },
      pacienteID: null,
       paciente: null,
    }
  },
  mounted() {

    
   this.pacienteID = this.$route.params.id
    this.obtenerPaciente()
   this.obtenerCitas();

  },
  methods: {

    async obtenerPaciente() {
    const res = await axios.get(`/pacientes/${this.pacienteID}`)
    this.paciente = res.data
  },

    // para citas/paciente

    async obtenerCitas(){
      const response = await axios.get(`/pacientes/${this.pacienteID}/citas`)
      this.citas=response.data
    },

    cargarCitas() {
      axios.get('/citas')
        .then(res => { this.citas = res.data })
    },
    cargarPacientes() {
      axios.get('/pacientes')
        .then(res => { this.pacientes = res.data })
    },
    nuevaCita() {
      this.formCita = { id: null, paciente_id: this.pacienteID, fecha_hora: '', motivo: '', estado: 'pendiente' }
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
          this.obtenerCitas()
          this.modalCita = false
          Swal.fire('Guardado', 'Cita guardada correctamente', 'success')
        })
    },
    eliminarCita(id) {
      Swal.fire({
        title: '¿Eliminar cita?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí'
      }).then(result => {
        if (result.isConfirmed) {
          axios.delete(`/citas/${id}`).then(() => {
            this.cargarCitas()
            Swal.fire('Eliminado', '', 'success')
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
      return new Date(fecha).toLocaleString()
    }
  }
}
</script>
