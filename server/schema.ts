import { serial, pgTable, text } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
	id: serial("id").primaryKey().notNull(),
	title: text("title").notNull(),
});
