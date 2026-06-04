<script setup>
import { ref } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  icon: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  maxlength: { type: Number, default: undefined },
  autocomplete: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const showPass = ref(false)
const isPassword = props.type === 'password'
const inputType = ref(props.type)

function toggleVisibility() {
  showPass.value = !showPass.value
  inputType.value = showPass.value ? 'text' : 'password'
}

function onInput(e) {
  let val = e.target.value
  // NIP: hanya angka
  if (props.id.includes('nip')) {
    val = val.replace(/\D/g, '').slice(0, 18)
    e.target.value = val
  }
  emit('update:modelValue', val)
}
</script>

<template>
  <div class="form-control w-full">
    <label :for="id" class="label pb-1">
      <span class="label-text text-xs font-medium tracking-wide uppercase text-base-content/60">
        {{ label }}
      </span>
    </label>

    <div class="relative">
      <!-- Left icon -->
      <span
        v-if="icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-base-content/40"
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
          'input input-bordered w-full text-sm',
          icon ? 'pl-9' : '',
          isPassword ? 'pr-10' : '',
          error ? 'input-error' : '',
        ]"
        @input="onInput"
      />

      <!-- Password toggle -->
      <button
        v-if="isPassword"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
        :aria-label="showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
        @click="toggleVisibility"
      >
        <i :class="`ti ti-${showPass ? 'eye-off' : 'eye'} text-base`" aria-hidden="true"></i>
      </button>
    </div>

    <!-- Error -->
    <label v-if="error" class="label pt-1">
      <span class="label-text-alt text-error flex items-center gap-1">
        <i class="ti ti-alert-circle text-xs" aria-hidden="true"></i>
        {{ error }}
      </span>
    </label>

    <!-- Hint -->
    <label v-else-if="hint" class="label pt-1">
      <span class="label-text-alt text-base-content/40 flex items-center gap-1">
        <i class="ti ti-info-circle text-xs" aria-hidden="true"></i>
        {{ hint }}
      </span>
    </label>
  </div>
</template>