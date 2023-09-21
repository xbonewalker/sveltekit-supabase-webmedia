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
      articles: {
        Row: {
          content1: string
          content2: string
          created_at: string
          id: number
          slug: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content1: string
          content2: string
          created_at?: string
          id?: number
          slug: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content1?: string
          content2?: string
          created_at?: string
          id?: number
          slug?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
