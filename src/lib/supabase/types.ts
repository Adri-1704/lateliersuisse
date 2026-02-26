// ============================================
// Database Types - Auto-generated from schema
// ============================================

export type SubscriptionPlan = "monthly" | "semiannual" | "annual" | "lifetime";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "incomplete" | "trialing";
export type PriceRange = "1" | "2" | "3" | "4";

export interface CuisineType {
  id: string;
  slug: string;
  name_fr: string;
  name_de: string;
  name_en: string;
  icon: string | null;
  restaurant_count: number;
  created_at: string;
  updated_at: string;
}

export interface Merchant {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  stripe_customer_id: string | null;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  merchant_id: string;
  stripe_subscription_id: string | null;
  plan_type: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbRestaurant {
  id: string;
  merchant_id: string | null;
  slug: string;
  name_fr: string;
  name_de: string;
  name_en: string;
  description_fr: string | null;
  description_de: string | null;
  description_en: string | null;
  cuisine_type_id: string | null;
  cuisine_type: string | null;
  canton: string;
  city: string;
  address: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  price_range: PriceRange;
  avg_rating: number;
  review_count: number;
  opening_hours: Record<string, { open: string; close: string; closed?: boolean }>;
  features: string[];
  cover_image: string | null;
  is_featured: boolean;
  is_published: boolean;
  search_vector: string | null;
  created_at: string;
  updated_at: string;
}

export interface RestaurantImage {
  id: string;
  restaurant_id: string;
  url: string;
  alt_text: string | null;
  position: number;
  created_at: string;
}

export interface DbReview {
  id: string;
  restaurant_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  reply_comment: string | null;
  reply_date: string | null;
  created_at: string;
}

export interface DbMenuItem {
  id: string;
  restaurant_id: string;
  name_fr: string;
  name_de: string | null;
  name_en: string | null;
  description_fr: string | null;
  description_de: string | null;
  description_en: string | null;
  price: number;
  category: string;
  position: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeaturedRestaurant {
  id: string;
  restaurant_id: string;
  month: number;
  year: number;
  position: number;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  locale: string;
  is_active: boolean;
  created_at: string;
}

export type B2BContactStatus = "new" | "contacted" | "converted" | "archived";

export interface B2BContactRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  restaurant_name: string;
  city: string;
  message: string | null;
  status: B2BContactStatus;
  locale: string;
  notes: string | null;
  created_at: string;
}

// ============================================
// Supabase Database type for client
// ============================================

export interface Database {
  public: {
    Tables: {
      cuisine_types: {
        Row: CuisineType;
        Insert: Omit<CuisineType, "id" | "created_at" | "updated_at" | "restaurant_count"> & {
          id?: string;
          restaurant_count?: number;
        };
        Update: Partial<Omit<CuisineType, "id">>;
        Relationships: [];
      };
      merchants: {
        Row: Merchant;
        Insert: Omit<Merchant, "id" | "created_at" | "updated_at" | "auth_user_id"> & { id?: string; auth_user_id?: string | null };
        Update: Partial<Omit<Merchant, "id">>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Subscription, "id">>;
        Relationships: [];
      };
      restaurants: {
        Row: DbRestaurant;
        Insert: Omit<DbRestaurant, "id" | "created_at" | "updated_at" | "search_vector" | "avg_rating" | "review_count"> & {
          id?: string;
          avg_rating?: number;
          review_count?: number;
        };
        Update: Partial<Omit<DbRestaurant, "id" | "search_vector">>;
        Relationships: [];
      };
      restaurant_images: {
        Row: RestaurantImage;
        Insert: Omit<RestaurantImage, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<RestaurantImage, "id">>;
        Relationships: [];
      };
      reviews: {
        Row: DbReview;
        Insert: Omit<DbReview, "id" | "created_at" | "is_verified" | "reply_comment" | "reply_date"> & { id?: string; is_verified?: boolean; reply_comment?: string | null; reply_date?: string | null };
        Update: Partial<Omit<DbReview, "id">>;
        Relationships: [];
      };
      menu_items: {
        Row: DbMenuItem;
        Insert: Omit<DbMenuItem, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<DbMenuItem, "id">>;
        Relationships: [];
      };
      featured_restaurants: {
        Row: FeaturedRestaurant;
        Insert: Omit<FeaturedRestaurant, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<FeaturedRestaurant, "id">>;
        Relationships: [];
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: Omit<ContactSubmission, "id" | "created_at" | "is_read"> & { id?: string };
        Update: Partial<Omit<ContactSubmission, "id">>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<NewsletterSubscriber, "id">>;
        Relationships: [];
      };
      b2b_contact_requests: {
        Row: B2BContactRequest;
        Insert: Omit<B2BContactRequest, "id" | "created_at" | "status" | "notes"> & {
          id?: string;
          status?: B2BContactStatus;
          notes?: string | null;
        };
        Update: Partial<Omit<B2BContactRequest, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
      price_range: PriceRange;
    };
    CompositeTypes: Record<string, never>;
  };
}
