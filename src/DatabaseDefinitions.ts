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
      articles_tags: {
        Row: {
          article_id: number
          created_at: string
          tag_id: number
          updated_at: string
        }
        Insert: {
          article_id: number
          created_at?: string
          tag_id: number
          updated_at?: string
        }
        Update: {
          article_id?: number
          created_at?: string
          tag_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_tags_article_id_fkey"
            columns: ["article_id"]
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
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
