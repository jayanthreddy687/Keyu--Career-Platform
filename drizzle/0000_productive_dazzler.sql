CREATE TABLE "interview_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"mock_interview_id" integer NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"conversation_s3_path" varchar(500),
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"duration" integer,
	"questions_asked" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'in_progress',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interview_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "mock_interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"job_title" varchar(255) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"job_description" text,
	"years_of_experience" integer,
	"cv_s3_path" varchar(500),
	"cv_file_name" varchar(255),
	"job_description_s3_path" varchar(500),
	"job_description_file_name" varchar(255),
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_mock_interview_id_mock_interviews_id_fk" FOREIGN KEY ("mock_interview_id") REFERENCES "public"."mock_interviews"("id") ON DELETE no action ON UPDATE no action;