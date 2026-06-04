<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong><CIcon :icon="cilUser" class="me-2" />Pacientes</strong>
          <div class="d-flex gap-2">
            <CInputGroup size="sm">
              <CInputGroupText><CIcon :icon="cilSearch" /></CInputGroupText>
              <CFormInput v-model="busqueda" placeholder="Buscar..." />
            </CInputGroup>
            <CButton color="primary" size="sm" @click.prevent="newPaciente">
              <CIcon :icon="cilPlus" class="me-1" /> Nuevo
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          <CTable align="middle" responsive hover borderless>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Celular</CTableHeaderCell>
                <CTableHeaderCell>Fecha Nacimiento</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="paciente in pacientesFiltrados" :key="paciente.id">
                <CTableDataCell>{{ paciente.nombre }}</CTableDataCell>
                <CTableDataCell>{{ paciente.celular }}</CTableDataCell>
                <CTableDataCell>{{ paciente.fecha_nacimiento }}</CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButtonGroup>
                    <CButton color="info" size="sm" @click="verPaciente(paciente)" title="Ver Detalle">
                      <CIcon :icon="cilFile" />
                    </CButton>
                    <CButton color="warning" size="sm" @click="editarPaciente(paciente)" title="Editar">
                      <CIcon :icon="cilPencil" />
                    </CButton>
                    <CButton color="success" size="sm" @click="VerCitas(paciente.id)" title="Citas">
                      <CIcon :icon="cilCalendar" />
                    </CButton>
                    <CButton color="danger" size="sm" @click="eliminarPaciente(paciente.id)" title="Eliminar">
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

    <!-- Modal Nuevo/Editar -->
    <CModal :visible="modalNuevo" @close="modalNuevo=false" size="lg">
      <CModalHeader>
        <CModalTitle>{{ nuevo.id ? 'Actualizar' : 'Registrar' }} Paciente</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm class="row g-3" @submit.prevent="guardarPaciente">
          <CCol :md="6">
            <CFormInput v-model="nuevo.nombre" label="Nombre Completo" placeholder="Ingrese nombre..." required />
            <CFormInput v-model="nuevo.celular" label="Celular" class="mt-2" />
            <CFormInput v-model="nuevo.fecha_nacimiento" type="date" label="Fecha Nacimiento" class="mt-2" />
            <CFormInput v-model="nuevo.direccion" label="Dirección" placeholder="Dirección..." class="mt-2" />
          </CCol>
          <CCol :md="6">
            <h6 class="text-primary border-bottom pb-2">Antecedentes Médicos</h6>
            <div class="d-flex flex-wrap gap-2">
              <CFormCheck label="Trat. Médico" v-model="nuevo.tratamiento_medico" />
              <CFormCheck label="Cardiaco" v-model="nuevo.paciente_cardiaco" />
              <CFormCheck label="Antecedentes Fam." v-model="nuevo.antecedentes_familiares" />
              <CFormCheck label="Medicacion" v-model="nuevo.medicacion" />
              <CFormCheck label="Hemorragia" v-model="nuevo.hemorragia" />
              <CFormCheck label="Cirugía" v-model="nuevo.intervencion_quirurgica" />
              <CFormCheck label="Alergias" v-model="nuevo.alergias" />
              <CFormCheck label="Diabetes" v-model="nuevo.diabetes" />
              <CFormCheck label="Intolerancias" v-model="nuevo.intolerancias" />
              <CFormCheck label="Gestante" v-model="nuevo.gestante" />
            </div>
            <CFormSelect v-model="nuevo.presion_arterial" label="Presión Arterial" :options="['alta','normal','baja']" class="mt-2" />
            <CFormTextarea v-model="nuevo.habitos" label="Hábitos" placeholder="Ej: fuma, bebe, etc." class="mt-2" />
          </CCol>
          <div class="mt-4 text-end">
            <CButton color="secondary" class="me-2" @click="modalNuevo=false">Cancelar</CButton>
            <CButton color="primary" type="submit">Guardar Cambios</CButton>
          </div>
        </CForm>
      </CModalBody>
    </CModal>

    <!-- Modal Ver -->
    <CModal :visible="modalVer" @close="modalVer=false" size="lg">
      <CModalHeader>
        <CModalTitle>Detalle del Paciente</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow v-if="pacienteSeleccionado">
          <CCol :md="6">
            <p class="mb-1 text-muted small uppercase">Nombre</p>
            <p class="h5 mb-3">{{ pacienteSeleccionado.nombre }}</p>
            <p class="mb-1 text-muted small uppercase">Celular</p>
            <p class="h5 mb-3">{{ pacienteSeleccionado.celular }}</p>
            <p class="mb-1 text-muted small uppercase">Fecha Nacimiento</p>
            <p class="h5 mb-3">{{ pacienteSeleccionado.fecha_nacimiento }}</p>
            <p class="mb-1 text-muted small uppercase">Dirección</p>
            <p class="h5 mb-3">{{ pacienteSeleccionado.direccion }}</p>
          </CCol>
          <CCol :md="6">
            <h6 class="text-primary border-bottom pb-2">Antecedentes Médicos</h6>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <CBadge v-if="pacienteSeleccionado.tratamiento_medico" color="info">Tratamiento Médico</CBadge>
              <CBadge v-if="pacienteSeleccionado.paciente_cardiaco" color="danger">Paciente Cardíaco</CBadge>
              <CBadge v-if="pacienteSeleccionado.antecedentes_familiares" color="secondary">Antecedentes Familiares</CBadge>
              <CBadge v-if="pacienteSeleccionado.medicacion" color="warning">Medicaciones Previas</CBadge>
              <CBadge v-if="pacienteSeleccionado.hemorragia" color="danger">Hemorragia</CBadge>
              <CBadge v-if="pacienteSeleccionado.intervencion_quirurgica" color="info">Cirugía</CBadge>
              <CBadge v-if="pacienteSeleccionado.alergias" color="danger">Alergias</CBadge>
              <CBadge v-if="pacienteSeleccionado.diabetes" color="warning">Diabetes</CBadge>
              <CBadge v-if="pacienteSeleccionado.intolerancias" color="dark">Intolerancias</CBadge>
              <CBadge v-if="pacienteSeleccionado.gestante" color="success">Gestante</CBadge>
            </div>
            <p class="mt-3"><strong>Presión Arterial:</strong> {{ pacienteSeleccionado.presion_arterial }}</p>
            <p><strong>Hábitos:</strong> {{ pacienteSeleccionado.habitos }}</p>
          </CCol>
        </CRow>
      </CModalBody>
    </CModal>
  </CRow>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import { cilUser, cilSearch, cilPlus, cilFile, cilPencil, cilCalendar, cilTrash } from '@coreui/icons'

export default {
  setup() {
    return {
      cilUser, cilSearch, cilPlus, cilFile, cilPencil, cilCalendar, cilTrash
    }
  },
  data() {
    return {
      pacientes: [],
      busqueda: '',
      modalNuevo: false,
      modalVer: false,
      pacienteSeleccionado: {},
      nuevo: {
        id: null,
        nombre: '',
        celular: '',
        direccion: '',
        fecha_nacimiento: '',
        tratamiento_medico: false,
        paciente_cardiaco: false,
        antecedentes_familiares: false,
        medicacion: false,
        hemorragia: false,
        intervencion_quirurgica: false,
        alergias: false,
        diabetes: false,
        intolerancias: false,
        gestante: false,
        presion_arterial: 'normal',
        habitos: '',
      }
    }
  },
  computed: {
    pacientesFiltrados() {
      return this.pacientes.filter(p =>
        p.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
      )
    }
  },
  mounted() {
    this.cargarPacientes()
  },
  methods: {
    resetNuevo() {
      this.nuevo = {
        id: null,
        nombre: '',
        celular: '',
        direccion: '',
        fecha_nacimiento: '',
        tratamiento_medico: false,
        paciente_cardiaco: false,
        antecedentes_familiares: false,
        medicacion: false,
        hemorragia: false,
        intervencion_quirurgica: false,
        alergias: false,
        diabetes: false,
        intolerancias: false,
        gestante: false,
        presion_arterial: 'normal',
        habitos: '',
      }
    },
    newPaciente() {
      this.resetNuevo()
      this.modalNuevo = true
    },
    verPaciente(paciente) {
      this.pacienteSeleccionado = { ...paciente }
      this.modalVer = true
    },
    editarPaciente(paciente) {
      this.nuevo = {
        ...paciente,
        tratamiento_medico: !!paciente.tratamiento_medico,
        paciente_cardiaco: !!paciente.paciente_cardiaco,
        antecedentes_familiares: !!paciente.antecedentes_familiares,
        medicacion: !!paciente.medicacion,
        hemorragia: !!paciente.hemorragia,
        intervencion_quirurgica: !!paciente.intervencion_quirurgica,
        alergias: !!paciente.alergias,
        diabetes: !!paciente.diabetes,
        intolerancias: !!paciente.intolerancias,
        gestante: !!paciente.gestante,
      }
      this.modalNuevo = true
    },
    cargarPacientes() {
      axios.get('/pacientes')
        .then(res => { this.pacientes = res.data })
        .catch(err => console.error("Error cargando pacientes:", err))
    },
    guardarPaciente() {
      const url = this.nuevo.id ? `/pacientes/${this.nuevo.id}` : `/pacientes`
      const method = this.nuevo.id ? 'put' : 'post'

      axios[method](url, this.nuevo)
        .then(() => {
          this.cargarPacientes()
          this.modalNuevo = false
          Swal.fire({
            title: '¡Éxito!',
            text: `El paciente fue ${this.nuevo.id ? 'actualizado' : 'registrado'} correctamente.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          })
          this.resetNuevo()
        })
        .catch((error) => {
          console.error(error)
          Swal.fire({
            title: 'Error',
            text: 'No se pudo guardar el paciente.',
            icon: 'error'
          })
        })
    },
    eliminarPaciente(id) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          axios.delete(`/pacientes/${id}`)
            .then(() => {
              this.cargarPacientes()
              Swal.fire('Eliminado', 'El paciente fue eliminado.', 'success')
            })
            .catch(() => {
              Swal.fire('Error', 'No se pudo eliminar el paciente.', 'error')
            })
        }
      })
    },
    VerCitas(id){
      this.$router.push(`/pacientes/${id}/citas`);
    }
  }
}
</script>

