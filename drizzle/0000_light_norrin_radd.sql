CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`flight_id` integer NOT NULL,
	`passenger_id` integer NOT NULL,
	`booking_reference` text NOT NULL,
	`seat_number` text NOT NULL,
	`booking_date` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_price` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`flight_id`) REFERENCES `flights`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`passenger_id`) REFERENCES `passengers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_booking_reference_unique` ON `bookings` (`booking_reference`);--> statement-breakpoint
CREATE TABLE `flights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`flight_number` text NOT NULL,
	`airline` text NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`departure_time` text NOT NULL,
	`arrival_time` text NOT NULL,
	`price` integer NOT NULL,
	`available_seats` integer NOT NULL,
	`total_seats` integer NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `flights_flight_number_unique` ON `flights` (`flight_number`);--> statement-breakpoint
CREATE TABLE `passengers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`passport_number` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `passengers_email_unique` ON `passengers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `passengers_passport_number_unique` ON `passengers` (`passport_number`);