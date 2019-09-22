/**
 * This client was automatically generated by Segment Typewriter. ** Do Not Edit **
 */

/**
 * Ajv is a peer dependency for development builds. It's used to apply run-time validation
 * to message payloads before passing them on to the underlying analytics instance.
 *
 * Note that the production bundle does not depend on Ajv.
 *
 * You can install it with: `npm install --save-dev ajv`.
 */
import Ajv from 'ajv'
import * as Segment from './segment'

export interface TrackingPlan {
	id?: string
	workspace_slug?: string
}
export interface Client {
	language?: string
	sdk?: string
}
export interface CommandRun {
	/**
	 * The time taken to execute this command, in ms.
	 */
	duration: number
	/**
	 * Whether or not typewriter is currently running in a CI environment or not.
	 */
	is_ci?: boolean
	/**
	 * Where the API token was fetched from.
	 */
	token_method?: string
	/**
	 * Metadata about the Tracking Plan that typewriter was fired on.
	 */
	tracking_plan?: TrackingPlan
	/**
	 * Metadata about the client that typewriter is generating.
	 */
	client?: Client
	/**
	 * The command name that was started.
	 */
	command: string
}
export interface TrackingPlan1 {
	workspace_slug?: string
	id?: string
}
export interface Client1 {
	language?: string
	sdk?: string
}
export interface ErrorFired {
	/**
	 * Whether or not typewriter is currently running in a CI environment or not.
	 */
	is_ci?: boolean
	/**
	 * Where the API token was fetched from.
	 */
	token_method?: string
	/**
	 * Metadata about the Tracking Plan that typewriter was fired on.
	 */
	tracking_plan?: TrackingPlan1
	/**
	 * Whether or not this error was an expected (and therefore, properly handled) error.
	 */
	unexpected: boolean
	/**
	 * Metadata about the client that typewriter is generating.
	 */
	client?: Client1
	/**
	 * The command name that was started.
	 */
	command?: string
	/**
	 * The full error itself.
	 */
	error: Record<string, any>
	/**
	 * The minimal error string itself.
	 */
	error_string: string
}

export type ViolationHandler = (
	message: Segment.TrackMessage<Record<string, any>>,
	violations: Ajv.ErrorObject[]
) => void

/**
 * The default handler that is fired if none is supplied with setTypewriterOptions.
 * If NODE_ENV="test", this handler will throw an error. Otherwise, it will log
 * a warning message to the console.
 */
export const defaultValidationErrorHandler: ViolationHandler = (
	message,
	violations
) => {
	const msg = JSON.stringify(
		{
			type: 'Typewriter JSON Schema Validation Error',
			description:
				`You made an analytics call (${
					message.event
				}) using Typewriter that doesn't match the ` + 'Tracking Plan spec.',
			errors: violations,
		},
		undefined,
		2
	)

	if (process.env.NODE_ENV === 'test') {
		throw new Error(msg)
	}
	console.warn(msg)
}

let onViolation = defaultValidationErrorHandler

const missingAnalyticsNodeError = new Error(`You must set an analytics-node instance:

>	const SegmentAnalytics = require('analytics-node')
>	const { setTypewriterOptions } = require('./analytics')
>
>	const analytics = new SegmentAnalytics('SEGMENT_WRITE_KEY')
>	setTypewriterOptions({
>		analytics: analytics,
>	})

For more information on analytics-node, see: https://segment.com/docs/sources/server/node/quickstart/
`)

let analytics: () => Segment.AnalyticsNode | undefined = () => {
	throw missingAnalyticsNodeError
}

/** Options to customize the runtime behavior of a Typewriter client. */
export interface TypewriterOptions {
	/**
	 * Underlying analytics instance where analytics calls are forwarded on to.
	 */
	analytics: Segment.AnalyticsNode
	/**
	 * Handler fired when if an event does not match its spec. This handler
	 * does not fire in production mode, because it requires inlining the full
	 * JSON Schema spec for each event in your Tracking Plan.
	 *
	 * By default, it will throw errors if NODE_ENV = "test" so that tests will fail
	 * if a message does not match the spec. Otherwise, errors will be logged to stderr.
	 */
	onViolation?: ViolationHandler
}

/**
 * Updates the run-time configuration of this Typewriter client.
 * This function must be called with a configured analytics-node instance before firing
 * any analytics calls, or else a `missingAnalyticsNodeError` error will be thrown.
 *
 * @param {TypewriterOptions} options - the options to upsert
 *
 * @typedef {Object} TypewriterOptions
 * @property {Segment.AnalyticsNode} analytics - Underlying analytics instance where analytics
 * 		calls are forwarded on to.
 * @property {Function} [onViolation] - Handler fired when if an event does not match its spec. This handler does not fire in
 * 		production mode, because it requires inlining the full JSON Schema spec for each event in your Tracking Plan. By default,
 * 		it will throw errors if NODE_ENV="test" so that tests will fail if a message does not match the spec. Otherwise, errors
 * 		will be logged to stderr.
 */
export function setTypewriterOptions(options: TypewriterOptions) {
	analytics = options.analytics ? () => options.analytics : analytics
	onViolation = options.onViolation || onViolation
}

/**
 * Validates a message against a JSON Schema using Ajv. If the message
 * is invalid, the `onViolation` handler will be called.
 */
function validateAgainstSchema(
	message: Segment.TrackMessage<Record<string, any>>,
	schema: object
) {
	const ajv = new Ajv({ schemaId: 'auto', allErrors: true, verbose: true })
	ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
	ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))

	if (!ajv.validate(schema, message) && ajv.errors) {
		onViolation(message, ajv.errors)
	}
}

/**
 * Helper to attach metadata on Typewriter to outbound requests.
 * This is used for attribution and debugging by the Segment team.
 */
function withTypewriterContext<P, T extends Segment.TrackMessage<P>>(
	message: T
): T {
	return {
		...message,
		context: {
			...(message.context || {}),
			typewriter: {
				language: 'typescript',
				version: '7.0.0-37',
			},
		},
	}
}

/**
 * A message payload for an analytics-node `.track()` call.
 * See: https://segment.com/docs/spec/track/
 *
 * @typedef TrackMessage<PropertiesType>
 * @property {string | number} [userId] - The ID for this user in your database.
 * @property {string | number} [anonymousId] - An ID to associated with the user when you don’t know who they are.
 * @property {PropertiesType} [properties] - A dictionary of properties for the event.
 * @property {Date} [timestamp] - A Javascript date object representing when the track took place. If the track
 * 		just happened, leave it out and we’ll use the server’s time. If you’re importing data from the past make
 * 		sure you to send a timestamp.
 * @template PropertiesType
 */

/**
 * @typedef TrackingPlan
 * @property {string} [id] -
 * @property {string} [workspace_slug] -
 */
/**
 * @typedef Client
 * @property {string} [language] -
 * @property {string} [sdk] -
 */
/**
 * @typedef CommandRun
 * @property {number} `duration` - The time taken to execute this command, in ms.
 * @property {boolean} [is_ci] - Whether or not typewriter is currently running in a CI environment or not.
 * @property {string} [token_method] - Where the API token was fetched from.
 * @property {TrackingPlan} [tracking_plan] - Metadata about the Tracking Plan that typewriter was fired on.
 * @property {Client} [client] - Metadata about the client that typewriter is generating.
 * @property {string} `command` - The command name that was started.
 */
/**
 * @typedef TrackingPlan1
 * @property {string} [workspace_slug] -
 * @property {string} [id] -
 */
/**
 * @typedef Client1
 * @property {string} [language] -
 * @property {string} [sdk] -
 */
/**
 * @typedef ErrorFired
 * @property {boolean} [is_ci] - Whether or not typewriter is currently running in a CI environment or not.
 * @property {string} [token_method] - Where the API token was fetched from.
 * @property {TrackingPlan1} [tracking_plan] - Metadata about the Tracking Plan that typewriter was fired on.
 * @property {boolean} `unexpected` - Whether or not this error was an expected (and therefore, properly handled) error.
 * @property {Client1} [client] - Metadata about the client that typewriter is generating.
 * @property {string} [command] - The command name that was started.
 * @property {Record<string, any>} `error` - The full error itself.
 * @property {string} `error_string` - The minimal error string itself.
 */

/**
 * Fired when a CLI command is started.
 *
 * @param {TrackMessage<CommandRun>} message - The analytics properties that will be sent to Segment.
 * @param {Function} [callback] - An optional callback called after a short timeout after the analytics
 * 		call is fired.
 */
export function commandRun(
	message: Segment.TrackMessage<CommandRun>,
	callback?: Segment.Callback
): void {
	const msg = withTypewriterContext({
		properties: {},
		...message,
		event: 'Command Run',
	})

	const schema = {
		$schema: 'http://json-schema.org/draft-07/schema#',
		required: ['properties'],
		type: 'object',
		labels: {},
		properties: {
			context: {},
			traits: {},
			properties: {
				properties: {
					duration: {
						description: 'The time taken to execute this command, in ms.',
						type: 'integer',
					},
					is_ci: {
						description:
							'Whether or not typewriter is currently running in a CI environment or not.',
						type: 'boolean',
					},
					token_method: {
						description: 'Where the API token was fetched from.',
						pattern: 'tokenCommand|env|file',
						type: 'string',
					},
					tracking_plan: {
						properties: {
							id: {
								description: '',
								type: 'string',
							},
							workspace_slug: {
								description: '',
								type: 'string',
							},
						},
						required: [],
						type: 'object',
						description:
							'Metadata about the Tracking Plan that typewriter was fired on.',
					},
					client: {
						required: [],
						type: 'object',
						description:
							'Metadata about the client that typewriter is generating.',
						properties: {
							language: {
								description: '',
								type: 'string',
							},
							sdk: {
								description: '',
								type: 'string',
							},
						},
					},
					command: {
						description: 'The command name that was started.',
						type: 'string',
					},
				},
				required: ['command', 'duration'],
				type: 'object',
			},
		},
		title: 'Command Run',
		description: 'Fired when a CLI command is started.',
	}
	validateAgainstSchema(msg, schema)

	const a = analytics()
	if (a) {
		a.track(msg, callback)
	} else {
		throw missingAnalyticsNodeError
	}
}
/**
 * Fired when an error is encountered.
 *
 * @param {TrackMessage<ErrorFired>} message - The analytics properties that will be sent to Segment.
 * @param {Function} [callback] - An optional callback called after a short timeout after the analytics
 * 		call is fired.
 */
export function errorFired(
	message: Segment.TrackMessage<ErrorFired>,
	callback?: Segment.Callback
): void {
	const msg = withTypewriterContext({
		properties: {},
		...message,
		event: 'Error Fired',
	})

	const schema = {
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		labels: {},
		properties: {
			context: {},
			traits: {},
			properties: {
				type: 'object',
				properties: {
					is_ci: {
						description:
							'Whether or not typewriter is currently running in a CI environment or not.',
						type: 'boolean',
					},
					token_method: {
						type: 'string',
						description: 'Where the API token was fetched from.',
						pattern: 'tokenCommand|env|file',
					},
					tracking_plan: {
						properties: {
							workspace_slug: {
								type: 'string',
								description: '',
							},
							id: {
								type: 'string',
								description: '',
							},
						},
						required: [],
						type: 'object',
						description:
							'Metadata about the Tracking Plan that typewriter was fired on.',
					},
					unexpected: {
						type: 'boolean',
						description:
							'Whether or not this error was an expected (and therefore, properly handled) error.',
					},
					client: {
						type: 'object',
						description:
							'Metadata about the client that typewriter is generating.',
						properties: {
							language: {
								description: '',
								type: 'string',
							},
							sdk: {
								type: 'string',
								description: '',
							},
						},
						required: [],
					},
					command: {
						description: 'The command name that was started.',
						type: 'string',
					},
					error: {
						description: 'The full error itself.',
						type: 'object',
					},
					error_string: {
						description: 'The minimal error string itself.',
						type: 'string',
					},
				},
				required: ['error', 'error_string', 'unexpected'],
			},
		},
		required: ['properties'],
		title: 'Error Fired',
		description: 'Fired when an error is encountered.',
	}
	validateAgainstSchema(msg, schema)

	const a = analytics()
	if (a) {
		a.track(msg, callback)
	} else {
		throw missingAnalyticsNodeError
	}
}

const clientAPI = {
	/**
	 * Updates the run-time configuration of this Typewriter client.
	 * This function must be called with a configured analytics-node instance before firing
	 * any analytics calls, or else a `missingAnalyticsNodeError` error will be thrown.
	 *
	 * @param {TypewriterOptions} options - the options to upsert
	 *
	 * @typedef {Object} TypewriterOptions
	 * @property {Segment.AnalyticsNode} analytics - Underlying analytics instance where analytics
	 * 		calls are forwarded on to.
	 * @property {Function} [onViolation] - Handler fired when if an event does not match its spec. This handler does not fire in
	 * 		production mode, because it requires inlining the full JSON Schema spec for each event in your Tracking Plan. By default,
	 * 		it will throw errors if NODE_ENV="test" so that tests will fail if a message does not match the spec. Otherwise, errors
	 * 		will be logged to stderr.
	 */
	setTypewriterOptions,
	/**
	 * Fired when a CLI command is started.
	 *
	 * @param {TrackMessage<CommandRun>} message - The analytics properties that will be sent to Segment.
	 * @param {Function} [callback] - An optional callback called after a short timeout after the analytics
	 * 		call is fired.
	 */
	commandRun,
	/**
	 * Fired when an error is encountered.
	 *
	 * @param {TrackMessage<ErrorFired>} message - The analytics properties that will be sent to Segment.
	 * @param {Function} [callback] - An optional callback called after a short timeout after the analytics
	 * 		call is fired.
	 */
	errorFired,
}

export default new Proxy<typeof clientAPI>(clientAPI, {
	get(target, method) {
		if (typeof method === 'string' && target.hasOwnProperty(method)) {
			return target[method as keyof typeof clientAPI]
		}

		return () => {
			console.warn(`⚠️  You made an analytics call (${String(
				method
			)}) that can't be found. Either:
    a) Re-generate your typewriter client: \`npm run typewriter\`
    b) Add it to your Tracking Plan: https://app.segment.com/TODO/tracking-plans/TODO`)
			const a = analytics()
			if (a) {
				a.track(
					withTypewriterContext({
						event: 'Unknown Analytics Call Fired',
						properties: {
							method,
						},
						userId: 'typewriter',
					})
				)
			}
		}
	},
})
