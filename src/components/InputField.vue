<script setup>
import { ref } from 'vue'

const props = defineProps({
  id:           { type: String,  required: true },
  label:        { type: String,  required: true },
  type:         { type: String,  default: 'text' },
  modelValue:   { type: String,  default: '' },
  placeholder:  { type: String,  default: '' },
  icon:         { type: String,  default: '' },
  error:        { type: String,  default: '' },
  hint:         { type: String,  default: '' },
  maxlength:    { type: Number,  default: undefined },
  autocomplete: { type: String,  default: '' },
})

const emit = defineEmits(['update:modelValue'])

const showPass   = ref(false)
const isPassword = props.type === 'password'
const inputType  = ref(props.type)

function toggleVisibility() {
  showPass.value = !showPass.value
  inputType.value = showPass.value ? 'text' : 'password'
}

function onInput(e) {
  let val = e.target.value
  if (props.id.includes('nip')) {
    val = val.replace(/\D/g, '').slice(0, 18)
    e.target.value = val
  }
  emit('update:modelValue', val)
}
</script>

<template>
  <div class="form-control w-full">
    <!-- Label -->
    <label :for="id" class="label pb-1.5 pt-0">
      <span class="label-text text-xs font-semibold tracking-wider uppercase text-base-content/50">
        {{ label }}
      </span>
    </label>

    <!-- Input wrapper -->
    <div class="relative">
      <!-- Left icon -->
      <span
        v-if="icon"
        class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-base-content/30 transition-colors duration-150"
        :class="{ 'text-error/55': error }"
      >
        <i :class="`ti ti-${icon} text-base`" aria-hidden="true"></i>
      </span>

      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :class="[
          'input input-bordered w-full text-sm h-11 transition-all duration-200',
          'focus:outline-none focus:ring-2 placeholder-shown:text-base-content/35',
          icon ? 'pl-11' : 'pl-4',
          isPassword ? 'pr-11' : 'pr-4',
          error ? 'input-error border-error/40 focus:border-error/60 focus:ring-error/20' : 'border-base-content/12 hover:border-base-content/18 focus:border-primary/50 focus:ring-primary/15',
        ]"
        @input="onInput"
      />

      <!-- Password toggle -->
      <button
        v-if="isPassword"
        type="button"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60 transition-colors duration-150 p-1"
        :aria-label="showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
        @click="toggleVisibility"
      >
        <i :class="`ti ti-${showPass ? 'eye-off' : 'eye'} text-base`" aria-hidden="true"></i>
      </button>
    </div>

    <!-- Error message -->
    <label v-if="error" class="label pt-1 pb-0">
      <span class="label-text-alt text-error/90 flex items-center gap-1.5">
        <i class="ti ti-alert-circle text-xs" aria-hidden="true"></i>
        {{ error }}
      </span>
    </label>

    <!-- Hint message -->
    <label v-else-if="hint" class="label pt-1 pb-0">
      <span class="label-text-alt text-base-content/40 flex items-center gap-1.5">
        <i class="ti ti-info-circle text-xs" aria-hidden="true"></i>
        {{ hint }}
      </span>
    </label>
  </div>
</template>