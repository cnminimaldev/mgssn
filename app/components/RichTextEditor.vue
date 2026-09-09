<template>
  <div class="bg-black border border-zinc-700 rounded-lg overflow-hidden focus-within:border-emerald-500 transition-colors">
    <!-- TOOLBAR -->
    <div v-if="editor" class="flex flex-wrap items-center gap-1 bg-zinc-900/80 border-b border-zinc-700 p-2">
      <button 
        @click.prevent="editor.chain().focus().toggleBold().run()" 
        :class="{ 'bg-zinc-700 text-white': editor.isActive('bold'), 'text-zinc-400 hover:bg-zinc-800 hover:text-white': !editor.isActive('bold') }"
        class="p-1.5 rounded transition" title="太字 (Bold)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path></svg>
      </button>
      
      <button 
        @click.prevent="editor.chain().focus().toggleItalic().run()" 
        :class="{ 'bg-zinc-700 text-white': editor.isActive('italic'), 'text-zinc-400 hover:bg-zinc-800 hover:text-white': !editor.isActive('italic') }"
        class="p-1.5 rounded transition" title="斜体 (Italic)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
      </button>

      <div class="w-px h-5 bg-zinc-700 mx-1"></div>

      <button 
        @click.prevent="editor.chain().focus().toggleHeading({ level: 2 }).run()" 
        :class="{ 'bg-zinc-700 text-white': editor.isActive('heading', { level: 2 }), 'text-zinc-400 hover:bg-zinc-800 hover:text-white': !editor.isActive('heading', { level: 2 }) }"
        class="p-1.5 rounded transition text-xs font-bold" title="見出し2 (H2)"
      >
        H2
      </button>
      
      <button 
        @click.prevent="editor.chain().focus().toggleHeading({ level: 3 }).run()" 
        :class="{ 'bg-zinc-700 text-white': editor.isActive('heading', { level: 3 }), 'text-zinc-400 hover:bg-zinc-800 hover:text-white': !editor.isActive('heading', { level: 3 }) }"
        class="p-1.5 rounded transition text-xs font-bold" title="見出し3 (H3)"
      >
        H3
      </button>

      <div class="w-px h-5 bg-zinc-700 mx-1"></div>

      <button 
        @click.prevent="editor.chain().focus().toggleBulletList().run()" 
        :class="{ 'bg-zinc-700 text-white': editor.isActive('bulletList'), 'text-zinc-400 hover:bg-zinc-800 hover:text-white': !editor.isActive('bulletList') }"
        class="p-1.5 rounded transition" title="箇条書き (Bullet List)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
      </button>

      <button 
        @click.prevent="setLink" 
        :class="{ 'bg-zinc-700 text-white': editor.isActive('link'), 'text-zinc-400 hover:bg-zinc-800 hover:text-white': !editor.isActive('link') }"
        class="p-1.5 rounded transition" title="リンク (Link)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
      </button>

      <div class="flex-1"></div>

      <!-- NÚT CHÈN BLOCK PHIM (MAGIC BUTTON) -->
      <button 
        @click.prevent="insertMovieList"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 rounded text-xs font-bold transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" /></svg>
        作品リストを挿入
      </button>
    </div>

    <!-- KHU VỰC SOẠN THẢO -->
    <editor-content :editor="editor" class="p-4 min-h-[300px] text-zinc-300" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Node, mergeAttributes } from '@tiptap/core'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// --- TẠO CUSTOM EXTENSION (KHỐI DANH SÁCH PHIM) ---
// Đây là kỹ thuật giúp Tiptap hiểu một thẻ HTML đặc biệt không bị xóa đi
const MovieListBlock = Node.create({
  name: 'movieListBlock',
  group: 'block',
  atom: true, // Xem nó như một khối nguyên khối (không thể gõ chữ vào giữa khối này)
  
  // Lưu trữ các cấu hình bộ lọc (năm, quốc gia, thể loại)
  addAttributes() {
    return {
      filterData: {
        default: '{}',
      }
    }
  },

  // Khi tải HTML từ DB lên, nhận diện thẻ có data-type="movie-list"
  parseHTML() {
    return [{ tag: 'div[data-type="movie-list"]' }]
  },

  // Khi hiển thị trong Admin (hoặc lưu vào DB), vẽ ra HTML này
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'movie-list', 
      class: 'my-6 p-6 bg-zinc-900 border border-emerald-500/30 rounded-xl text-center shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
    }), 
      ['div', { class: 'text-emerald-400 font-bold text-lg mb-1' }, '🎬 映画リストブロック'],
      ['div', { class: 'text-zinc-500 text-xs' }, 'ユーザー画面ではここに作品リストが表示されます (Trên Frontend sẽ render thành danh sách phim)']
    ]
  }
})
// --------------------------------------------------

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Image,
    MovieListBlock,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-invert prose-emerald max-w-none focus:outline-none min-h-[300px]',
    },
  },
  onUpdate: ({ editor }) => {
    // Mỗi khi gõ phím, tự động đẩy HTML ra v-model để form nhận được
    emit('update:modelValue', editor.getHTML())
  },
})

// Đồng bộ từ ngoài vào trong nếu dữ liệu load từ API bị chậm
watch(() => props.modelValue, (value) => {
  const isSame = editor.value?.getHTML() === value
  if (!isSame && editor.value) {
    // [ĐÃ SỬA] Thay false thành object { emitUpdate: false }
    editor.value.commands.setContent(value, { emitUpdate: false })
  }
})

// Chèn Link
const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URLを入力してください:', previousUrl)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// Chèn khối Danh sách phim
const insertMovieList = () => {
  // TODO: Tương lai chúng ta có thể gọi Modal ở đây để user chọn bộ lọc.
  // Hiện tại cứ chèn thẳng 1 khối giả lập cấu hình vào trước.
  const sampleFilter = JSON.stringify({ country: 'KR', limit: 12 })
  editor.value?.chain().focus().insertContent({
    type: 'movieListBlock',
    attrs: { filterData: sampleFilter }
  }).run()
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
/* CSS bổ sung để Editor đẹp hơn (Style Prose của Tiptap) */
.ProseMirror p { margin-bottom: 1em; }
.ProseMirror h2 { font-size: 1.5em; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; color: white; }
.ProseMirror h3 { font-size: 1.25em; font-weight: bold; margin-top: 1.2em; margin-bottom: 0.5em; color: white; }
.ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
.ProseMirror a { color: #10b981; text-decoration: underline; }
.ProseMirror img { max-width: 100%; border-radius: 0.5rem; margin: 1em 0; }
</style>