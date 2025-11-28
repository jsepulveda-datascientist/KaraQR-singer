<template>
  <q-page class="q-pa-md karaqr-page-bg">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- Título -->
        <div class="text-h4 q-mb-md text-center text-primary">
          <q-icon name="local_offer" class="q-mr-sm" />
          Cupones y Descuentos
        </div>

        <!-- Mensaje para usuarios no autenticados -->
        <q-card v-if="!isAuthenticated" class="text-center q-pa-xl empty-state-card">
          <q-icon name="lock" size="4em" color="grey-5" class="q-mb-md" />
          <div class="text-h5 q-mb-md text-grey-8">
            Autenticación Requerida
          </div>
          <div class="text-body1 text-grey-7 q-mb-lg">
            Necesitas iniciar sesión para acceder a cupones y descuentos exclusivos
          </div>
          <q-btn
            color="primary"
            icon="login"
            label="Iniciar Sesión"
            @click="navigateWithTenant('/login')"
            size="lg"
          />
        </q-card>

        <!-- Estado vacío para usuarios autenticados -->
        <q-card v-else class="text-center q-pa-xl empty-state-card">
          <div class="text-body2 text-grey-6 q-mt-sm">
            Cupones y descuentos exclusivos para los cantantes de Karaoke.
          </div>
          
          <!-- Información adicional -->
          <q-banner rounded class="bg-blue-1 text-primary q-mt-lg">
            <template v-slot:avatar>
              <q-icon name="info" color="primary" />
            </template>
            <div class="text-body2">
              ¡Mantente atento! Aprovecha los cupones que se irán activando.
            </div>
          </q-banner>

          <!-- Ejemplos de cupones (placeholders) -->
          <div class="q-mt-xl">

            <!-- Cupón 0: Descuento porcentual -->
            <q-card class="coupon-example q-mb-md" flat bordered>
              <q-card-section class="row items-center">
                <div class="col-auto q-mr-md">
                  <div class="discount-badge">
                    <div class="discount-value">30%</div>
                    <div class="discount-label">OFF</div>
                  </div>
                </div>
                <div class="col">
                  <div class="text-h6 text-primary">Descuento en Cerveza Artesanal Kapsul</div>
                  <div class="text-caption text-grey-7">Válido de martes a jueves</div>
                </div>
                <div class="col-auto">
                  <q-chip color="grey-3" text-color="grey-6" dense>
                    Próximamente
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>            
            
            <!-- Cupón 1: Descuento porcentual -->
            <q-card class="coupon-example q-mb-md" flat bordered>
              <q-card-section class="row items-center">
                <div class="col-auto q-mr-md">
                  <div class="discount-badge">
                    <div class="discount-value">20%</div>
                    <div class="discount-label">OFF</div>
                  </div>
                </div>
                <div class="col">
                  <div class="text-h6 text-primary">Descuento en Pizzas de la casa</div>
                  <div class="text-caption text-grey-7">Válido de martes a jueves</div>
                </div>
                <div class="col-auto">
                  <q-chip color="grey-3" text-color="grey-6" dense>
                    Próximamente
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>

            <!-- Cupón 2: 2x1 -->
            <q-card class="coupon-example q-mb-md" flat bordered>
              <q-card-section class="row items-center">
                <div class="col-auto q-mr-md">
                  <div class="discount-badge promo-badge">
                    <div class="discount-value">2x1</div>
                    <div class="discount-label">PROMO</div>
                  </div>
                </div>
                <div class="col">
                  <div class="text-h6 text-primary">Happy Hour 2x1</div>
                  <div class="text-caption text-grey-7">En tragos seleccionados</div>
                </div>
                <div class="col-auto">
                  <q-chip color="grey-3" text-color="grey-6" dense>
                    Próximamente
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>

            <!-- Cupón 3: Entrada gratis -->
            <q-card class="coupon-example" flat bordered>
              <q-card-section class="row items-center">
                <div class="col-auto q-mr-md">
                  <div class="discount-badge free-badge">
                    <div class="discount-value">FREE</div>
                    <div class="discount-label">PASS</div>
                  </div>
                </div>
                <div class="col">
                  <div class="text-h6 text-primary">Pase gratis Show en Vivo</div>
                  <div class="text-caption text-grey-7">Para cantantes Karaoke</div>
                </div>
                <div class="col-auto">
                  <q-chip color="grey-3" text-color="grey-6" dense>
                    Próximamente
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../composables/useUser'
import { useTenant } from '../composables/useTenant'

const { isAuthenticated, user } = useUser()
const { navigateWithTenant } = useTenant()
</script>

<style scoped>
.empty-state-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.empty-state-card:hover {
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
}

.coupon-example {
  opacity: 0.6;
  border: 2px dashed #e0e0e0;
  transition: all 0.3s ease;
}

.discount-badge {
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  color: white;
  border-radius: 12px;
  padding: 12px 16px;
  text-align: center;
  min-width: 80px;
}

.promo-badge {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
}

.free-badge {
  background: linear-gradient(135deg, #10b981, #059669);
}

.discount-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.discount-label {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 2px;
}
</style>
