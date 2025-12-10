export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Khai báo rõ 2 bảng này để select() hoạt động chuẩn
      movies: {
        Row: {
          slug: string
          updated_at: string | null
        }
        Insert: any
        Update: any
      }
      series: {
        Row: {
          slug: string
          updated_at: string | null
        }
        Insert: any
        Update: any
      }
      // Fallback cho các bảng khác
      [key: string]: any 
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      [key: string]: any
    }
    Enums: {
      [key: string]: any
    }
  }
}