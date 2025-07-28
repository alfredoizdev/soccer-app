CREATE TABLE "streaming_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"broadcaster_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"stream_key" text NOT NULL,
	"title" text,
	"description" text,
	"started_at" timestamp with time zone DEFAULT now(),
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "streaming_sessions_id_unique" UNIQUE("id"),
	CONSTRAINT "streaming_sessions_stream_key_unique" UNIQUE("stream_key")
);
--> statement-breakpoint
CREATE TABLE "webrtc_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"viewer_id" uuid NOT NULL,
	"connection_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"left_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "webrtc_connections_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "streaming_sessions" ADD CONSTRAINT "streaming_sessions_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaming_sessions" ADD CONSTRAINT "streaming_sessions_broadcaster_id_users_id_fk" FOREIGN KEY ("broadcaster_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webrtc_connections" ADD CONSTRAINT "webrtc_connections_session_id_streaming_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."streaming_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webrtc_connections" ADD CONSTRAINT "webrtc_connections_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;