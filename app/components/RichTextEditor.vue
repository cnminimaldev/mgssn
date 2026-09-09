<template>
  <div class="bg-black border border-zinc-700 rounded-lg overflow-hidden focus-within:border-emerald-500 transition-colors">
    <!-- TOOLBAR -->
    <div v-if="editor" class="flex flex-wrap items-center gap-1 bg-zinc-900/80 border-b border-zinc-700 p-2">
      <!-- 1. KIỂU CHỮ (Bold, Italic, Underline) -->
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

      <button 
        @click.prevent="editor.chain().focus().toggleUnderline().run()" 
        :class="{ 'bg-zinc-700 text-white': editor.isActive('underline'), 'text-zinc-400 hover:bg-zinc-800 hover:text-white': !editor.isActive('underline') }"
        class="p-1.5 rounded transition" title="下線 (Underline)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
      </button>

      <div class="w-px h-5 bg-zinc-700 mx-1"></div>

      <!-- 2. KÍCH THƯỚC & ĐẦU MỤC (Size, H2, H3) -->
      <select 
        @change="handleFontSizeChange"
        class="bg-zinc-800 text-zinc-300 text-xs border border-zinc-600 rounded px-1.5 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
        <option value="">標準サイズ</option>
        <option value="12px">12px (小)</option>
        <option value="16px">16px (中)</option>
        <option value="20px">20px (大)</option>
        <option value="24px">24px (特大)</option>
      </select>

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

      <!-- 3. MÀU SẮC (Color Picker) -->
      <div class="flex items-center gap-1 px-1" title="文字色 (Text Color)">
        <input
        type="color"
        @input="handleColorChange"
        :value="editor.getAttributes('textStyle').color || '#d4d4d8'"
        class="w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent"
        >
      </div>

      <div class="w-px h-5 bg-zinc-700 mx-1"></div>

      <!-- 4. DANH SÁCH & LIÊN KẾT -->
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
        class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 rounded text-xs font-bold transition-colors shadow-sm"
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
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Node, Extension, mergeAttributes } from '@tiptap/core'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// Hàm xử lý đổi cỡ chữ an toàn với TypeScript
const handleFontSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement // Ép kiểu báo cho TS biết đây là thẻ Select
  if (target && editor.value) {
    editor.value.chain().focus().setFontSize(target.value).run()
  }
}

// Hàm xử lý đổi màu chữ an toàn với TypeScript
const handleColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement // Ép kiểu báo cho TS biết đây là thẻ Input
  if (target && editor.value) {
    editor.value.chain().focus().setColor(target.value).run()
  }
}

// --- TẠO CUSTOM EXTENSION (FONT SIZE) ---
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        if (!fontSize) {
          return chain().setMark('textStyle', { fontSize: null }).run()
        }
        return chain().setMark('textStyle', { fontSize }).run()
      },
    }
  },
})

// --- TẠO CUSTOM EXTENSION (KHỐI DANH SÁCH PHIM) ---
const MovieListBlock = Node.create({
  name: 'movieListBlock',
  group: 'block',
  atom: true, 
  addAttributes() {
    return {
      filterData: { default: '{}' }
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-type="movie-list"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'movie-list', 
      class: 'my-6 p-6 bg-zinc-900 border border-emerald-500/30 rounded-xl text-center shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
    }), 
      ['div', { class: 'text-emerald-400 font-bold text-lg mb-1' }, '🎬 映画リストブロック'],
      ['div', { class: 'text-zinc-500 text-xs' }, 'ユーザー画面ではここに作品リストが表示されます']
    ]
  }
})

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Image,
    Underline,
    TextStyle,
    Color,
    FontSize,
    MovieListBlock,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-invert prose-emerald max-w-none focus:outline-none min-h-[300px]',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (value) => {
  const isSame = editor.value?.getHTML() === value
  if (!isSame && editor.value) {
    editor.value.commands.setContent(value, { emitUpdate: false })
  }
})

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

const insertMovieList = () => {
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
.ProseMirror p { margin-bottom: 1em; }
.ProseMirror h2 { font-size: 1.5em; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; color: white; }
.ProseMirror h3 { font-size: 1.25em; font-weight: bold; margin-top: 1.2em; margin-bottom: 0.5em; color: white; }
.ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
.ProseMirror a { color: #10b981; text-decoration: underline; }
.ProseMirror img { max-width: 100%; border-radius: 0.5rem; margin: 1em 0; }
</style>