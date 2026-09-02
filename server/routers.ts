import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { completeActionSchema, dataModeSchema, createExposureEventSchema, demoDisclosure, integrationSchema, riskConfigSchema, updateResolutionSchema, userNoteSchema } from "../shared/watchtower";
import { addUserNote, completeRecommendedAction, createExposureForUser, getDashboardForUser, getExposureDetailForUser, getRiskConfigForUser, getRiskHistoryForUser, listExposuresForUser, listIntegrationReferences, recordRiskAssessment, registerIntegrationReference, requestAccountDeletion, requestDataExport, updateExposureResolution, updateRiskConfigForUser } from "./db";
import { getSupplyChainConsole } from "./supplyChainConsole";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { calculateRiskAssessment } from "./riskEngine";

const requestWindows = new Map<string, { count: number; resetAt: number }>();
const protectedRateLimitedProcedure = publicProcedure.use(async ({ ctx, next, path }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in to access your Watchtower." });
  const key = `${ctx.user.id}:${path}`;
  const now = Date.now();
  const current = requestWindows.get(key);
  const windowState = !current || current.resetAt <= now ? { count: 0, resetAt: now + 60_000 } : current;
  if (windowState.count >= 60) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait a moment and try again." });
  windowState.count += 1;
  requestWindows.set(key, windowState);
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  watchtower: router({
    supplyChain: protectedRateLimitedProcedure.query(() => getSupplyChainConsole()),
    dashboard: protectedRateLimitedProcedure.input(z.object({ dataMode: dataModeSchema.default("live") }).default({ dataMode: "live" })).query(async ({ ctx, input }) => { const dashboard = await getDashboardForUser(ctx.user.id, input.dataMode); const config = await getRiskConfigForUser(ctx.user.id); const assessment = calculateRiskAssessment(dashboard.events.map(event => ({ exposureId: event.id, category: event.category, severity: event.severity, status: event.status, riskImpact: event.riskImpact, title: event.title })), config); return { ...dashboard, assessment, config, disclosure: input.dataMode === "demo" ? demoDisclosure : null }; }),
    events: router({
      list: protectedRateLimitedProcedure.input(z.object({ dataMode: dataModeSchema.default("live") }).default({ dataMode: "live" })).query(({ ctx, input }) => listExposuresForUser(ctx.user.id, input.dataMode)),
      get: protectedRateLimitedProcedure.input(z.object({ exposureId: z.string().regex(/^EXP-[A-Z0-9]{8}$/), dataMode: dataModeSchema.default("live") })).query(async ({ ctx, input }) => { const detail = await getExposureDetailForUser(ctx.user.id, input.exposureId, input.dataMode); if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "Exposure event not found." }); return detail; }),
      create: protectedRateLimitedProcedure.input(createExposureEventSchema).mutation(async ({ ctx, input }) => { const id = await createExposureForUser(ctx.user.id, input); return { id }; }),
      updateResolution: protectedRateLimitedProcedure.input(updateResolutionSchema).mutation(async ({ ctx, input }) => { const updated = await updateExposureResolution(ctx.user.id, input.exposureId, input.status, input.resolutionNote); if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Live exposure event not found." }); return { updated }; }),
      addNote: protectedRateLimitedProcedure.input(userNoteSchema).mutation(async ({ ctx, input }) => { const created = await addUserNote(ctx.user.id, input.exposureId, input.body); if (!created) throw new TRPCError({ code: "NOT_FOUND", message: "Live exposure event not found." }); return { created }; }),
      completeAction: protectedRateLimitedProcedure.input(completeActionSchema).mutation(async ({ ctx, input }) => { const completed = await completeRecommendedAction(ctx.user.id, input.exposureId, input.actionType); if (!completed) throw new TRPCError({ code: "NOT_FOUND", message: "Live exposure event not found." }); return { completed }; }),
    }),
    risk: router({
      explain: protectedRateLimitedProcedure.input(z.object({ dataMode: dataModeSchema.default("live"), recordHistory: z.boolean().default(false) })).query(async ({ ctx, input }) => { const events = await listExposuresForUser(ctx.user.id, input.dataMode); const config = await getRiskConfigForUser(ctx.user.id); const assessment = calculateRiskAssessment(events.map(event => ({ exposureId: event.id, category: event.category, severity: event.severity, status: event.status, riskImpact: event.riskImpact, title: event.title })), config); if (input.recordHistory) await recordRiskAssessment(ctx.user.id, input.dataMode, assessment); return { ...assessment, config, history: await getRiskHistoryForUser(ctx.user.id, input.dataMode) }; }),
      config: protectedRateLimitedProcedure.query(({ ctx }) => getRiskConfigForUser(ctx.user.id)),
      updateConfig: protectedRateLimitedProcedure.input(riskConfigSchema).mutation(({ ctx, input }) => updateRiskConfigForUser(ctx.user.id, input)),
      recordSnapshot: protectedRateLimitedProcedure.input(z.object({ dataMode: dataModeSchema.default("live") }).default({ dataMode: "live" })).mutation(async ({ ctx, input }) => { const events = await listExposuresForUser(ctx.user.id, input.dataMode); const assessment = calculateRiskAssessment(events.map(event => ({ exposureId: event.id, category: event.category, severity: event.severity, status: event.status, riskImpact: event.riskImpact, title: event.title })), await getRiskConfigForUser(ctx.user.id)); await recordRiskAssessment(ctx.user.id, input.dataMode, assessment); return assessment; }),
    }),
    integrations: router({
      list: protectedRateLimitedProcedure.query(({ ctx }) => listIntegrationReferences(ctx.user.id)),
      register: protectedRateLimitedProcedure.input(integrationSchema).mutation(async ({ ctx, input }) => { await registerIntegrationReference(ctx.user.id, input); return { accepted: true, message: "Provider metadata is recorded as not connected. Credentials are never accepted by this endpoint." }; }),
    }),
    privacy: router({
      requestExport: protectedRateLimitedProcedure.mutation(({ ctx }) => requestDataExport(ctx.user.id)),
      requestDeletion: protectedRateLimitedProcedure.mutation(({ ctx }) => requestAccountDeletion(ctx.user.id)),
    }),
  }),
});

export type AppRouter = typeof appRouter;
