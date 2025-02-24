import { eq, and } from "drizzle-orm";
import {
  hashPassword,
  get_question_list_ready_for_match,
} from "random-functions/backend/backend1";
import { z } from "zod";
import bcrypt from "bcrypt";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { match, player } from "~/server/db/schema";

export const gameRouter = createTRPCRouter({
  start_match: protectedProcedure
    .input(
      z.object({
        match_name: z.string(),
        // player_username: z.string(),
        match_id: z.string(),
        match_password: z.string(),
        player_password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existing_match = await ctx.db.query.match.findFirst({
          where: and(
            eq(match.id, input.match_id.trim()),
            eq(match.name, input.match_name.trim()),
            eq(match.password, input.match_password.trim()),
          ),
          with: { players: true },
        });
        if (existing_match) {
          const this_player = existing_match.players.find(
            //            (player) => player.username === input.player_username.trim(),
            (player) => player.username === ctx.session.user.username,
          );
          if (this_player) {
            const comparison = await bcrypt.compare(
              input.player_password,
              this_player?.hashed_password,
            );
            if (
              comparison &&
              existing_match.current_judge === ctx.session.user.username
            ) {
              await ctx.db
                .update(match)
                .set({
                  has_started: true,
                })
                .where(eq(match.id, existing_match.id));
            }
            existing_match.players = [];
            return {
              this_player,
              existing_match,
              error: false,
              error_description: null,
            };
          }
        }
        return {
          this_player: null,
          existing_match: null,
          error: true,
          error_description: "Something went wrong. Please try again.",
        };
      } catch (error) {
        console.error("Error in mutation:", error);
        return {
          this_player: null,
          existing_match: null,
          error: true,
          error_description: "Something went wrong. Please try again.",
        };
      }
    }),

  create_match: protectedProcedure
    .input(
      z.object({
        match_name: z.string(),
        // player_username: z.string(),
        deck_id: z.string(),
        match_password: z.string(),
        player_password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const question_list = await get_question_list_ready_for_match(
          input.deck_id,
          ctx.session.user.id,
        );

        if (!question_list) {
          return null;
        }
        const first_question = question_list.shift();

        const new_match = await ctx.db
          .insert(match)
          .values({
            name: input.match_name.trim(),
            current_judge: ctx.session.user.username,
            password: input.match_password.trim(),
            all_questions: question_list,
            question: first_question!,
            deck: input.deck_id,
            scheduled_for_deletion: false,
          })
          .returning();

        const returned_new_match = new_match.at(0);

        if (!returned_new_match) {
          return null;
        }

        const hashedPassword = await hashPassword(input.player_password.trim());

        const first_player = await ctx.db
          .insert(player)
          .values({
            // username: input.player_username.trim(),
            username: ctx.session.user.username,
            hashed_password: hashedPassword,
            match: returned_new_match?.id,
          })
          .returning();

        return {
          returned_new_match,
          first_player: first_player.at(0),
          error: false,
          error_description: null,
        };
      } catch (error) {
        console.error("Error in mutation:", error);
        return {
          error: true,
          error_description: "Something went wrong. Please try again.",
          user: null,
        };
      }
    }),
  join_match: protectedProcedure
    .input(
      z.object({
        match_name: z.string(),
        // player_username: z.string(),
        match_id: z.string(),
        match_password: z.string(),
        player_password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existing_match = await ctx.db.query.match.findFirst({
          where: and(
            eq(match.id, input.match_id.trim()),
            eq(match.password, input.match_password.trim()),
          ),
          with: { players: true },
        });
        if (existing_match) {
          const this_player = existing_match.players.find(
            // (player) => player.username === input.player_username.trim(),

            (player) => player.username === ctx.session.user.username.trim(),
          );

          if (this_player) {
            const comparison = await bcrypt.compare(
              input.player_password,
              this_player?.hashed_password,
            );
            if (comparison) {
              return {
                existing_match,
                first_player: this_player,
                error: false,
                error_description: null,
              };
            } else {
              return null;
            }
          }
          const hashedPassword = await hashPassword(
            input.player_password.trim(),
          );

          const new_player = await ctx.db
            .insert(player)
            .values({
              // username: input.player_username.trim(),
              username: ctx.session.user.username.trim(),
              hashed_password: hashedPassword,
              match: existing_match.id,
            })
            .returning();

          const actual_player = new_player.at(0);
          existing_match.players = [];
          return {
            existing_match,
            this_player: actual_player,
            error: false,
            error_description: null,
          };
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error in mutation:", error);
        return {
          error: true,
          error_description: "Something went wrong. Please try again.",
          user: null,
        };
      }
    }),
  answer: protectedProcedure
    .input(
      z.object({
        match_name: z.string(),
        // player_username: z.string(),
        match_id: z.string(),
        match_password: z.string(),
        player_password: z.string(),
        answer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existing_match = await ctx.db.query.match.findFirst({
          where: and(
            eq(match.id, input.match_id.trim()),
            eq(match.name, input.match_name.trim()),
            eq(match.password, input.match_password.trim()),
          ),
          with: { players: true },
        });
        if (existing_match) {
          const this_player = existing_match.players.find(
            //            (player) => player.username === input.player_username.trim(),
            (player) => player.username === ctx.session.user.username,
          );
          if (this_player) {
            const comparison = await bcrypt.compare(
              input.player_password,
              this_player?.hashed_password,
            );
            if (comparison) {
              existing_match.players = [];

              await ctx.db
                .update(player)
                .set({ answer: input.answer })
                .where(
                  and(
                    eq(player.username, ctx.session.user.username),
                    eq(player.hashed_password, this_player.hashed_password),
                  ),
                );

              return {
                error: false,
                error_description: null,
              };
            } else {
              return null;
            }
          }

          return {
            error: false,
            error_description: null,
          };
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error in mutation:", error);
        return {
          error: true,
          error_description: "Something went wrong. Please try again.",
          user: null,
        };
      }
    }),
  judge_vote_for: protectedProcedure
    .input(
      z.object({
        match_name: z.string(),
        target_username: z.string(),
        match_id: z.string(),
        match_password: z.string(),
        player_password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existing_match = await ctx.db.query.match.findFirst({
          where: and(
            eq(match.id, input.match_id.trim()),
            eq(match.password, input.match_password.trim()),
            eq(match.name, input.match_name.trim()),
          ),
          with: { players: true },
        });
        if (existing_match) {
          const this_player = existing_match.players.find(
            (player) => player.username === ctx.session.user.username.trim(),
          );

          const target_player = existing_match.players.find(
            (player) => player.username === input.target_username.trim(),
          );

          if (this_player && target_player) {
            const comparison = await bcrypt.compare(
              input.player_password,
              this_player?.hashed_password,
            );
            if (comparison) {
              await ctx.db
                .update(player)
                .set({
                  score: target_player.score + 1,
                })
                .where(eq(player.id, target_player.id));

              await ctx.db
                .update(player)
                .set({
                  answer: "",
                })
                .where(eq(player.match, target_player.match));

              const new_question = existing_match.all_questions.shift();
              if (new_question) {
                await ctx.db
                  .update(match)
                  .set({
                    question: new_question,
                    all_questions: existing_match.all_questions,
                  })
                  .where(eq(match.id, existing_match.id));
              }

              return {
                first_player: this_player,
                error: false,
                error_description: null,
              };
            } else {
              return null;
            }
          }
          const hashedPassword = await hashPassword(
            input.player_password.trim(),
          );

          const new_player = await ctx.db
            .insert(player)
            .values({
              username: input.target_username.trim(),
              hashed_password: hashedPassword,
              match: existing_match.id,
            })
            .returning();

          const actual_player = new_player.at(0);
          existing_match.players = [];
          return {
            existing_match,
            first_player: actual_player,
            error: false,
            error_description: null,
          };
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error in mutation:", error);
        return {
          error: true,
          error_description: "Something went wrong. Please try again.",
          user: null,
        };
      }
    }),
  get_data_on_match: protectedProcedure
    .input(
      z.object({
        match_name: z.string(),
        match_id: z.string(),
        match_password: z.string(),
        player_password: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const new_date = new Date();
      console.log(new_date);

      console.log("getting data for get_data_on_match PROCEDURE ");
      const existing_match = await ctx.db.query.match.findFirst({
        where: and(
          eq(match.id, input.match_id.trim()),
          eq(match.password, input.match_password.trim()),
          eq(match.name, input.match_name.trim()),
        ),
        with: { players: true },
      });
      if (!existing_match?.players) {
        return null;
      }
      for (let i = 0; i < existing_match?.players.length; i++) {
        existing_match.players[i]!.hashed_password = "hashedpassword";
      }
      console.log("existing_match", existing_match);
      return existing_match;
    }),
  get_available_matches: protectedProcedure.query(async ({ ctx }) => {
    const existing_matches = await ctx.db.query.match.findMany({
      columns: { id: true, name: true },
      where: and(eq(match.has_started, false)),
    });

    return existing_matches;
  }),
});
