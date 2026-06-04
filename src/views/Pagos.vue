<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="d-flex justify-content-between align-items-center">
          <strong><CIcon :icon="cilWallet" class="me-2" />Control de Pagos</strong>
          <CButton color="primary" size="sm" @click="nuevoPago">
            <CIcon :icon="cilPlus" class="me-1" /> Registrar Pago
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CTable align="middle" responsive hover borderless>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Tratamiento / Paciente</CTableHeaderCell>
                <CTableHeaderCell>Total</CTableHeaderCell>
                <CTableHeaderCell>Pagado</CTableHeaderCell>
                <CTableHeaderCell>Saldo</CTableHeaderCell>
                <CTableHeaderCell class="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="pago in pagos" :key="pago.id">
                <CTableDataCell>{{ pago.fecha }}</CTableDataCell>
                <CTableDataCell>
                  <div class="fw-semibold">{{ pago.tratamiento ? pago.tratamiento.descripcion : 'N/A' }}</div>
                  <small class="text-muted">{{ (pago.tratamiento && pago.tratamiento.paciente) ? pago.tratamiento.paciente.nombre : 'N/A' }}</small>
                </CTableDataCell>
                <CTableDataCell>Bs.{{ pago.total }}</CTableDataCell>
                <CTableDataCell class="text-success fw-bold">Bs.{{ pago.adelanto }}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color="danger" shape="pill">Bs.{{ pago.saldo }}</CBadge>
                </CTableDataCell>
                <CTableDataCell class="text-center">
                  <CButton color="danger" size="sm" @click="eliminarPago(pago.id)" title="Eliminar">
                    <CIcon :icon="cilTrash" />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Modal Registrar Pago -->
    <CModal :visible="modalPago" @close="modalPago = false">
      <CModalHeader>
        <CModalTitle>Registrar Pago</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm @submit.prevent="guardarPago" class="row g-3">
          <CCol :md="12">
            <CFormLabel>Tratamiento</CFormLabel>
            <CFormSelect v-model="formPago.tratamiento_id" required>
              <option :value="null">Seleccione un tratamiento...</option>
              <option v-for="t in tratamientos" :key="t.id" :value="t.id">
                {{ t.descripcion }} - {{ t.paciente ? t.paciente.nombre : 'Sin Paciente' }} (Costo: Bs.{{ t.costo }})
              </option>
            </CFormSelect>
          </CCol>
          <CCol :md="12">
            <CFormInput type="date" v-model="formPago.fecha" label="Fecha de Pago" required />
          </CCol>
          <CCol :md="6">
            <CFormInput type="number" step="0.01" v-model="formPago.total" label="Costo Total" readonly />
          </CCol>
          <CCol :md="6">
            <CFormInput type="number" step="0.01" v-model="formPago.saldo_pendiente" label="Saldo Pendiente" readonly />
          </CCol>
          <CCol :md="12">
            <CFormInput type="number" step="0.01" v-model="formPago.adelanto" label="Monto a Pagar (Adelanto)" required />
          </CCol>
          <CCol :md="12">
            <CFormInput type="number" step="0.01" v-model="formPago.saldo" label="Nuevo Saldo Restante" readonly class="bg-light fw-bold" />
          </CCol>
          <div class="mt-4 text-end">
            <CButton color="secondary" class="me-2" @click="modalPago = false">Cancelar</CButton>
            <CButton color="primary" type="submit">Confirmar Pago</CButton>
          </div>
        </CForm>
      </CModalBody>
    </CModal>
  </CRow>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import { cilWallet, cilPlus, cilTrash } from '@coreui/icons'

export default {
  setup() {
    return {
      cilWallet, cilPlus, cilTrash
    }
  },
  data() {
    return {
      pagos: [],
      tratamientos: [],
      modalPago: false,
      formPago: {
        id: null,
        tratamiento_id: null,
        fecha: new Date().toISOString().substr(0, 10),
        total: 0,
        saldo_pendiente: 0,
        adelanto: 0,
        saldo: 0
      }
    }
  },
  mounted() {
    this.cargarPagos()
    this.cargarTratamientos()
  },
  watch: {
    'formPago.tratamiento_id'(newId) {
      this.handleTratamientoUpdate(newId)
    },
    'formPago.adelanto'(newVal) {
      this.calcularSaldo(newVal)
    }
  },
  methods: {
    cargarPagos() {
      axios.get('/pagos')
        .then(res => { this.pagos = res.data })
    },
    cargarTratamientos() {
      axios.get('/tratamientos')
        .then(res => { this.tratamientos = res.data })
    },
    nuevoPago() {
      this.formPago = {
        id: null,
        tratamiento_id: null,
        fecha: new Date().toISOString().substr(0, 10),
        total: 0,
        saldo_pendiente: 0,
        adelanto: 0,
        saldo: 0
      }
      this.modalPago = true
    },
    handleTratamientoUpdate(selectedId) {
      if (!selectedId) {
        this.formPago.total = 0
        this.formPago.saldo_pendiente = 0
        this.formPago.adelanto = 0
        this.formPago.saldo = 0
        return
      }

      const t = this.tratamientos.find(item => String(item.id) === String(selectedId))
      
      if (t) {
        const costoTotal = parseFloat(t.costo) || 0
        const pagado = t.pagos ? t.pagos.reduce((acc, p) => acc + parseFloat(p.adelanto), 0) : 0
        
        this.formPago.total = costoTotal
        this.formPago.saldo_pendiente = parseFloat((costoTotal - pagado).toFixed(2))
        this.formPago.adelanto = 0
        this.formPago.saldo = this.formPago.saldo_pendiente
      }
    },
    calcularSaldo(valorAdelanto) {
      const saldoPendiente = parseFloat(this.formPago.saldo_pendiente) || 0
      const adelanto = parseFloat(valorAdelanto) || 0
      
      const nuevoSaldo = saldoPendiente - adelanto
      this.formPago.saldo = parseFloat(nuevoSaldo.toFixed(2))
    },
    guardarPago() {
      axios.post('/pagos', this.formPago)
        .then(() => {
          this.cargarPagos()
          this.modalPago = false
          Swal.fire({
            title: '¡Éxito!',
            text: 'Pago registrado correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          })
        })
    },
    eliminarPago(id) {
      Swal.fire({
        title: '¿Eliminar registro de pago?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          axios.delete(`/pagos/${id}`).then(() => {
            this.cargarPagos()
            Swal.fire('Eliminado', 'El registro de pago ha sido eliminado', 'success')
          })
        }
      })
    }
  }
}
</script>

