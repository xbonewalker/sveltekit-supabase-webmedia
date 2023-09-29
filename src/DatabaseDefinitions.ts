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
          username: string
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
          username: string
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
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_username_fkey"
            columns: ["username"]
            referencedRelation: "profiles"
            referencedColumns: ["username"]
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
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role_id: number
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role_id?: number
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role_id?: number
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
      }
      roles: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
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
