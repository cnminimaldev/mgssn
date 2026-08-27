<template>
  <footer class="mt-20 border-t border-white/5 bg-black py-10">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
      <!-- Chia 2 cột trên Desktop, 1 cột trên Mobile -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        
        <!-- Cột trái: Text (Chiếm 2/3 không gian) -->
        <!-- whitespace-pre-wrap giúp hiển thị đúng dấu xuống dòng (Enter) từ admin -->
        <div class="md:col-span-2 text-center md:text-left">
          <p v-if="settings" class="text-xs text-zinc-500 leading-relaxed whitespace-pre-wrap">
            {{ settings.footer_text }}
          </p>
          <div v-else class="h-4 bg-white/5 rounded w-1/2 mx-auto md:mx-0 animate-pulse"></div>
        </div>

        <!-- Cột phải: Mạng xã hội (Chiếm 1/3 không gian) -->
        <div class="md:col-span-1 flex justify-center md:justify-end gap-4">
          
          <!-- Nút X (Twitter) -->
          <a v-if="settings?.x_url" :href="settings.x_url" target="_blank" rel="noopener noreferrer" class="p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.95H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          <!-- Nút Telegram -->
          <a v-if="settings?.telegram_url" :href="settings.telegram_url" target="_blank" rel="noopener noreferrer" class="p-2 text-zinc-500 hover:text-[#0088cc] bg-white/5 hover:bg-[#0088cc]/10 rounded-full transition-colors">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>

          <!-- Nút Facebook -->
          <a v-if="settings?.facebook_url" :href="settings.facebook_url" target="_blank" rel="noopener noreferrer" class="p-2 text-zinc-500 hover:text-[#1877F2] bg-white/5 hover:bg-[#1877F2]/10 rounded-full transition-colors">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          
        </div>
      </div>
      
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()
const settings = ref<{ footer_text?: string, x_url?: string, telegram_url?: string, facebook_url?: string } | null>(null)

onMounted(async () => {
  const { data } = await supabase
    .from('site_settings')
    .select('footer_text, x_url, telegram_url, facebook_url')
    .eq('id', 'global')
    .single()
    
  if (data) {
    // Thêm 'as unknown as ...' vào dòng này
    settings.value = data as unknown as { 
      footer_text?: string; 
      x_url?: string; 
      telegram_url?: string; 
      facebook_url?: string 
    }
  }
})
</script>