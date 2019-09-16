import { fetchTrackingPlan, SegmentAPI } from './api'
import {
	TrackingPlanConfig,
	resolveRelativePath,
	verifyDirectoryExists,
	getConfig,
	getToken,
} from '../config'
import sortKeys from 'sort-keys'
import * as fs from 'fs'
import { promisify } from 'util'
import { flow } from 'lodash'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

export const TRACKING_PLAN_FILENAME = 'plan.json'

export async function loadTrackingPlan(
	configPath: string | undefined,
	config: TrackingPlanConfig
): Promise<SegmentAPI.TrackingPlan> {
	const path = resolveRelativePath(configPath, config.path, TRACKING_PLAN_FILENAME)

	try {
		// Load the Tracking Plan from the local cache.
		const plan = JSON.parse(
			await readFile(path, {
				encoding: 'utf-8',
			})
		) as SegmentAPI.TrackingPlan

		return await sanitizeTrackingPlan(plan)
	} catch {
		// If the Tracking Plan hasn't been cached locally, fetch the tracking plan and cache it.
		const cfg = await getConfig(configPath)

		if (!cfg) {
			throw new Error('Unable to find typewriter.yml. Try `typewriter init`')
		}

		const token = await getToken(cfg)
		if (!token) {
			throw new Error(
				'Unable to find a TYPEWRITER_TOKEN in your environment or a valid token script in your `typewriter.yml`.'
			)
		}

		const plan = await fetchTrackingPlan({
			id: config.id,
			workspaceSlug: config.workspaceSlug,
			token,
		})

		await writeTrackingPlan(configPath, plan, config)

		return await sanitizeTrackingPlan(plan)
	}
}

export async function writeTrackingPlan(
	configPath: string | undefined,
	plan: SegmentAPI.TrackingPlan,
	config: TrackingPlanConfig
) {
	const path = resolveRelativePath(configPath, config.path, TRACKING_PLAN_FILENAME)
	await verifyDirectoryExists(path, 'file')

	// Perform some pre-processing on the Tracking Plan before writing it.
	const planJSON = flow<SegmentAPI.TrackingPlan, SegmentAPI.TrackingPlan, string>(
		// Enforce a deterministic ordering to reduce verson control deltas.
		plan => sortKeys(plan, { deep: true }),
		plan => JSON.stringify(plan, undefined, 4)
	)(plan)

	await writeFile(path, planJSON, {
		encoding: 'utf-8',
	})
}

export async function sanitizeTrackingPlan(
	plan: SegmentAPI.TrackingPlan
): Promise<SegmentAPI.TrackingPlan> {
	// TODO: on JSON Schema Draft-04, required fields must have at least one element.
	// Therefore, we strip `required: []` from your rules so this error isn't surfaced.
	return plan
}